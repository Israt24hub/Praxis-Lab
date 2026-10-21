/*
 * One-feature logistic and linear regression for the "Regression and classification"
 * lab. Pure functions, shared by the browser lab and the tests.
 */
import type { Point } from "./linear-regression";

export function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Unregularised logistic regression by Newton's method (iteratively reweighted
 * least squares). Exact for this small problem and converges in a few steps.
 * Labels must be 0 or 1 and not perfectly separable.
 */
export function fitLogistic(points: Point[], iterations = 50) {
  let w = 0;
  let b = 0;
  for (let it = 0; it < iterations; it++) {
    let gw = 0;
    let gb = 0;
    let hww = 0;
    let hwb = 0;
    let hbb = 0;
    for (const { x, y } of points) {
      const p = sigmoid(w * x + b);
      const r = p * (1 - p);
      gw += (p - y) * x;
      gb += p - y;
      hww += r * x * x;
      hwb += r * x;
      hbb += r;
    }
    const det = hww * hbb - hwb * hwb;
    if (Math.abs(det) < 1e-12) break;
    const dw = (hbb * gw - hwb * gb) / det;
    const db = (hww * gb - hwb * gw) / det;
    w -= dw;
    b -= db;
    if (Math.hypot(dw, db) < 1e-10) break;
  }
  return { w, b };
}

/** Mean binary cross-entropy (log loss). */
export function logLoss(w: number, b: number, points: Point[]) {
  const eps = 1e-12;
  let sum = 0;
  for (const { x, y } of points) {
    const p = Math.min(1 - eps, Math.max(eps, sigmoid(w * x + b)));
    sum += -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
  }
  return sum / points.length;
}

/** Ordinary least squares line, used here to show why a line is a poor classifier. */
export function fitLine(points: Point[]) {
  const n = points.length;
  const mx = points.reduce((s, p) => s + p.x, 0) / n;
  const my = points.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (const p of points) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
  }
  const w = sxy / sxx;
  return { w, b: my - w * mx };
}

export function accuracy(predict: (x: number) => 0 | 1, points: Point[]) {
  return points.filter((p) => predict(p.x) === p.y).length / points.length;
}
