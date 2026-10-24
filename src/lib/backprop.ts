/*
 * The two small calculations behind the "Backpropagation" lab:
 * 1. a 2 → 2 (sigmoid) → 1 (sigmoid) network trained on one example with binary
 *    cross-entropy, with every gradient from backpropagation and from finite differences;
 * 2. a deep chain of one-unit layers, to show gradients shrinking (or growing) with depth.
 */
import { type Activation, activations, backward, bceWithLogits, forward, type Matrix, type Net, sigmoid } from "./nn.ts";

export interface TinyParams {
  W1: Matrix; // 2 × 2: W1[i][j] from input i to hidden unit j
  b1: number[];
  W2: Matrix; // 2 × 1
  b2: number[];
}

export const tinyStart: TinyParams = {
  W1: [
    [0.5, -0.3],
    [0.2, 0.8],
  ],
  b1: [0.1, -0.1],
  W2: [[1.0], [-1.5]],
  b2: [0.2],
};
export const tinyInput: [number, number] = [1, 2];
export const tinyLabel = 1;

const asNet = (p: TinyParams): Net => [
  { W: p.W1, b: p.b1, act: "sigmoid" },
  // The output layer returns the logit z; ŷ = σ(z) and the loss is BCE on logits, which is the same thing computed stably.
  { W: p.W2, b: p.b2, act: "linear" },
];

export interface TinyPass {
  zh: number[];
  h: number[];
  zo: number;
  yhat: number;
  loss: number;
  /** ∂L/∂ of every node: output logit, hidden activations, hidden pre-activations. */
  dzo: number;
  dh: number[];
  dzh: number[];
  grads: TinyParams;
}

export function tinyPass(p: TinyParams, x: [number, number], y: number): TinyPass {
  const net = asNet(p);
  const tr = forward(net, [x]);
  const zo = tr.outs[1][0][0];
  const { loss, grad } = bceWithLogits(tr.outs[1], [y]);
  const { grads, dZ } = backward(net, tr, grad);
  const dzo = dZ[1][0][0];
  return {
    zh: tr.zs[0][0],
    h: tr.outs[0][0],
    zo,
    yhat: sigmoid(zo),
    loss,
    dzo,
    dh: p.W2.map((row) => row[0] * dzo),
    dzh: dZ[0][0],
    grads: { W1: grads[0].dW, b1: grads[0].db, W2: grads[1].dW, b2: grads[1].db },
  };
}

/** Every parameter with a readable name and a getter/setter, in the order the lab lists them. */
export const tinyParamList: { name: string; get: (p: TinyParams) => number; set: (p: TinyParams, v: number) => void }[] = [
  ...[0, 1].flatMap((i) =>
    [0, 1].map((j) => ({
      name: `W₁[${i + 1},${j + 1}]`,
      get: (p: TinyParams) => p.W1[i][j],
      set: (p: TinyParams, v: number) => {
        p.W1[i][j] = v;
      },
    })),
  ),
  ...[0, 1].map((j) => ({ name: `b₁[${j + 1}]`, get: (p: TinyParams) => p.b1[j], set: (p: TinyParams, v: number) => void (p.b1[j] = v) })),
  ...[0, 1].map((i) => ({ name: `W₂[${i + 1},1]`, get: (p: TinyParams) => p.W2[i][0], set: (p: TinyParams, v: number) => void (p.W2[i][0] = v) })),
  { name: "b₂", get: (p: TinyParams) => p.b2[0], set: (p: TinyParams, v: number) => void (p.b2[0] = v) },
];

export const cloneTiny = (p: TinyParams): TinyParams => ({ W1: p.W1.map((r) => r.slice()), b1: p.b1.slice(), W2: p.W2.map((r) => r.slice()), b2: p.b2.slice() });

/** Central finite difference of the loss with respect to one parameter. */
export function tinyFiniteDiff(p: TinyParams, x: [number, number], y: number, k: number, h = 1e-5) {
  const { get, set } = tinyParamList[k];
  const up = cloneTiny(p);
  const down = cloneTiny(p);
  set(up, get(p) + h);
  set(down, get(p) - h);
  return (tinyPass(up, x, y).loss - tinyPass(down, x, y).loss) / (2 * h);
}

/** One plain gradient-descent step: every parameter moves by −η × its gradient. */
export function tinyStep(p: TinyParams, grads: TinyParams, lr: number): TinyParams {
  const next = cloneTiny(p);
  tinyParamList.forEach(({ get, set }) => set(next, get(p) - lr * get(grads)));
  return next;
}

/* ---------- A deep chain of one-unit layers ---------- */

/**
 * aₗ = φ(w·aₗ₋₁) for l = 1 … depth, starting from a₀ = x. Returns each layer's output and
 * |∂a_depth/∂wₗ| — how strongly the final output responds to the weight of layer l.
 */
export function chainGradients(depth: number, act: Activation, w: number, x = 1) {
  const { f, df } = activations[act];
  const a = [x];
  const z: number[] = [];
  for (let l = 1; l <= depth; l++) {
    z.push(w * a[l - 1]);
    a.push(f(z[l - 1]));
  }
  // Backward: g = ∂a_depth/∂a_l, starting from 1 at the output.
  const grads = new Array(depth).fill(0);
  let g = 1;
  for (let l = depth; l >= 1; l--) {
    const local = df(z[l - 1]);
    grads[l - 1] = Math.abs(g * local * a[l - 1]);
    g = g * local * w;
  }
  return { outputs: a.slice(1), grads };
}
