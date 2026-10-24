/*
 * The "Gradient descent and optimizers" lab: SGD, momentum and Adam (PyTorch's update
 * rules, from nn.ts) racing on two-parameter loss surfaces, and mini-batch SGD with
 * learning-rate schedules training a small linear regression. Seeded and deterministic.
 */
import { mulberry32, shuffled } from "./rng.ts";
import { gaussian, makeOptimizer, type OptimizerConfig, type OptimizerName } from "./nn.ts";
import { type P, type Surface, surfaces } from "./optimize.ts";

/* ---------- The race ---------- */

/** A curved, narrow valley (a scaled Rosenbrock function) with its minimum at (1, 1). */
export const banana: Surface = {
  id: "banana",
  label: "Curved valley",
  f: ([a, b]) => (1 - a) ** 2 + 5 * (b - a * a) ** 2,
  grad: ([a, b]) => [-2 * (1 - a) - 20 * a * (b - a * a), 10 * (b - a * a)],
  minima: [[1, 1]],
  range: { w1: [-2, 2], w2: [-1, 3] },
  start: [-1.5, 2.5],
};

export const raceSurfaces: Surface[] = [surfaces.find((s) => s.id === "valley")!, banana];

export interface RaceRun {
  path: P[];
  losses: number[];
  diverged: boolean;
  /** First step at which the loss is within 0.001 of the minimum, or −1. */
  reached: number;
}

export function race(s: Surface, start: P, cfg: OptimizerConfig, steps: number): RaceRun {
  const w = [start[0], start[1]];
  const opt = makeOptimizer(cfg);
  const fmin = Math.min(...s.minima.map((m) => s.f(m)));
  const path: P[] = [[w[0], w[1]]];
  const losses = [s.f([w[0], w[1]])];
  let diverged = false;
  for (let t = 0; t < steps; t++) {
    const g = s.grad([w[0], w[1]]);
    opt.step([w], [g]);
    const L = s.f([w[0], w[1]]);
    path.push([w[0], w[1]]);
    losses.push(L);
    if (!Number.isFinite(L) || L > 1e6) {
      diverged = true;
      break;
    }
  }
  return { path, losses, diverged, reached: diverged ? -1 : losses.findIndex((l) => l - fmin < 1e-3) };
}

/* ---------- Mini-batch SGD on a linear regression ---------- */

export const REG_N = 256;
export const REG_SEED = 11;

/** 256 invented examples: y = 3x₁ − 2x₂ + 0.5 + noise (standard deviation 0.5). */
export function regressionData() {
  const normal = gaussian(mulberry32(REG_SEED));
  const X: number[][] = [];
  const y: number[] = [];
  for (let i = 0; i < REG_N; i++) {
    const x1 = normal();
    const x2 = normal();
    X.push([x1, x2]);
    y.push(3 * x1 - 2 * x2 + 0.5 + 0.5 * normal());
  }
  return { X, y };
}

export type Schedule = "constant" | "step" | "cosine";

/** Learning rate at step t of T: constant, ÷10 at the halfway point, or cosine decay to 0. */
export function scheduledLr(base: number, schedule: Schedule, t: number, T: number) {
  if (schedule === "step") return t < T / 2 ? base : base / 10;
  if (schedule === "cosine") return 0.5 * base * (1 + Math.cos((Math.PI * t) / T));
  return base;
}

const fullLoss = (X: number[][], y: number[], w: number[]) => {
  let s = 0;
  for (let i = 0; i < y.length; i++) {
    const e = w[0] * X[i][0] + w[1] * X[i][1] + w[2] - y[i];
    s += e * e;
  }
  return s / y.length;
};

/** The lowest possible training loss, from the least-squares solution (normal equations). */
export function bestRegressionLoss(X: number[][], y: number[]) {
  // Solve (AᵀA)w = Aᵀy for A = [x₁, x₂, 1] by Gaussian elimination.
  const A = Array.from({ length: 3 }, () => new Array(4).fill(0));
  X.forEach((x, i) => {
    const row = [x[0], x[1], 1];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) A[r][c] += row[r] * row[c];
      A[r][3] += row[r] * y[i];
    }
  });
  for (let k = 0; k < 3; k++) {
    for (let r = k + 1; r < 3; r++) {
      const f = A[r][k] / A[k][k];
      for (let c = k; c < 4; c++) A[r][c] -= f * A[k][c];
    }
  }
  const w = [0, 0, 0];
  for (let k = 2; k >= 0; k--) {
    let s = A[k][3];
    for (let j = k + 1; j < 3; j++) s -= A[k][j] * w[j];
    w[k] = s / A[k][k];
  }
  return { w, loss: fullLoss(X, y, w) };
}

export interface SgdRun {
  /** Full-data loss before training and after every step. */
  losses: number[];
  stepsPerEpoch: number;
  diverged: boolean;
  w: number[];
}

/**
 * Mini-batch training of y ≈ w₁x₁ + w₂x₂ + b from w = 0: each epoch shuffles the data
 * (seeded) and takes one step per batch of the mean-squared-error gradient.
 */
export function trainRegression(batch: number, lr: number, epochs: number, schedule: Schedule, name: OptimizerName = "sgd", seed = 5): SgdRun {
  const { X, y } = regressionData();
  const rand = mulberry32(seed);
  const w = [0, 0, 0];
  const opt = makeOptimizer({ name, lr });
  const stepsPerEpoch = Math.ceil(REG_N / batch);
  const T = stepsPerEpoch * epochs;
  const losses = [fullLoss(X, y, w)];
  const order = Array.from({ length: REG_N }, (_, i) => i);
  let t = 0;
  for (let e = 0; e < epochs; e++) {
    const idx = shuffled(order, rand);
    for (let s = 0; s < stepsPerEpoch; s++) {
      const rows = idx.slice(s * batch, (s + 1) * batch);
      const g = [0, 0, 0];
      for (const i of rows) {
        const err = w[0] * X[i][0] + w[1] * X[i][1] + w[2] - y[i];
        g[0] += (2 * err * X[i][0]) / rows.length;
        g[1] += (2 * err * X[i][1]) / rows.length;
        g[2] += (2 * err) / rows.length;
      }
      opt.step([w], [g], scheduledLr(lr, schedule, t, T));
      t++;
      const L = fullLoss(X, y, w);
      losses.push(L);
      if (!Number.isFinite(L) || L > 1e6) return { losses, stepsPerEpoch, diverged: true, w };
    }
  }
  return { losses, stepsPerEpoch, diverged: false, w };
}
