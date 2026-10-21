/*
 * The browser labs must reproduce the numbers their lessons state. Reference values
 * were computed independently with NumPy and scikit-learn.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { noisyWave, SMALL_TRAIN } from "../src/content/datasets/noisy-wave.ts";
import { extraStudent, passFail } from "../src/content/datasets/pass-fail.ts";
import { screeningScores } from "../src/content/datasets/screening-scores.ts";
import { students, studentColumns } from "../src/content/datasets/week8-students.ts";
import { accuracy, fitLine, fitLogistic, logLoss, sigmoid } from "../src/lib/classification.ts";
import { averagePrecision, confusionAt, rates, rocAuc } from "../src/lib/metrics.ts";
import { fitPolynomial, meanSquaredError } from "../src/lib/polyfit.ts";

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
