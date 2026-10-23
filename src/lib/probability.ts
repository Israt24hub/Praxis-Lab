/*
 * Conditional probability (a screening test) and the spread of measured scores
 * for the "Probability and statistics" lab. Pure functions, shared with the tests.
 */
import { mulberry32 } from "./rng.ts";

/** Counts out of `population` people for a test with the given prevalence, sensitivity and specificity. */
export function screening(prevalence: number, sensitivity: number, specificity: number, population = 1000) {
  const sick = prevalence * population;
  const well = population - sick;
  const tp = sensitivity * sick;
  const fn = sick - tp;
  const tn = specificity * well;
  const fp = well - tn;
  return {
    tp,
    fp,
    fn,
    tn,
    /** P(condition | positive test), by Bayes' rule. */
    ppv: tp / (tp + fp),
    /** P(no condition | negative test). */
    npv: tn / (tn + fn),
    positives: tp + fp,
  };
}

/**
 * Simulate measuring a model's accuracy on `n` test examples, `reps` times, when
 * its true accuracy is `p`. Each run draws a fresh test set (seeded, so repeatable).
 */
export function simulateAccuracy(p: number, n: number, reps: number, seed = 1) {
  const rand = mulberry32(seed);
  const scores: number[] = [];
  for (let r = 0; r < reps; r++) {
    let correct = 0;
    for (let i = 0; i < n; i++) if (rand() < p) correct++;
    scores.push(correct / n);
  }
  return scores;
}

export const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Standard deviation; ddof = 1 gives the sample standard deviation, as most reports use. */
export function sd(xs: number[], ddof = 0) {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - ddof));
}

/** Standard error of an accuracy measured on n independent examples. */
export const accuracySE = (p: number, n: number) => Math.sqrt((p * (1 - p)) / n);

/** Fraction of values within ±k of the centre. */
export const within = (xs: number[], centre: number, k: number) => xs.filter((x) => Math.abs(x - centre) <= k + 1e-12).length / xs.length;
