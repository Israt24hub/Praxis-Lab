/*
 * Small neural-network maths for the Deep Learning labs: activation functions, dense
 * layers with forward and backward passes, losses, and the SGD, momentum and Adam
 * update rules exactly as PyTorch defines them. Pure and deterministic, so the lessons
 * can quote its numbers and the tests can check them.
 *
 * Conventions: a batch is an array of rows (examples); a layer's weight is stored
 * in × out, so a layer computes Z = X·W + b, as in NumPy code. (PyTorch's nn.Linear
 * stores the transpose, out × in.)
 */
import { mulberry32 } from "./rng.ts";

export type Activation = "linear" | "relu" | "sigmoid" | "tanh" | "gelu";
export type Matrix = number[][];

/* ---------- Activations ---------- */

export const sigmoid = (z: number) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));

/**
 * The complementary error function, by the Chebyshev fit in Numerical Recipes (fractional
 * error below 1.2 × 10⁻⁷ everywhere) — ample for the 4-decimal values the lessons show.
 */
export function erfc(x: number) {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? r : 2 - r;
}
export const erf = (x: number) => 1 - erfc(x);
const SQRT2 = Math.SQRT2;
const INV_SQRT_2PI = 1 / Math.sqrt(2 * Math.PI);

/** Each activation and its derivative, as functions of the pre-activation z. */
export const activations: Record<Activation, { label: string; f: (z: number) => number; df: (z: number) => number }> = {
  linear: { label: "none (linear)", f: (z) => z, df: () => 1 },
  relu: { label: "ReLU", f: (z) => (z > 0 ? z : 0), df: (z) => (z > 0 ? 1 : 0) },
  sigmoid: {
    label: "sigmoid",
    f: sigmoid,
    df: (z) => {
      const s = sigmoid(z);
      return s * (1 - s);
    },
  },
  tanh: {
    label: "tanh",
    f: Math.tanh,
    df: (z) => 1 - Math.tanh(z) ** 2,
  },
  gelu: {
    label: "GELU",
    // PyTorch's default (exact) GELU: z · Φ(z), with Φ the standard normal CDF.
    f: (z) => 0.5 * z * (1 + erf(z / SQRT2)),
    df: (z) => 0.5 * (1 + erf(z / SQRT2)) + z * INV_SQRT_2PI * Math.exp(-0.5 * z * z),
  },
};

/* ---------- Random numbers ---------- */

/** Standard normal samples by the Box–Muller transform, from a seeded uniform generator. */
export function gaussian(rand: () => number) {
  let spare: number | null = null;
  return () => {
    if (spare !== null) {
      const s = spare;
      spare = null;
      return s;
    }
    let u = rand();
    while (u <= 1e-12) u = rand();
    const v = rand();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  };
}

/* ---------- Dense layers ---------- */

export interface Layer {
  /** in × out, row-major: W[i][j] connects input i to unit j. */
  W: Matrix;
  b: number[];
  act: Activation;
}
export type Net = Layer[];

/**
 * A network with PyTorch's default initialisation for nn.Linear: weights and biases drawn
 * uniformly from ±1/√(fan-in). `acts` gives the activation of every layer, output included.
 */
export function initNet(sizes: number[], acts: Activation[], seed: number): Net {
  const rand = mulberry32(seed);
  const net: Net = [];
  for (let l = 0; l + 1 < sizes.length; l++) {
    const nIn = sizes[l];
    const nOut = sizes[l + 1];
    const bound = 1 / Math.sqrt(nIn);
    const W = Array.from({ length: nIn }, () => Array.from({ length: nOut }, () => (2 * rand() - 1) * bound));
    const b = Array.from({ length: nOut }, () => (2 * rand() - 1) * bound);
    net.push({ W, b, act: acts[l] });
  }
  return net;
}

export const cloneNet = (net: Net): Net => net.map((L) => ({ W: L.W.map((r) => r.slice()), b: L.b.slice(), act: L.act }));

export const countParams = (net: Net) => net.reduce((s, L) => s + L.W.length * L.b.length + L.b.length, 0);

/** X·W + b for a batch. */
export function affine(X: Matrix, W: Matrix, b: number[]): Matrix {
  const nOut = b.length;
  return X.map((x) => {
    const z = b.slice();
    for (let i = 0; i < x.length; i++) {
      const xi = x[i];
      if (xi === 0) continue;
      const Wi = W[i];
      for (let j = 0; j < nOut; j++) z[j] += xi * Wi[j];
    }
    return z;
  });
}

export interface Trace {
  /** inputs[l] is what layer l received; inputs[0] is X. */
  inputs: Matrix[];
  /** Pre-activations of every layer. */
  zs: Matrix[];
  /** Outputs of every layer, after activation (and dropout, when used). */
  outs: Matrix[];
  /** Dropout masks (already scaled by 1/(1 − p)), when dropout was applied. */
  masks: (Matrix | null)[];
}

/**
 * Forward pass. `dropout` gives a drop probability per layer (applied to that layer's
 * output, never to the last layer's); it needs `rand`. Inverted dropout, as in PyTorch:
 * kept units are scaled by 1/(1 − p) during training, and nothing changes at evaluation.
 */
export function forward(net: Net, X: Matrix, dropout?: number[], rand?: () => number): Trace {
  const inputs: Matrix[] = [];
  const zs: Matrix[] = [];
  const outs: Matrix[] = [];
  const masks: (Matrix | null)[] = [];
  let A = X;
  net.forEach((L, l) => {
    inputs.push(A);
    const Z = affine(A, L.W, L.b);
    const f = activations[L.act].f;
    let out = Z.map((row) => row.map(f));
    let mask: Matrix | null = null;
    const p = dropout?.[l] ?? 0;
    if (p > 0 && l < net.length - 1 && rand) {
      mask = out.map((row) => row.map(() => (rand() < p ? 0 : 1 / (1 - p))));
      out = out.map((row, i) => row.map((v, j) => v * mask![i][j]));
    }
    zs.push(Z);
    outs.push(out);
    masks.push(mask);
    A = out;
  });
  return { inputs, zs, outs, masks };
}

export const predict = (net: Net, X: Matrix) => forward(net, X).outs[net.length - 1];

export interface Grad {
  dW: Matrix;
  db: number[];
}

/**
 * Backward pass. `dOut` is ∂L/∂(last layer's output), one row per example. Returns the
 * gradient of every layer's W and b, and ∂L/∂(pre-activation) of every layer.
 */
export function backward(net: Net, trace: Trace, dOut: Matrix): { grads: Grad[]; dZ: Matrix[] } {
  const grads: Grad[] = new Array(net.length);
  const dZs: Matrix[] = new Array(net.length);
  let dA = dOut;
  for (let l = net.length - 1; l >= 0; l--) {
    const L = net[l];
    const df = activations[L.act].df;
    const mask = trace.masks[l];
    const Z = trace.zs[l];
    const dZ = Z.map((row, i) => row.map((z, j) => dA[i][j] * (mask ? mask[i][j] : 1) * df(z)));
    const A = trace.inputs[l];
    const nIn = L.W.length;
    const nOut = L.b.length;
    const dW = Array.from({ length: nIn }, () => new Array(nOut).fill(0));
    const db = new Array(nOut).fill(0);
    for (let n = 0; n < A.length; n++) {
      for (let j = 0; j < nOut; j++) {
        const g = dZ[n][j];
        if (g === 0) continue;
        db[j] += g;
        for (let i = 0; i < nIn; i++) dW[i][j] += A[n][i] * g;
      }
    }
    grads[l] = { dW, db };
    dZs[l] = dZ;
    if (l > 0) dA = dZ.map((row) => L.W.map((Wi) => Wi.reduce((s, w, j) => s + w * row[j], 0)));
  }
  return { grads, dZ: dZs };
}

/* ---------- Losses (mean over the batch, as PyTorch's default reduction) ---------- */

export interface LossResult {
  loss: number;
  /** ∂loss/∂(network output), same shape as the output. */
  grad: Matrix;
}

/** Binary cross-entropy on logits (BCEWithLogitsLoss), computed stably. Output shape n × 1. */
export function bceWithLogits(logits: Matrix, y: number[]): LossResult {
  const n = y.length;
  let loss = 0;
  const grad = logits.map(([z], i) => {
    loss += Math.max(z, 0) - z * y[i] + Math.log1p(Math.exp(-Math.abs(z)));
    return [(sigmoid(z) - y[i]) / n];
  });
  return { loss: loss / n, grad };
}

/** Mean squared error over every element (MSELoss). */
export function mse(pred: Matrix, target: Matrix): LossResult {
  const count = pred.length * pred[0].length;
  let loss = 0;
  const grad = pred.map((row, i) =>
    row.map((p, j) => {
      const e = p - target[i][j];
      loss += e * e;
      return (2 * e) / count;
    }),
  );
  return { loss: loss / count, grad };
}

export function softmax(z: number[]) {
  const m = Math.max(...z);
  const e = z.map((v) => Math.exp(v - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}

/** log Σ exp(z), without overflow. */
export function logSumExp(z: number[]) {
  const m = Math.max(...z);
  return m + Math.log(z.reduce((s, v) => s + Math.exp(v - m), 0));
}

/** Softmax cross-entropy on logits with integer class labels (CrossEntropyLoss). */
export function crossEntropy(logits: Matrix, labels: number[]): LossResult {
  const n = labels.length;
  let loss = 0;
  const grad = logits.map((z, i) => {
    loss += logSumExp(z) - z[labels[i]];
    return softmax(z).map((p, k) => (p - (k === labels[i] ? 1 : 0)) / n);
  });
  return { loss: loss / n, grad };
}

/* ---------- Optimizers (PyTorch's update rules) ---------- */

export type OptimizerName = "sgd" | "momentum" | "adam";

export interface OptimizerConfig {
  name: OptimizerName;
  lr: number;
  /** Momentum coefficient for "momentum" (PyTorch SGD with momentum; default 0.9). */
  momentum?: number;
  betas?: [number, number];
  eps?: number;
  /** L2 weight decay added to the gradient (SGD), or decoupled (AdamW) when `decoupled`. */
  weightDecay?: number;
  decoupled?: boolean;
}

/**
 * An optimizer over a fixed list of parameter arrays (each updated in place).
 * - SGD: w ← w − η·g
 * - momentum: v ← μ·v + g, w ← w − η·v (PyTorch's form; v starts as the first gradient)
 * - Adam: m ← β₁m + (1 − β₁)g, s ← β₂s + (1 − β₂)g², w ← w − η·m̂/(√ŝ + ε), with bias correction
 * Weight decay adds λ·w to the gradient (SGD, Adam) or shrinks w by η·λ first (AdamW).
 */
export function makeOptimizer(cfg: OptimizerConfig) {
  const mu = cfg.momentum ?? 0.9;
  const [b1, b2] = cfg.betas ?? [0.9, 0.999];
  const eps = cfg.eps ?? 1e-8;
  const wd = cfg.weightDecay ?? 0;
  const state = new Map<number[], { m: number[]; v: number[] }>();
  let t = 0;
  return {
    /** One update; `lr` overrides the configured learning rate (for schedules). */
    step(params: number[][], grads: number[][], lr = cfg.lr) {
      t++;
      params.forEach((p, k) => {
        const g = grads[k];
        let s = state.get(p);
        if (!s) {
          s = { m: new Array(p.length).fill(0), v: new Array(p.length).fill(0) };
          state.set(p, s);
        }
        for (let i = 0; i < p.length; i++) {
          let gi = g[i];
          if (wd && cfg.decoupled) p[i] -= lr * wd * p[i];
          else if (wd) gi += wd * p[i];
          if (cfg.name === "sgd") p[i] -= lr * gi;
          else if (cfg.name === "momentum") {
            s.m[i] = t === 1 ? gi : mu * s.m[i] + gi;
            p[i] -= lr * s.m[i];
          } else {
            s.m[i] = b1 * s.m[i] + (1 - b1) * gi;
            s.v[i] = b2 * s.v[i] + (1 - b2) * gi * gi;
            const mHat = s.m[i] / (1 - b1 ** t);
            const vHat = s.v[i] / (1 - b2 ** t);
            p[i] -= (lr * mHat) / (Math.sqrt(vHat) + eps);
          }
        }
      });
    },
  };
}

/** The parameter arrays of a network, in a fixed order (each W row, then b, per layer). */
export const paramArrays = (net: Net): number[][] => net.flatMap((L) => [...L.W, L.b]);
export const gradArrays = (grads: Grad[]): number[][] => grads.flatMap((g) => [...g.dW, g.db]);

/** Accuracy of logits for binary labels (logit > 0 means class 1). */
export const binaryAccuracy = (logits: Matrix, y: number[]) => logits.reduce((s, [z], i) => s + ((z > 0 ? 1 : 0) === y[i] ? 1 : 0), 0) / y.length;
