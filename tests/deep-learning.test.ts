/*
 * Path C (Deep Learning) labs: the browser maths must match PyTorch, and every number a
 * lesson quotes must come out of the lab code. PyTorch reference values are in
 * tests/fixtures/torch-nn.json, made by tests/fixtures/make_torch_fixtures.py.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { chainGradients, tinyFiniteDiff, tinyInput, tinyLabel, tinyParamList, tinyPass, tinyStart, tinyStep } from "../src/lib/backprop.ts";
import { collapseLinear, planeData, trainBoundary } from "../src/lib/boundaries.ts";
import { exampleBatch, exampleParams, forwardExample } from "../src/lib/forward-example.ts";
import { binaryScores, deliveryTimes, mean, meanAbsolute, meanSquared, median, softmaxScores } from "../src/lib/losses.ts";
import {
  activations,
  affine,
  backward,
  bceWithLogits,
  crossEntropy,
  forward,
  gradArrays,
  makeOptimizer,
  mse,
  type Activation,
  type Net,
  type OptimizerConfig,
} from "../src/lib/nn.ts";
import { bestRegressionLoss, race, raceSurfaces, regressionData, trainRegression } from "../src/lib/optimizers.ts";
import { overfitOneBatch, trainCurve, trainCurveReference } from "../src/lib/regularization.ts";

const close = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b}`);
const torchRef = JSON.parse(readFileSync(new URL("./fixtures/torch-nn.json", import.meta.url), "utf8"));

describe("network maths matches PyTorch", () => {
  it("activations and their slopes", () => {
    const zs: number[] = torchRef.activations.z;
    for (const name of ["relu", "sigmoid", "tanh", "gelu"] as Activation[]) {
      zs.forEach((z, i) => {
        // GELU uses a 1.2e-7 erf approximation; the others are exact.
        const tol = name === "gelu" ? 1e-6 : 1e-12;
        close(activations[name].f(z), torchRef.activations[name].f[i], tol, `${name}(${z})`);
        close(activations[name].df(z), torchRef.activations[name].df[i], tol, `${name}'(${z})`);
      });
    }
  });

  it("forward and backward passes, with every loss", () => {
    assert.equal(torchRef.networks.length, 12);
    for (const c of torchRef.networks) {
      const net: Net = c.W.map((W: number[][], i: number) => ({ W, b: c.b[i], act: i < 2 ? c.act : "linear" }));
      const tr = forward(net, c.X);
      const out = tr.outs[2];
      const tol = c.act === "gelu" ? 1e-6 : 1e-10;
      out.forEach((row, i) => row.forEach((v, j) => close(v, c.out[i][j], tol, `${c.act}/${c.loss} out`)));
      const L = c.loss === "cross_entropy" ? crossEntropy(out, c.y) : c.loss === "bce" ? bceWithLogits(out, c.y) : mse(out, c.y);
      close(L.loss, c.lossValue, tol, `${c.act}/${c.loss} loss`);
      const { grads } = backward(net, tr, L.grad);
      grads.forEach((g, l) => {
        g.dW.forEach((row, i) => row.forEach((v, j) => close(v, c.dW[l][i][j], tol, `${c.act}/${c.loss} dW${l}`)));
        g.db.forEach((v, j) => close(v, c.db[l][j], tol, `${c.act}/${c.loss} db${l}`));
      });
    }
  });

  it("SGD, momentum, Adam, Adam with L2 and AdamW follow PyTorch’s trajectories", () => {
    const { A, b, start, steps, paths } = torchRef.optimizers;
    const configs: Record<string, OptimizerConfig> = {
      sgd: { name: "sgd", lr: 0.1 },
      momentum: { name: "momentum", lr: 0.05, momentum: 0.9 },
      adam: { name: "adam", lr: 0.1 },
      adam_l2: { name: "adam", lr: 0.1, weightDecay: 0.1 },
      adamw: { name: "adam", lr: 0.1, weightDecay: 0.1, decoupled: true },
      sgd_l2: { name: "sgd", lr: 0.1, weightDecay: 0.05 },
    };
    for (const [name, cfg] of Object.entries(configs)) {
      const w = start.slice();
      const opt = makeOptimizer(cfg);
      for (let t = 1; t <= steps; t++) {
        const g = A.map((row: number[], i: number) => row.reduce((s: number, a: number, j: number) => s + a * w[j], 0) - b[i]);
        opt.step([w], [g]);
        w.forEach((v: number, i: number) => close(v, paths[name][t][i], 1e-12, `${name} step ${t}`));
      }
    }
  });

  it("gradients from backward() equal finite differences for a network with every activation", () => {
    for (const act of ["tanh", "relu", "sigmoid", "gelu"] as Activation[]) {
      const net: Net = [
        { W: [[0.3, -0.7], [0.9, 0.2]], b: [0.1, -0.3], act },
        { W: [[0.5], [-1.1]], b: [0.2], act: "linear" },
      ];
      const X = [[0.4, -1.2], [1.5, 0.3]];
      const y = [1, 0];
      const lossOf = () => bceWithLogits(forward(net, X).outs[1], y).loss;
      const tr = forward(net, X);
      const grads = gradArrays(backward(net, tr, bceWithLogits(tr.outs[1], y).grad).grads);
      const params = [net[0].W[0], net[0].W[1], net[0].b, net[1].W[0], net[1].W[1], net[1].b];
      params.forEach((p, k) =>
        p.forEach((_, i) => {
          const keep = p[i];
          p[i] = keep + 1e-6;
          const up = lossOf();
          p[i] = keep - 1e-6;
          const down = lossOf();
          p[i] = keep;
          close(grads[k][i], (up - down) / 2e-6, 1e-7, `${act} param ${k},${i}`);
        }),
      );
    }
  });
});

describe("layers and activations lesson", () => {
  const xor = planeData("xor");
  const run = (ds: "xor" | "circle" | "blobs", h: number, act: Activation, steps: number) => trainBoundary(planeData(ds), h, act, steps);
  const dead = (r: ReturnType<typeof trainBoundary>, data = xor) => {
    const out = forward(r.net, data.X).outs[0];
    return out[0].map((_, j) => out.every((row) => row[j] === 0)).filter(Boolean).length;
  };

  it("activation table at z = −2", () => {
    close(activations.sigmoid.f(-2), 0.1192, 5e-5);
    close(activations.sigmoid.df(-2), 0.105, 5e-5);
    close(activations.tanh.f(-2), -0.964, 5e-5);
    close(activations.tanh.df(-2), 0.0707, 5e-5);
    close(activations.gelu.f(-2), -0.0455, 5e-5);
    assert.equal(activations.relu.df(0), 0);
  });

  it("worked example: two linear layers collapse into one", () => {
    const W = [
      [1, -1, 0.5],
      [0.5, 1, -2],
    ];
    const b = [0, -0.5, 1];
    const [z] = affine([[1, 2]], W, b);
    assert.deepEqual(z, [2, 0.5, -2.5]);
    const v = [1, -2, 3];
    const relu = z.map((t) => Math.max(0, t));
    close(relu.reduce((s, h, j) => s + h * v[j], 0), 1, 1e-12);
    close(z.reduce((s, h, j) => s + h * v[j], 0), -6.5, 1e-12);
    const wEff = W.map((row) => row.reduce((s, w, j) => s + w * v[j], 0));
    assert.deepEqual(wEff, [4.5, -7.5]);
    close(b.reduce((s, x, j) => s + x * v[j], 0), 4, 1e-12);
    close(Math.tanh(0.5), 0.462, 5e-4);
    close(Math.tanh(-2.5), -0.987, 5e-4);
  });

  it("experiment: XOR, tanh, 4 units", () => {
    const r = run("xor", 4, "tanh", 500);
    assert.equal(r.accuracy, 1);
    close(r.loss, 0.001, 5e-4);
    assert.equal(r.net.reduce((s, L) => s + L.W.length * L.b.length + L.b.length, 0), 17);
    const r0 = run("xor", 4, "tanh", 0);
    assert.equal(r0.accuracy, 0.5);
    close(r0.loss, 0.7577, 5e-5);
    const r50 = run("xor", 4, "tanh", 50);
    assert.equal(r50.accuracy, 1);
    close(r50.loss, 0.0914, 5e-5);
  });

  it("experiment: no activation stays a straight line at 52.5%", () => {
    for (const h of [4, 8]) {
      const r = run("xor", h, "linear", 500);
      assert.equal(r.accuracy, 0.525);
      const c = collapseLinear(r.net);
      close(c.w[0], 0.05, 0.005);
      close(c.w[1], 0.05, 0.005);
      close(c.b, 0, 0.005);
      // The collapsed single layer gives exactly the network's outputs.
      const out = forward(r.net, xor.X).outs[1];
      xor.X.forEach(([a, b2], i) => close(c.w[0] * a + c.w[1] * b2 + c.b, out[i][0], 1e-12));
    }
  });

  it("experiment: ReLU with 2, 3, 4, 8 units", () => {
    const results = [2, 3, 4, 8].map((h) => run("xor", h, "relu", 500));
    assert.deepEqual(
      results.map((r) => r.accuracy),
      [0.75, 0.75, 0.75, 1],
    );
    assert.deepEqual(
      results.map((r) => dead(r)),
      [0, 2, 3, 0],
    );
  });

  it("experiment: circle with tanh needs 4 units", () => {
    assert.deepEqual(
      [2, 3, 4].map((h) => run("circle", h, "tanh", 500).accuracy),
      [0.95, 0.95, 1],
    );
  });

  it("exercise: a 2-unit layer and its collapse", () => {
    const W = [
      [2, -1],
      [1, 1],
    ];
    const [z] = affine([[1, -1]], W, [-1, 0.5]);
    assert.deepEqual(z, [0, -1.5]);
    const wEff = W.map((row) => row[0] * 1 + row[1] * 3);
    assert.deepEqual(wEff, [-1, 4]);
    close(-1 * 1 + 0.5 * 3 - 0.5, 0, 1e-12);
    close(z[0] * 1 + z[1] * 3 - 0.5, -5, 1e-12);
  });
});

describe("forward propagation lesson", () => {
  const f = forwardExample(exampleBatch);
  const r2 = (m: number[][]) => m.map((row) => row.map((v) => Math.round(v * 100) / 100));

  it("every array of the worked example", () => {
    assert.deepEqual(r2(f.Z1), [
      [0.3, -0.35, 1.6, 0.1],
      [0.7, 0.7, 0.1, -0.2],
      [2.6, -1.25, -0.5, 1.9],
      [-0.25, -0.2, 1.3, -0.05],
    ]);
    assert.deepEqual(r2(f.Z2), [
      [0.94, 0.96],
      [0.18, 0.61],
      [3.53, -2.67],
      [0.52, 0.98],
    ]);
    close(f.P[0][0], 0.495, 5e-4);
    close(f.P[2][0], 0.998, 5e-4);
    close(f.P[1][1], 0.606, 5e-4);
    assert.equal(f.H.flat().filter((v) => v === 0).length, 7);
    assert.equal(exampleParams, 26);
  });

  it("rows are independent of the batch", () => {
    const one = forwardExample(exampleBatch.slice(0, 1));
    assert.deepEqual(one.P[0], f.P[0]);
  });

  it("experiment: example 1 with x₃ = 0", () => {
    const X = exampleBatch.map((r) => r.slice());
    X[0][2] = 0;
    const g = forwardExample(X);
    assert.deepEqual(r2([g.H[0]])[0], [1.1, 0, 0, 1.1]);
    assert.deepEqual(r2([g.Z2[0]])[0], [1.76, -1.34]);
    close(g.P[0][0], 0.957, 5e-4);
  });

  it("exercise: x = (1, 1, 1)", () => {
    const g = forwardExample([[1, 1, 1]]);
    assert.deepEqual(r2(g.Z1), [[1.2, -0.3, 0.4, 0.6]]);
    assert.deepEqual(r2(g.Z2), [[1.54, -0.58]]);
    close(g.P[0][0], 0.893, 5e-4);
    assert.equal(3 * 100 + 100 + 100 * 2 + 2, 602);
  });
});

describe("loss functions lesson", () => {
  it("experiment panel 1: one prediction", () => {
    const a = binaryScores(1, 0.01);
    close(a.bce, 4.6052, 5e-5);
    close(a.sq, 0.9801, 1e-12);
    close(a.bceGrad, -0.99, 1e-12);
    close(a.sqGrad, -0.0196, 5e-5);
    close(a.bceGrad / a.sqGrad, 50.5, 0.05);
    const b = binaryScores(1, 0.1);
    close(b.bce, 2.3026, 5e-5);
    close(b.sqGrad, -0.162, 1e-12);
    close(b.bceGrad / b.sqGrad, 5.6, 0.05);
    close(binaryScores(1, 0.5).bce, Math.LN2, 1e-12);
  });

  it("experiment panel 2: softmax over three logits", () => {
    const s = softmaxScores([2, 1, 0], 0);
    [0.6652, 0.2447, 0.09].forEach((p, k) => close(s.p[k], p, 5e-5));
    close(s.loss, 0.4076, 5e-5);
    [-0.3348, 0.2447, 0.09].forEach((g, k) => close(s.grad[k], g, 5e-5));
    const t = softmaxScores([3, 1, 0], 0);
    close(t.p[0], 0.8438, 5e-5);
    close(t.loss, 0.1698, 5e-5);
    assert.equal(softmaxScores([1, 1, 1], 0).correct, false);
    // Same as the generic cross-entropy used for training.
    close(crossEntropy([[2, 1, 0]], [0]).loss, s.loss, 1e-12);
  });

  it("experiment panel 3: one outlier", () => {
    const a = [...deliveryTimes, 25];
    const b = [...deliveryTimes, 120];
    close(mean(a), 24.625, 1e-12);
    close(mean(b), 36.5, 1e-12);
    assert.equal(median(a), 25);
    assert.equal(median(b), 25);
    close(meanSquared(b, mean(b)), 998.25, 1e-9);
    close(meanAbsolute(b, median(b)), 13, 1e-12);
  });

  it("worked example and exercise", () => {
    const p = [0.9, 0.2, 0.6, 0.3];
    const y = [1, 0, 1, 1];
    const logits = p.map((q) => [Math.log(q / (1 - q))]);
    close(bceWithLogits(logits, y).loss, 0.5108, 5e-5);
    close(mse(p.map((q) => [q]), y.map((v) => [v])).loss, 0.175, 1e-12);
    close(-Math.log(0.45), 0.799, 5e-4);
    const e = softmaxScores([1, 3, 0], 1);
    close(e.loss, 0.17, 5e-4);
    [0.114, -0.156, 0.042].forEach((g, k) => close(e.grad[k], g, 5e-4));
    close(-Math.log(0.8), 0.223, 5e-4);
    close(mean([200, 210, 190, 205, 900]), 341, 1e-12);
    assert.equal(median([200, 210, 190, 205, 900]), 205);
  });
});

describe("backpropagation lesson", () => {
  const r = tinyPass(tinyStart, tinyInput, tinyLabel);

  it("worked example: forward and backward", () => {
    close(r.zh[0], 1, 1e-12);
    close(r.zh[1], 1.2, 1e-12);
    close(r.h[0], 0.7311, 5e-5);
    close(r.h[1], 0.7685, 5e-5);
    close(r.zo, -0.2217, 5e-5);
    close(r.yhat, 0.4448, 5e-5);
    close(r.loss, 0.8101, 5e-5);
    close(r.dzo, -0.5552, 5e-5);
    close(r.dh[1], 0.8328, 5e-5);
    close(r.dzh[0], -0.1092, 5e-5);
    close(r.dzh[1], 0.1482, 5e-5);
    close(r.grads.W1[1][0], -0.2183, 5e-5);
    close(r.grads.W1[1][1], 0.2963, 5e-5);
    close(r.grads.W2[0][0], -0.4059, 5e-5);
    close(r.grads.W2[1][0], -0.4267, 5e-5);
  });

  it("experiment: every gradient matches a finite difference", () => {
    for (const y of [0, 1]) {
      const p = tinyPass(tinyStart, tinyInput, y);
      tinyParamList.forEach((q, k) => close(q.get(p.grads), tinyFiniteDiff(tinyStart, tinyInput, y, k), 1e-10, q.name));
    }
  });

  it("experiment: gradient steps", () => {
    const one = tinyStep(tinyStart, r.grads, 0.5);
    close(tinyPass(one, tinyInput, 1).loss, 0.4544, 5e-5);
    close(one.W2[0][0], 1.2029, 5e-5);
    close(one.W2[1][0], -1.2867, 5e-5);
    let p = tinyStart;
    for (let i = 0; i < 10; i++) p = tinyStep(p, tinyPass(p, tinyInput, 1).grads, 0.5);
    close(tinyPass(p, tinyInput, 1).loss, 0.0772, 5e-5);
  });

  it("exercise: target 0", () => {
    const z = tinyPass(tinyStart, tinyInput, 0);
    close(z.loss, 0.5884, 5e-5);
    close(z.dzo, 0.4448, 5e-5);
    close(z.grads.W2[0][0], 0.3252, 5e-5);
    close(z.grads.W2[1][0], 0.3418, 5e-5);
    close(z.dzh[0], 0.0875, 5e-5);
    close(z.dzh[1], -0.1187, 5e-5);
    tinyParamList.forEach((q) => close(q.get(z.grads) / q.get(r.grads), 0.4448 / -0.5552, 1e-3, q.name));
  });

  it("experiment: gradients through a deep chain", () => {
    const ratio = (d: number, act: Activation, w: number) => {
      const g = chainGradients(d, act, w).grads;
      return g[0] / g[d - 1];
    };
    close(ratio(10, "sigmoid", 1), 1.88e-6, 5e-9);
    close(ratio(20, "sigmoid", 1), 6.17e-13, 5e-15);
    close(ratio(10, "tanh", 1), 0.126, 5e-4);
    assert.ok(chainGradients(10, "relu", 1).grads.every((g) => g === 1));
    assert.ok(chainGradients(10, "relu", 2).grads.every((g) => g === 512));
  });
});

describe("gradient descent and optimizers lesson", () => {
  const valley = raceSurfaces[0];
  const banana = raceSurfaces[1];
  const steps = (s: typeof valley, name: "sgd" | "momentum" | "adam", lr: number) => {
    const r = race(s, s.start, { name, lr }, 300);
    return r.diverged ? "diverged" : r.reached;
  };

  it("experiment panel 1: the race", () => {
    assert.deepEqual([steps(valley, "sgd", 0.1), steps(valley, "momentum", 0.1), steps(valley, "adam", 0.1)], [39, 71, 81]);
    assert.deepEqual([steps(valley, "sgd", 0.3), steps(valley, "momentum", 0.3), steps(valley, "adam", 0.3)], ["diverged", 82, 76]);
    assert.deepEqual([steps(valley, "sgd", 1), steps(valley, "momentum", 1), steps(valley, "adam", 1)], ["diverged", "diverged", 61]);
    assert.equal(steps(valley, "sgd", 0.15), 25);
    assert.equal(steps(valley, "adam", 0.01), -1);
    assert.deepEqual([steps(banana, "sgd", 0.03), steps(banana, "momentum", 0.03), steps(banana, "adam", 0.03)], [242, 61, 275]);
    assert.deepEqual([steps(banana, "sgd", 0.1), steps(banana, "momentum", 0.1), steps(banana, "adam", 0.1)], ["diverged", "diverged", 77]);
  });

  it("worked example: the first steps", () => {
    const path = (name: "sgd" | "momentum" | "adam") => race(valley, valley.start, { name, lr: 0.1 }, 3).path;
    assert.deepEqual(path("sgd")[1], [-2.25, 0]);
    close(path("sgd")[3][0], -1.8225, 1e-12);
    assert.deepEqual(path("momentum")[2].map((v) => Math.round(v * 1e4) / 1e4), [-1.8, -1.8]);
    assert.deepEqual(path("momentum")[3].map((v) => Math.round(v * 1e4) / 1e4), [-1.215, -1.62]);
    assert.deepEqual(path("adam")[1].map((v) => Math.round(v * 1e4) / 1e4), [-2.4, 1.9]);
    assert.deepEqual(path("adam")[3].map((v) => Math.round(v * 1e4) / 1e4), [-2.2005, 1.7006]);
  });

  it("experiment panel 2: mini-batches and schedules", () => {
    const { X, y } = regressionData();
    const best = bestRegressionLoss(X, y).loss;
    close(best, 0.2835, 5e-5);
    const final = (b: number, lr: number, s: "constant" | "step" | "cosine") => {
      const r = trainRegression(b, lr, 10, s);
      return { r, f: r.losses[r.losses.length - 1] };
    };
    const d = final(8, 0.03, "constant");
    close(d.f, 0.2854, 5e-5);
    close(d.f / best - 1, 0.007, 5e-4);
    assert.equal(d.r.losses.length - 1, 320);
    close(final(1, 0.03, "constant").f / best - 1, 0.191, 5e-4);
    close(final(1, 0.03, "step").f / best - 1, 0.003, 5e-4);
    close(final(1, 0.03, "cosine").f / best - 1, 0.001, 5e-4);
    close(final(256, 0.03, "constant").f, 3.96, 5e-3);
    close(final(256, 0.3, "constant").f, 0.2835, 5e-5);
    const big = final(256, 1, "constant");
    assert.ok(!big.r.diverged && big.f > big.r.losses[0]);
    close(big.f, 12618, 1);
    const b1 = final(1, 0.3, "constant").r;
    assert.ok(b1.diverged);
  });

  it("exercise: f(w) = w²", () => {
    const sq = { ...valley, f: ([a]: [number, number]) => a * a, grad: ([a]: [number, number]) => [2 * a, 0] as [number, number], minima: [[0, 0]] as [number, number][] };
    const xs = (cfg: OptimizerConfig) => race(sq, [3, 0], cfg, 3).path.map((p) => Math.round(p[0] * 1e4) / 1e4);
    assert.deepEqual(xs({ name: "sgd", lr: 0.1 }), [3, 2.4, 1.92, 1.536]);
    assert.deepEqual(xs({ name: "sgd", lr: 1.1 }), [3, -3.6, 4.32, -5.184]);
    assert.deepEqual(xs({ name: "momentum", lr: 0.1 }), [3, 2.4, 1.38, 0.186]);
    close(xs({ name: "adam", lr: 0.1 })[1], 2.9, 1e-6);
  });
});

describe("regularization and diagnostics lesson", () => {
  const at = (s: Partial<Parameters<typeof trainCurve>[0]>) => trainCurve({ weightDecay: 0, dropout: 0, epochs: 2000, earlyStopping: false, ...s });

  it("the fast trainer matches the generic layers exactly", () => {
    for (const s of [
      { weightDecay: 0, dropout: 0 },
      { weightDecay: 0.3, dropout: 0.2 },
    ]) {
      const a = trainCurve({ ...s, epochs: 40, earlyStopping: false });
      const b = trainCurveReference({ ...s, epochs: 40, earlyStopping: false });
      assert.deepEqual(a.val, b.val);
      assert.deepEqual(a.train, b.train);
    }
  });

  it("worked example table", () => {
    const plain = at({});
    close(plain.train[2000], 0.018, 5e-4);
    close(plain.val[2000], 0.183, 5e-4);
    close(plain.bestVal, 0.093, 5e-4);
    assert.equal(plain.bestEpoch, 327);
    close(plain.weightNorm, 171.7, 0.05);
    const wd03 = at({ weightDecay: 0.3 });
    close(wd03.train[2000], 0.027, 5e-4);
    close(wd03.val[2000], 0.104, 5e-4);
    assert.equal(wd03.bestEpoch, 390);
    close(wd03.weightNorm, 24.5, 0.05);
    const wd1 = at({ weightDecay: 1 });
    close(wd1.train[2000], 0.038, 5e-4);
    close(wd1.val[2000], 0.097, 5e-4);
    close(wd1.bestVal, 0.092, 5e-4);
    // This run oscillates from epoch to epoch, so its best epoch and weight size are quoted
    // approximately: last-bit differences between JavaScript engines can shift them slightly.
    close(wd1.bestEpoch, 1170, 10);
    close(wd1.weightNorm, 8, 0.5);
    const dp = at({ dropout: 0.2 });
    close(dp.train[2000], 0.031, 5e-4);
    close(dp.val[2000], 0.098, 5e-4);
    close(dp.bestVal, 0.089, 5e-4);
    assert.equal(dp.bestEpoch, 808);
    close(dp.weightNorm, 257.0, 0.05);
    const es = at({ earlyStopping: true });
    assert.equal(es.stoppedAt, 527);
    assert.equal(es.bestEpoch, 327);
    close(es.bestVal, 0.093, 5e-4);
    close(es.train[327], 0.03, 5e-4);
    close(es.weightNorm, 42.8, 0.05);
  });

  it("experiment: 250 epochs", () => {
    close(trainCurve({ weightDecay: 0, dropout: 0, epochs: 250, earlyStopping: false }).val[250], 0.093, 5e-4);
  });

  it("experiment panel 2: the bugs", () => {
    const none = overfitOneBatch("none");
    close(none.losses[0], 0.44, 5e-4);
    close(none.losses[500], 0.0022, 5e-5);
    const nz = overfitOneBatch("no-zero-grad").losses;
    close(Math.min(...nz.slice(1)), 0.13, 5e-3);
    close(Math.max(...nz), 4.4, 0.05);
    const sign = overfitOneBatch("sign");
    assert.ok(sign.diverged);
    assert.equal(sign.losses.length - 1, 221);
    close(overfitOneBatch("no-activation").losses[500], 0.115, 5e-4);
    const dead = overfitOneBatch("dead").losses;
    close(dead[0], 0.439, 5e-4);
    close(dead[500], 0.439, 5e-4);
  });

  it("exercise: decay factor and dropout scaling", () => {
    close((1 - 0.01 * 0.5) ** 100, 0.606, 5e-4);
    assert.deepEqual(
      [5, 10, 15, 20].map((h, i) => (i === 1 ? 0 : h / 0.8)),
      [6.25, 0, 18.75, 25],
    );
  });
});
