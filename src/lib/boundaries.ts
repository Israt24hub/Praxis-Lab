/*
 * Datasets and training for the "Layers and activations" lab: a network with one hidden
 * layer learns a two-class problem in the plane, and the lab draws its decision boundary.
 * Everything is seeded, so the lesson can quote the results.
 */
import { mulberry32 } from "./rng.ts";
import {
  type Activation,
  backward,
  bceWithLogits,
  binaryAccuracy,
  forward,
  gradArrays,
  initNet,
  makeOptimizer,
  type Matrix,
  type Net,
  paramArrays,
  gaussian,
} from "./nn.ts";

export type DatasetId = "blobs" | "xor" | "circle";

export interface PlaneData {
  X: Matrix;
  y: number[];
}

export const DATA_SEED = 7;
export const PLANE_RANGE = 2.5;

/** Points for each dataset, invented and generated from a fixed seed (labels are 0 or 1). */
export function planeData(id: DatasetId): PlaneData {
  const rand = mulberry32(DATA_SEED);
  const normal = gaussian(rand);
  const X: Matrix = [];
  const y: number[] = [];
  if (id === "blobs") {
    for (let i = 0; i < 80; i++) {
      const c = i % 2;
      X.push([(c ? 1 : -1) + 0.5 * normal(), (c ? 0.6 : -0.6) + 0.5 * normal()]);
      y.push(c);
    }
  } else if (id === "xor") {
    const centres = [
      [1, 1, 0],
      [-1, -1, 0],
      [1, -1, 1],
      [-1, 1, 1],
    ];
    for (let i = 0; i < 80; i++) {
      const [cx, cy, c] = centres[i % 4];
      X.push([cx + 0.35 * normal(), cy + 0.35 * normal()]);
      y.push(c);
    }
  } else {
    for (let i = 0; i < 80; i++) {
      const inner = i % 2 === 0;
      const r = inner ? 0.8 * Math.sqrt(rand()) : 1.3 + 0.7 * rand();
      const a = 2 * Math.PI * rand();
      X.push([r * Math.cos(a), r * Math.sin(a)]);
      y.push(inner ? 1 : 0);
    }
  }
  return { X, y };
}

export const INIT_SEED = 3;

export interface BoundaryRun {
  net: Net;
  losses: number[];
  accuracy: number;
  loss: number;
}

/**
 * Train 2 → hidden → 1 (or 2 → 1 when hidden = 0, which is logistic regression) with
 * binary cross-entropy and full-batch Adam (learning rate 0.05), from a fixed initialisation.
 */
export function trainBoundary(data: PlaneData, hidden: number, act: Activation, steps: number, lr = 0.05): BoundaryRun {
  const net = hidden === 0 ? initNet([2, 1], ["linear"], INIT_SEED) : initNet([2, hidden, 1], [act, "linear"], INIT_SEED);
  const opt = makeOptimizer({ name: "adam", lr });
  const params = paramArrays(net);
  const losses: number[] = [];
  for (let t = 0; t <= steps; t++) {
    const tr = forward(net, data.X);
    const out = tr.outs[net.length - 1];
    const { loss, grad } = bceWithLogits(out, data.y);
    losses.push(loss);
    if (t === steps) break;
    const { grads } = backward(net, tr, grad);
    opt.step(params, gradArrays(grads));
  }
  const logits = forward(net, data.X).outs[net.length - 1];
  return { net, losses, accuracy: binaryAccuracy(logits, data.y), loss: losses[losses.length - 1] };
}

/**
 * With no activation, two layers equal one: W₁W₂ and b₁W₂ + b₂. Returns the single
 * layer's weights (w for each input) and bias.
 */
export function collapseLinear(net: Net): { w: [number, number]; b: number } {
  if (net.length === 1) return { w: [net[0].W[0][0], net[0].W[1][0]], b: net[0].b[0] };
  const [L1, L2] = net;
  const h = L1.b.length;
  let w0 = 0;
  let w1 = 0;
  let b = L2.b[0];
  for (let j = 0; j < h; j++) {
    w0 += L1.W[0][j] * L2.W[j][0];
    w1 += L1.W[1][j] * L2.W[j][0];
    b += L1.b[j] * L2.W[j][0];
  }
  return { w: [w0, w1], b };
}
