/*
 * Simulations for "Training, validation and testing".
 *
 * 1. Reusing the test set. Every row has a random yes/no label and 1,000 random
 *    yes/no features that have nothing to do with the label. Candidate model i
 *    predicts "yes" whenever feature i is "yes". So every model's true accuracy is
 *    exactly 50%, and any score above that is luck. The lab tries M models, picks
 *    the one with the best score on either the validation set or the test set, and
 *    reports its test score next to its score on a large fresh set.
 *
 * 2. Splitting grouped and time-ordered records: random, grouped and time-based
 *    splits of 24 clinic visits by 8 patients, and how each one can leak.
 */
import { hashBit, mulberry32, shuffled } from "./rng.ts";

/** The lab starts with this dataset; "Draw a new dataset" moves to the next seed. */
export const SELECTION_SEED = 28;
export const MAX_MODELS = 1000;
export const VALIDATION_ROWS = 200;
export const FRESH_ROWS = 5000;

/** Row offsets keep the validation, test and fresh rows distinct. */
const OFFSET = { validation: 0, test: 1_000_000, fresh: 2_000_000 } as const;
type SetName = keyof typeof OFFSET;

/** Accuracy of model i on the first `size` rows of a set: how often feature i equals the label. */
export function modelAccuracy(model: number, set: SetName, size: number, seed = SELECTION_SEED) {
  let correct = 0;
  for (let r = 0; r < size; r++) {
    const row = OFFSET[set] + r;
    if (hashBit(seed, model, row) === hashBit(seed, -1, row)) correct++;
  }
  return correct / size;
}

export interface SelectionResult {
  /** Accuracy of every model tried on the set used to choose. */
  choosingScores: number[];
  winner: number;
  winnerValidation: number;
  winnerTest: number;
  winnerFresh: number;
}

/** Try `models` candidates, choose the best on `chooseOn`, and score the winner everywhere. */
export function selectModel(models: number, testRows: number, chooseOn: "validation" | "test", seed = SELECTION_SEED): SelectionResult {
  const size = chooseOn === "validation" ? VALIDATION_ROWS : testRows;
  const choosingScores = Array.from({ length: models }, (_, i) => modelAccuracy(i, chooseOn, size, seed));
  let winner = 0;
  choosingScores.forEach((s, i) => {
    if (s > choosingScores[winner]) winner = i;
  });
  return {
    choosingScores,
    winner,
    winnerValidation: modelAccuracy(winner, "validation", VALIDATION_ROWS, seed),
    winnerTest: modelAccuracy(winner, "test", testRows, seed),
    winnerFresh: modelAccuracy(winner, "fresh", FRESH_ROWS, seed),
  };
}

/* ---------- Splitting grouped, time-ordered records ---------- */

export interface Visit {
  id: number;
  patient: string;
  /** Day of the year the visit happened (1 = 1 January). */
  day: number;
}

/** 8 patients, 3 visits each, spread over January to June. Invented. */
export const visits: Visit[] = (() => {
  const rand = mulberry32(11);
  const out: Visit[] = [];
  "ABCDEFGH".split("").forEach((patient) => {
    const days = Array.from({ length: 3 }, () => 1 + Math.floor(rand() * 180)).sort((a, b) => a - b);
    days.forEach((day) => out.push({ id: 0, patient, day }));
  });
  return out
    .sort((a, b) => a.day - b.day || a.patient.localeCompare(b.patient))
    .map((v, i) => ({ ...v, id: i + 1 }));
})();

export type SplitKind = "random" | "grouped" | "time";

/** Which visits go to the test set (6 of 24, a quarter) under each kind of split. */
export function splitVisits(kind: SplitKind, seed = 3): Set<number> {
  if (kind === "random") return new Set(shuffled(visits.map((v) => v.id), mulberry32(seed)).slice(0, 6));
  if (kind === "grouped") {
    const patients = shuffled("ABCDEFGH".split(""), mulberry32(seed)).slice(0, 2);
    return new Set(visits.filter((v) => patients.includes(v.patient)).map((v) => v.id));
  }
  return new Set(visits.slice(-6).map((v) => v.id)); // visits are sorted by day
}

/** What a split mixes between training and test. */
export function splitChecks(test: Set<number>) {
  const train = visits.filter((v) => !test.has(v.id));
  const testRows = visits.filter((v) => test.has(v.id));
  const trainPatients = new Set(train.map((v) => v.patient));
  const sharedPatients = [...new Set(testRows.map((v) => v.patient))].filter((p) => trainPatients.has(p));
  const lastTrainDay = Math.max(...train.map((v) => v.day));
  const testBeforeLastTrain = testRows.filter((v) => v.day < lastTrainDay).length;
  return { sharedPatients, testBeforeLastTrain, lastTrainDay, testSize: testRows.length };
}
