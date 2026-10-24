/*
 * The "Regularization and training diagnostics" lab: a 1 → 64 (tanh) → 1 network fitted
 * to 15 noisy points, with weight decay, dropout and early stopping; and the
 * "overfit one batch" sanity check run with common bugs. Seeded and deterministic.
 *
 * trainCurve is a specialised, allocation-free version of the generic code in nn.ts, so the
 * lab stays responsive; trainCurveReference runs the generic code, and the tests check
 * that the two agree.
 */
import { mulberry32 } from "./rng.ts";
import {
  type Activation,
  backward,
  forward,
  gaussian,
  gradArrays,
  initNet,
  makeOptimizer,
  type Matrix,
  mse,
  type Net,
  paramArrays,
  predict,
} from "./nn.ts";

export const truth = (x: number) => Math.sin(2.5 * x);
export const NOISE_SD = 0.25;
export const REG_DATA_SEED = 21;

/** 15 training and 60 validation points from y = sin(2.5x) + noise, x in [−1, 1] (invented). */
export function curveData() {
  const rand = mulberry32(REG_DATA_SEED);
  const normal = gaussian(rand);
  const make = (n: number) => {
    const X: Matrix = [];
    const Y: Matrix = [];
    for (let i = 0; i < n; i++) {
      const x = -1 + 2 * rand();
      X.push([x]);
      Y.push([truth(x) + NOISE_SD * normal()]);
    }
    return { X, Y };
  };
  const train = make(15);
  const val = make(60);
  return { train, val };
}

export const HIDDEN = 64;
export const LR = 0.01;
export const INIT_SEED = 4;

export interface RegSettings {
  /** AdamW's decoupled weight decay, applied to every parameter (PyTorch's default when given model.parameters()). */
  weightDecay: number;
  /** Dropout probability on the hidden layer during training. */
  dropout: number;
  epochs: number;
  earlyStopping: boolean;
  /** Epochs without a new best validation loss before stopping. */
  patience?: number;
}

/** A 1 → H → 1 tanh network as flat arrays. */
export interface CurveNet {
  w1: Float64Array;
  b1: Float64Array;
  w2: Float64Array;
  b2: number;
}

export interface RegRun {
  train: number[];
  val: number[];
  bestEpoch: number;
  bestVal: number;
  /** The epoch training stopped at (equal to epochs unless early stopping fired). */
  stoppedAt: number;
  /** The network that is kept: the best-validation one with early stopping, else the last. */
  net: CurveNet;
  /** Sum of squared weights (biases excluded), the quantity weight decay shrinks. */
  weightNorm: number;
}

export function curvePredict(net: CurveNet, x: number) {
  let out = net.b2;
  for (let j = 0; j < net.w1.length; j++) out += Math.tanh(net.b1[j] + x * net.w1[j]) * net.w2[j];
  return out;
}

function curveLoss(net: CurveNet, X: Matrix, Y: Matrix) {
  let s = 0;
  for (let i = 0; i < X.length; i++) {
    const e = curvePredict(net, X[i][0]) - Y[i][0];
    s += e * e;
  }
  return s / X.length;
}

const copyNet = (n: CurveNet): CurveNet => ({ w1: n.w1.slice(), b1: n.b1.slice(), w2: n.w2.slice(), b2: n.b2 });
const normOf = (n: CurveNet) => n.w1.reduce((a, w) => a + w * w, 0) + n.w2.reduce((a, w) => a + w * w, 0);

/** Full-batch AdamW (learning rate 0.01) on the 15 training points, evaluating both losses after every epoch. */
export function trainCurve(s: RegSettings, seed = INIT_SEED): RegRun {
  const { train, val } = curveData();
  const init = initNet([1, HIDDEN, 1], ["tanh", "linear"], seed);
  const H = HIDDEN;
  const net: CurveNet = { w1: Float64Array.from(init[0].W[0]), b1: Float64Array.from(init[0].b), w2: Float64Array.from(init[1].W.map((r) => r[0])), b2: init[1].b[0] };
  const rand = mulberry32(seed + 1000);
  const n = train.X.length;
  const p = s.dropout;
  const keep = p > 0 ? 1 / (1 - p) : 1;
  const wd = s.weightDecay;
  const [b1c, b2c, eps] = [0.9, 0.999, 1e-8];
  // Adam state for w1, b1, w2 (H each) and b2.
  const m = new Float64Array(3 * H + 1);
  const v = new Float64Array(3 * H + 1);
  const g = new Float64Array(3 * H + 1);
  const z = new Float64Array(n * H);
  const a = new Float64Array(n * H);
  const mask = new Float64Array(n * H).fill(1);
  const trainLosses = [curveLoss(net, train.X, train.Y)];
  const valLosses = [curveLoss(net, val.X, val.Y)];
  let bestVal = valLosses[0];
  let bestEpoch = 0;
  let best = copyNet(net);
  const patience = s.patience ?? 200;
  let stoppedAt = s.epochs;

  for (let e = 1; e <= s.epochs; e++) {
    g.fill(0);
    // Forward (with dropout masks drawn example by example, unit by unit), then backward.
    const dOut = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const x = train.X[i][0];
      let out = net.b2;
      for (let j = 0; j < H; j++) {
        const zz = net.b1[j] + x * net.w1[j];
        z[i * H + j] = zz;
        let h = Math.tanh(zz);
        if (p > 0) {
          mask[i * H + j] = rand() < p ? 0 : keep;
          h *= mask[i * H + j];
        }
        a[i * H + j] = h;
      }
      for (let j = 0; j < H; j++) out += a[i * H + j] * net.w2[j];
      dOut[i] = (2 * (out - train.Y[i][0])) / n;
    }
    for (let i = 0; i < n; i++) {
      const go = dOut[i];
      for (let j = 0; j < H; j++) g[2 * H + j] += a[i * H + j] * go;
      g[3 * H] += go;
    }
    for (let i = 0; i < n; i++) {
      const go = dOut[i];
      const x = train.X[i][0];
      for (let j = 0; j < H; j++) {
        const dz = net.w2[j] * go * (p > 0 ? mask[i * H + j] : 1) * (1 - Math.tanh(z[i * H + j]) ** 2);
        g[j] += x * dz;
        g[H + j] += dz;
      }
    }
    // AdamW, element by element.
    const c1 = 1 - b1c ** e;
    const c2 = 1 - b2c ** e;
    const upd = (k: number, w: number) => {
      if (wd) w -= LR * wd * w;
      m[k] = b1c * m[k] + (1 - b1c) * g[k];
      v[k] = b2c * v[k] + (1 - b2c) * g[k] * g[k];
      return w - (LR * (m[k] / c1)) / (Math.sqrt(v[k] / c2) + eps);
    };
    for (let j = 0; j < H; j++) {
      net.w1[j] = upd(j, net.w1[j]);
      net.b1[j] = upd(H + j, net.b1[j]);
      net.w2[j] = upd(2 * H + j, net.w2[j]);
    }
    net.b2 = upd(3 * H, net.b2);

    trainLosses.push(curveLoss(net, train.X, train.Y));
    valLosses.push(curveLoss(net, val.X, val.Y));
    if (valLosses[e] < bestVal) {
      bestVal = valLosses[e];
      bestEpoch = e;
      if (s.earlyStopping) best = copyNet(net);
    }
    if (s.earlyStopping && e - bestEpoch >= patience) {
      stoppedAt = e;
      break;
    }
  }
  const kept = s.earlyStopping ? best : net;
  return { train: trainLosses, val: valLosses, bestEpoch, bestVal, stoppedAt, net: kept, weightNorm: normOf(kept) };
}

/** The same training written with the generic layers and optimizer of nn.ts (slower; used by the tests). */
export function trainCurveReference(s: RegSettings, seed = INIT_SEED) {
  const { train, val } = curveData();
  const net = initNet([1, HIDDEN, 1], ["tanh", "linear"], seed);
  const rand = mulberry32(seed + 1000);
  const opt = makeOptimizer({ name: "adam", lr: LR, weightDecay: s.weightDecay, decoupled: true });
  const params = paramArrays(net);
  const lossOf = (X: Matrix, Y: Matrix) => mse(predict(net, X), Y).loss;
  const trainLosses = [lossOf(train.X, train.Y)];
  const valLosses = [lossOf(val.X, val.Y)];
  for (let e = 1; e <= s.epochs; e++) {
    const tr = forward(net, train.X, s.dropout > 0 ? [s.dropout, 0] : undefined, rand);
    const { grad } = mse(tr.outs[1], train.Y);
    opt.step(params, gradArrays(backward(net, tr, grad).grads));
    trainLosses.push(lossOf(train.X, train.Y));
    valLosses.push(lossOf(val.X, val.Y));
  }
  return { train: trainLosses, val: valLosses, net };
}

/* ---------- Overfit one batch, with and without bugs ---------- */

export type Bug = "none" | "no-zero-grad" | "sign" | "no-activation" | "dead";

export const SANITY_STEPS = 500;

/** One small batch: 8 evenly spaced x in [−1, 1] with noisy targets from the same curve (invented). */
export function sanityBatch() {
  const normal = gaussian(mulberry32(33));
  const X: Matrix = Array.from({ length: 8 }, (_, i) => [-1 + (2 * i) / 7]);
  const Y: Matrix = X.map(([x]) => [truth(x) + NOISE_SD * normal()]);
  return { X, Y };
}

/**
 * Train 1 → 64 (ReLU) → 1 with Adam (learning rate 0.01) on the one batch for 500 steps.
 * A correct setup drives the loss down by orders of magnitude; each bug leaves its own mark.
 */
export function overfitOneBatch(bug: Bug, steps = SANITY_STEPS, seed = INIT_SEED) {
  const { X, Y } = sanityBatch();
  const act: Activation = bug === "no-activation" ? "linear" : "relu";
  const net: Net = initNet([1, 64, 1], [act, "linear"], seed);
  if (bug === "dead") net[0].b = net[0].b.map(() => -5); // every hidden unit starts switched off for every input
  const opt = makeOptimizer({ name: "adam", lr: 0.01 });
  const params = paramArrays(net);
  let accumulated: number[][] | null = null;
  const losses = [mse(predict(net, X), Y).loss];
  let diverged = false;
  for (let t = 0; t < steps; t++) {
    const tr = forward(net, X);
    const { grad } = mse(tr.outs[1], Y);
    let g = gradArrays(backward(net, tr, grad).grads);
    if (bug === "no-zero-grad") {
      // Gradients add up across steps instead of being reset, as when zero_grad() is forgotten.
      accumulated = accumulated ? accumulated.map((arr, k) => arr.map((val, i) => val + g[k][i])) : g.map((arr) => arr.slice());
      g = accumulated;
    }
    if (bug === "sign") g = g.map((arr) => arr.map((val) => -val));
    opt.step(params, g);
    const L = mse(predict(net, X), Y).loss;
    losses.push(L);
    if (!Number.isFinite(L) || L > 1e6) {
      diverged = true;
      break;
    }
  }
  return { losses, diverged };
}
