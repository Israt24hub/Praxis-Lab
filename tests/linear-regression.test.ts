/*
 * The browser training lab must reproduce the values the lesson states.
 * These are the same functions the lab runs.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { studyHours } from "../src/content/datasets/study-hours.ts";
import { gdStep, leastSquares, meanSquaredError, scalingOf, standardise, toOriginalUnits } from "../src/lib/linear-regression.ts";

const train = studyHours.filter((r) => r.split === "train").map((r) => ({ x: r.hours, y: r.score }));
const test = studyHours.filter((r) => r.split === "test").map((r) => ({ x: r.hours, y: r.score }));

function train_(lr: number, epochs: number, scaled: boolean) {
  const s = scalingOf(train);
  const pts = scaled ? standardise(train, s) : train;
  let st = { w: 0, b: 0, epoch: 0 };
  for (let i = 0; i < epochs; i++) st = gdStep(st, pts, lr);
  return toOriginalUnits(st.w, st.b, scaled ? s : null);
}

describe("study-hours lab", () => {
  it("has 12 training and 3 test rows", () => {
    assert.equal(train.length, 12);
    assert.equal(test.length, 3);
  });

  it("least squares gives the lesson's w and b, and test MSE about 6.80", () => {
    const { w, b } = leastSquares(train);
    assert.equal(w.toFixed(2), "6.08");
    assert.equal(b.toFixed(2), "34.20");
    assert.equal(meanSquaredError(w, b, test).toFixed(2), "6.80");
    assert.equal(meanSquaredError(w, b, train).toFixed(2), "6.04");
  });

  it("gradient descent on the raw feature converges at 0.03 and diverges at 0.05", () => {
    const ok = train_(0.03, 1000, false);
    assert.equal(ok.w.toFixed(2), "6.08");
    const bad = train_(0.05, 200, false);
    assert.ok(!Number.isFinite(meanSquaredError(bad.w, bad.b, train)) || meanSquaredError(bad.w, bad.b, train) > 1e7);
  });

  it("standardized gradient descent reaches MSE < 6.05 within 30 epochs at 0.1", () => {
    const m = train_(0.1, 30, true);
    assert.ok(meanSquaredError(m.w, m.b, train) < 6.05);
  });

  it("the mean baseline has test MSE about 125.6", () => {
    const mean = train.reduce((s, p) => s + p.y, 0) / train.length;
    assert.equal(meanSquaredError(0, mean, test).toFixed(1), "125.6");
  });
});
