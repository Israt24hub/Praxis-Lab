/*
 * The small network traced in "Forward propagation": 3 inputs → 4 ReLU units → 2 outputs,
 * then softmax. The weights are set by hand so every number has two decimals; training
 * would choose them from data.
 */
import { affine, type Matrix, softmax } from "./nn.ts";

export const exampleBatch: Matrix = [
  [1.0, 0.5, 2.0],
  [0.0, 1.0, 1.0],
  [2.0, 1.5, 0.0],
  [0.5, 0.0, 1.5],
];

/** 3 × 4: row i holds the weights from input i to each hidden unit. */
export const W1: Matrix = [
  [0.5, -1.0, 0.3, 0.8],
  [1.0, 0.5, -0.6, 0.0],
  [-0.4, 0.2, 0.9, -0.5],
];
export const b1 = [0.1, 0.0, -0.2, 0.3];

/** 4 × 2: row j holds the weights from hidden unit j to each output. */
export const W2: Matrix = [
  [0.7, -0.3],
  [-0.5, 0.8],
  [0.4, 0.6],
  [0.9, -1.1],
];
export const b2 = [0.0, 0.2];

export interface ForwardStages {
  X: Matrix;
  Z1: Matrix;
  H: Matrix;
  Z2: Matrix;
  P: Matrix;
}

export function forwardExample(X: Matrix): ForwardStages {
  const Z1 = affine(X, W1, b1);
  const H = Z1.map((r) => r.map((v) => Math.max(0, v)));
  const Z2 = affine(H, W2, b2);
  const P = Z2.map(softmax);
  return { X, Z1, H, Z2, P };
}

/** Parameters: every weight and bias. */
export const exampleParams = W1.length * b1.length + b1.length + W2.length * b2.length + b2.length;
