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

/**
 * Logistic regression on two features with scikit-learn's default L2 penalty:
 * minimises  Σ log loss + (1 / 2C)·(w₁² + w₂²), the intercept not penalised
 * (LogisticRegression() with C = 1). Newton's method on three parameters.
 */
export function fitLogistic2(rows: { x: [number, number]; y: number }[], C = 1, iterations = 100) {
  let w1 = 0;
  let w2 = 0;
  let b = 0;
  for (let it = 0; it < iterations; it++) {
    // gradient g and Hessian H for (w1, w2, b)
    const g = [w1 / C, w2 / C, 0];
    const H = [
      [1 / C, 0, 0],
      [0, 1 / C, 0],
      [0, 0, 0],
    ];
    for (const { x, y } of rows) {
      const p = sigmoid(w1 * x[0] + w2 * x[1] + b);
      const r = p * (1 - p);
      const v = [x[0], x[1], 1];
      for (let i = 0; i < 3; i++) {
        g[i] += (p - y) * v[i];
        for (let j = 0; j < 3; j++) H[i][j] += r * v[i] * v[j];
      }
    }
    const step = solve3(H, g);
    w1 -= step[0];
    w2 -= step[1];
    b -= step[2];
    if (Math.hypot(...step) < 1e-12) break;
  }
  return { w: [w1, w2] as [number, number], b };
}

/** Solve a 3 × 3 linear system by Cramer's rule. */
function solve3(A: number[][], v: number[]) {
  const det = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const d = det(A);
  return [0, 1, 2].map((c) => det(A.map((row, r) => row.map((val, j) => (j === c ? v[r] : val)))) / d);
}
