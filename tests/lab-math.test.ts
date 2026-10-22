/*
 * The browser labs must reproduce the numbers their lessons state. Reference values
 * were computed independently with NumPy and scikit-learn.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { noisyWave, SMALL_TRAIN } from "../src/content/datasets/noisy-wave.ts";
import { extraStudent, passFail } from "../src/content/datasets/pass-fail.ts";
import { plantsTrain, plantsValidation } from "../src/content/datasets/plants.ts";
import { screeningScores } from "../src/content/datasets/screening-scores.ts";
import { effort, shoppers } from "../src/content/datasets/shoppers.ts";
import { studentJobs, studentJobsHeldOut } from "../src/content/datasets/student-jobs.ts";
import { students, studentColumns } from "../src/content/datasets/week8-students.ts";
import { accuracy, fitLine, fitLogistic, fitLogistic2, logLoss, sigmoid } from "../src/lib/classification.ts";
import { kmeans, kmeansBest, matchedAgreement, pca2, purity, standardize } from "../src/lib/kmeans.ts";
import { averagePrecision, confusionAt, rates, rocAuc } from "../src/lib/metrics.ts";
import { fitPolynomial, meanSquaredError } from "../src/lib/polyfit.ts";
import { selectModel, splitChecks, splitVisits, visits } from "../src/lib/selection.ts";
import { accuracyOf, countLeaves, fitForest, fitTree, forestPredict, forestProba, tracePath, treePredict } from "../src/lib/tree.ts";

const close = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b}`);

describe("week-8 students (features lesson)", () => {
  it("final exam separates pass and fail perfectly, which is why it is a leak", () => {
    const passFinal = students.filter((s) => s.passed === "yes").map((s) => Number(s.finalExam));
    const failFinal = students.filter((s) => s.passed === "no").map((s) => Number(s.finalExam));
    assert.ok(Math.min(...passFinal) > Math.max(...failFinal));
  });
  it("no column known in week 8 separates the classes perfectly", () => {
    for (const key of ["attendance", "assignments", "midterm"] as const) {
      const pass = students.filter((s) => s.passed === "yes").map((s) => Number(s[key]));
      const fail = students.filter((s) => s.passed === "no").map((s) => Number(s[key]));
      assert.ok(Math.min(...pass) <= Math.max(...fail), key);
    }
  });
  it("passes exactly when midterm + final ≥ 40, with a 60% pass rate", () => {
    for (const s of students) assert.equal(Number(s.midterm) + Number(s.finalExam) >= 40, s.passed === "yes", String(s.studentId));
    assert.equal(students.filter((s) => s.passed === "yes").length, 6);
  });
  it("marks only final_exam and passed as unknown in week 8", () => {
    assert.deepEqual(
      studentColumns.filter((c) => !c.knownAtPrediction).map((c) => c.key),
      ["finalExam", "passed"],
    );
  });
});

describe("pass/fail (classification lesson)", () => {
  const pts = passFail.map((r) => ({ x: r.hours, y: r.passed }));
  const withExtra = [...pts, { x: extraStudent.hours, y: extraStudent.passed }];

  it("logistic regression matches the unregularised fit", () => {
    const { w, b } = fitLogistic(pts);
    close(w, 1.1228, 1e-3, "w");
    close(b, -4.0604, 1e-3, "b");
    close(-b / w, 3.616, 1e-3, "boundary");
    close(logLoss(w, b, pts), 0.3673, 1e-3, "loss");
    assert.equal(accuracy((x) => (sigmoid(w * x + b) >= 0.5 ? 1 : 0), pts), 0.8);
    close(sigmoid(w * 4 + b), 0.606, 1e-3, "p at 4h");
  });

  it("the extra student barely moves logistic regression but drags the line", () => {
    const lg = fitLogistic(withExtra);
    close(-lg.b / lg.w, 3.616, 1e-2, "logistic boundary with extra");
    const line = fitLine(pts);
    const lineExtra = fitLine(withExtra);
    close((0.5 - line.b) / line.w, 3.752, 1e-3, "line boundary");
    close((0.5 - lineExtra.b) / lineExtra.w, 2.831, 1e-3, "line boundary with extra");
    assert.equal(accuracy((x) => (line.w * x + line.b >= 0.5 ? 1 : 0), pts), 0.8);
    assert.equal(accuracy((x) => (lineExtra.w * x + lineExtra.b >= 0.5 ? 1 : 0), pts), 0.75);
    close(line.w * 9 + line.b, 1.251, 1e-3, "line output above 1");
  });
});

describe("noisy wave (overfitting lesson)", () => {
  const xs = noisyWave.trainX.slice(0, SMALL_TRAIN);
  const ys = noisyWave.trainY.slice(0, SMALL_TRAIN);
  const val = (fit: ReturnType<typeof fitPolynomial>) => meanSquaredError(fit, noisyWave.valX, noisyWave.valY);

  it("has 48 training-pool and 30 validation points", () => {
    assert.equal(noisyWave.trainX.length, 48);
    assert.equal(noisyWave.valX.length, 30);
  });

  it("reproduces the small-data errors by degree", () => {
    const expected: Array<[number, number, number]> = [
      [1, 0.2786, 0.2483],
      [3, 0.0288, 0.059],
      [9, 0.0072, 75.174],
    ];
    for (const [d, tr, va] of expected) {
      const fit = fitPolynomial(xs, ys, d);
      close(meanSquaredError(fit, xs, ys), tr, 1e-3, `train d${d}`);
      close(val(fit), va, Math.max(1e-3, va * 1e-3), `val d${d}`);
    }
    const d11 = fitPolynomial(xs, ys, 11);
    assert.ok(meanSquaredError(d11, xs, ys) < 1e-8, "degree 11 interpolates 12 points");
    close(val(d11), 856827, 856827 * 2e-3, "val d11");
  });

  it("picks degree 3 on validation with 12 points", () => {
    const vals = Array.from({ length: 12 }, (_, d) => val(fitPolynomial(xs, ys, d)));
    assert.equal(vals.indexOf(Math.min(...vals)), 3);
  });

  it("is tamed by a penalty or by more data", () => {
    close(val(fitPolynomial(xs, ys, 11, 0.001)), 0.8533, 2e-3, "λ=0.001");
    close(val(fitPolynomial(xs, ys, 11, 0.1)), 0.1502, 1e-3, "λ=0.1");
    close(val(fitPolynomial(noisyWave.trainX, noisyWave.trainY, 11)), 0.0508, 1e-3, "48 points");
  });
});

describe("screening scores (metrics lesson)", () => {
  const { positive, negative } = screeningScores;

  it("has 20 positives and 180 negatives", () => {
    assert.equal(positive.length, 20);
    assert.equal(negative.length, 180);
  });

  it("matches scikit-learn's ROC-AUC and average precision", () => {
    close(rocAuc(positive, negative), 0.9143, 1e-4, "roc auc");
    close(averagePrecision(positive, negative), 0.577, 1e-3, "AP");
  });

  it("gives the lesson's confusion matrices", () => {
    assert.deepEqual(confusionAt(positive, negative, 50), { tp: 15, fp: 18, fn: 5, tn: 162 });
    const r70 = rates(confusionAt(positive, negative, 70));
    close(r70.accuracy, 0.92, 1e-9);
    close(r70.recall, 0.3, 1e-9);
    const r50 = rates(confusionAt(positive, negative, 50));
    close(r50.f1, 0.566, 1e-3);
    close(r50.accuracy, 0.885, 1e-9);
  });
});

/* ---------- Round 2: Path B lessons ---------- */

describe("students with jobs (supervised vs unsupervised lesson)", () => {
  const rows = studentJobs.map((r) => ({ x: [r.study, r.work] as [number, number], y: r.passed }));
  const model = fitLogistic2(rows);
  const predict = (r: { study: number; work: number }) => (sigmoid(model.w[0] * r.study + model.w[1] * r.work + model.b) >= 0.5 ? 1 : 0);

  it("has 40 training and 20 held-out students", () => {
    assert.equal(studentJobs.length, 40);
    assert.equal(studentJobsHeldOut.length, 20);
  });

  it("matches scikit-learn's LogisticRegression() coefficients", () => {
    close(model.w[0], 1.4064, 1e-3, "study");
    close(model.w[1], -0.0249, 1e-3, "work");
    close(model.b, -11.8081, 1e-3, "intercept");
    close(-(model.b + model.w[1] * 10) / model.w[0], 8.57, 1e-2, "boundary at 10 h work");
  });

  it("gets 38 of 40 training and 19 of 20 held-out students right", () => {
    assert.equal(studentJobs.filter((r) => predict(r) === r.passed).length, 38);
    assert.equal(studentJobsHeldOut.filter((r) => predict(r) === r.passed).length, 19);
  });

  it("k-means on both features finds the job split, not the pass split", () => {
    const km = kmeansBest(studentJobs.map((r) => [r.study, r.work]), 2);
    assert.equal(matchedAgreement(km.labels, studentJobs.map((r) => r.job)), 39);
    assert.equal(matchedAgreement(km.labels, studentJobs.map((r) => r.passed)), 22);
    const centres = km.centres.map((c) => c.map((v) => Math.round(v * 10) / 10)).sort((a, b) => a[0] - b[0]);
    assert.deepEqual(centres, [
      [9, 3.3],
      [9.9, 20.6],
    ]);
  });

  it("k-means on study hours alone finds the pass split", () => {
    const km = kmeansBest(studentJobs.map((r) => [r.study]), 2);
    assert.equal(matchedAgreement(km.labels, studentJobs.map((r) => r.passed)), 39);
    assert.equal(matchedAgreement(km.labels, studentJobs.map((r) => r.job)), 22);
  });
});

describe("plants (trees and ensembles lesson)", () => {
  const X = plantsTrain.map((p) => [p.light, p.water]);
  const y = plantsTrain.map((p) => p.thrives);
  const VX = plantsValidation.map((p) => [p.light, p.water]);
  const vy = plantsValidation.map((p) => p.thrives);
  const scores = (d: number) => {
    const t = fitTree(X, y, { maxDepth: d });
    return [accuracyOf((x) => treePredict(t, x), X, y), accuracyOf((x) => treePredict(t, x), VX, vy), countLeaves(t)];
  };

  it("has 200 + 200 plants, 73 of the training plants thriving", () => {
    assert.equal(X.length, 200);
    assert.equal(VX.length, 200);
    assert.equal(y.reduce<number>((a, b) => a + b, 0), 73);
  });

  it("reproduces the depth table (depths 1–5 identical to scikit-learn)", () => {
    const expected: Array<[number, number, number, number]> = [
      [1, 0.635, 0.585, 2],
      [3, 0.715, 0.655, 5],
      [5, 0.89, 0.81, 13],
      [6, 0.93, 0.84, 22],
      [8, 0.985, 0.83, 37],
      [10, 0.995, 0.83, 40],
    ];
    for (const [d, tr, va, leaves] of expected) assert.deepEqual(scores(d), [tr, va, leaves], `depth ${d}`);
  });

  it("puts water ≤ 8.45 at the root and validation peaks at depth 6", () => {
    const t = fitTree(X, y, { maxDepth: 1 });
    assert.equal(t.feature, 1);
    assert.equal(t.threshold, 8.45);
    assert.deepEqual(t.right?.counts, [23, 0]);
    const vals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => scores(d)[1]);
    assert.equal(vals.indexOf(Math.max(...vals)) + 1, 6);
  });

  it("traces the plant with 8 h of light and 4 cups of water", () => {
    const t3 = tracePath(fitTree(X, y, { maxDepth: 3 }), [8, 4]);
    assert.deepEqual(t3.leaf.counts, [42, 56]);
    assert.equal(t3.steps.length, 3);
    const t6 = tracePath(fitTree(X, y, { maxDepth: 6 }), [8, 4]);
    assert.deepEqual(t6.leaf.counts, [26, 1]);
  });

  it("the forest beats every single tree on validation", () => {
    const f = fitForest(X, y, 100, 1);
    assert.equal(accuracyOf((x) => forestPredict(f, x), VX, vy), 0.885);
    assert.equal(accuracyOf((x) => forestPredict(f, x), X, y), 0.995);
    close(forestProba(f, [8, 4]), 0.64, 1e-9, "p(8, 4)");
    assert.equal(f.filter((t) => treePredict(t, [8, 4]) === 1).length, 64);
  });
});

describe("shoppers and effort (clustering lesson)", () => {
  const raw = shoppers.visits.map((v, i) => [v, shoppers.spend[i]]);
  const scaled = standardize(raw).rows;

  it("standardised k = 3 recovers the three groups exactly", () => {
    const km = kmeansBest(scaled, 3);
    assert.equal(purity(km.labels, shoppers.group), 60);
    close(km.inertia, 9.904, 1e-3, "inertia");
  });

  it("gives the elbow numbers on standardised data", () => {
    const inert = [1, 2, 3, 4, 5, 6].map((k) => kmeansBest(scaled, k).inertia);
    const expected = [120, 62.143, 9.904, 7.96, 6.277, 4.904];
    inert.forEach((v, i) => close(v, expected[i], 1e-3, `k=${i + 1}`));
  });

  it("raw best of 10 lumps the 40 low spenders together", () => {
    const km = kmeansBest(raw, 3);
    const sizes = [0, 1, 2].map((c) => km.labels.filter((l) => l === c).length).sort((a, b) => a - b);
    assert.deepEqual(sizes, [9, 11, 40]);
  });

  it("random start 1 on raw data converges in 6 moves to spend bands", () => {
    const r = kmeans(raw, 3, 1);
    assert.equal(r.iterations, 6);
    assert.equal(purity(r.labels, shoppers.group), 44);
  });

  it("random starts 7 and 10 on standardised data get stuck", () => {
    for (const s of [7, 10]) assert.ok(kmeans(scaled, 3, s).inertia > 60, `start ${s}`);
    assert.equal(kmeans(scaled, 3, 1).iterations, 2);
  });

  it("PCA matches scikit-learn, raw and standardised", () => {
    const rows = effort.hours.map((h, i) => [h, effort.questions[i]]);
    const p = pca2(rows);
    close(p.ratios[0], 0.9997, 1e-4, "raw ratio");
    close(p.components[0][0], 0.042, 1e-3, "raw weight hours");
    close(p.components[0][1], 0.9991, 1e-4, "raw weight questions");
    const s = pca2(standardize(rows).rows);
    close(s.ratios[0], 0.9623, 1e-4, "scaled ratio");
    close(s.components[0][0], Math.SQRT1_2, 1e-9, "scaled weight");
  });
});

describe("splits and test reuse (train/validation/test lesson)", () => {
  it("has 24 visits by 8 patients, 3 each", () => {
    assert.equal(visits.length, 24);
    for (const p of "ABCDEFGH") assert.equal(visits.filter((v) => v.patient === p).length, 3);
  });

  it("random, grouped and time splits mix what the lesson says", () => {
    const r = splitChecks(splitVisits("random"));
    assert.equal(r.sharedPatients.length, 6);
    assert.equal(r.testBeforeLastTrain, 6);
    const g = splitChecks(splitVisits("grouped"));
    assert.equal(g.sharedPatients.length, 0);
    assert.equal(g.testBeforeLastTrain, 6);
    const t = splitChecks(splitVisits("time"));
    assert.equal(t.sharedPatients.length, 5);
    assert.equal(t.testBeforeLastTrain, 0);
    for (const s of [r, g, t]) assert.equal(s.testSize, 6);
  });

  it("choosing on the test set inflates the reported score", () => {
    const onTest = selectModel(1000, 200, "test");
    close(onTest.winnerTest, 0.635, 1e-9);
    close(onTest.winnerFresh, 0.5096, 1e-9);
    const onVal = selectModel(1000, 200, "validation");
    close(onVal.winnerValidation, 0.63, 1e-9);
    close(onVal.winnerTest, 0.505, 1e-9);
    close(onVal.winnerFresh, 0.5012, 1e-9);
  });

  it("inflation grows with candidates and shrinks with test size", () => {
    close(selectModel(10, 200, "test").winnerTest, 0.57, 1e-9);
    close(selectModel(1000, 1000, "test").winnerTest, 0.551, 1e-9);
  });

  it("every model's fresh accuracy stays near 50%", () => {
    for (const m of [0, 1, 2, 500, 999]) {
      const r = selectModel(m + 1, 50, "test");
      assert.ok(Math.abs(r.winnerFresh - 0.5) < 0.03, `model set ${m + 1}`);
    }
  });
});
