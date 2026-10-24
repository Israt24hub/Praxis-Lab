/*
 * Small loss calculations for the "Loss functions" lab. Each matches the PyTorch loss of
 * the same name for a single example (BCELoss / MSELoss / CrossEntropyLoss).
 */
import { logSumExp, softmax } from "./nn.ts";

/** One yes/no prediction p for label y: both losses and their gradients with respect to the logit z (p = σ(z)). */
export function binaryScores(y: 0 | 1, p: number) {
  const bce = -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
  const sq = (p - y) ** 2;
  return {
    bce,
    sq,
    /** ∂BCE/∂z = p − y: sigmoid and log cancel. */
    bceGrad: p - y,
    /** ∂(p − y)²/∂z = 2(p − y)·p(1 − p): the sigmoid's slope stays in. */
    sqGrad: 2 * (p - y) * p * (1 - p),
  };
}

/** Softmax cross-entropy for one example: probabilities, loss and ∂loss/∂logits. */
export function softmaxScores(z: number[], label: number) {
  const p = softmax(z);
  return {
    p,
    loss: logSumExp(z) - z[label],
    grad: p.map((v, k) => v - (k === label ? 1 : 0)),
    /** Right only when the true class has the strictly largest probability (a tie is not a prediction). */
    correct: p.every((v, k) => k === label || v < p[label]),
  };
}

export const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
export function median(xs: number[]) {
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export const meanSquared = (xs: number[], c: number) => mean(xs.map((x) => (x - c) ** 2));
export const meanAbsolute = (xs: number[], c: number) => mean(xs.map((x) => Math.abs(x - c)));

/** Delivery times in minutes for the regression panel (invented). The last one is the slider. */
export const deliveryTimes = [22, 25, 24, 27, 23, 26, 25];
