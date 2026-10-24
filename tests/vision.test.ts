/*
 * Path D (Computer Vision) labs. The convolution, pooling and CNN code must match PyTorch
 * (reference values in tests/fixtures/torch-vision.json, made by tests/fixtures/make_digits.py),
 * and every number a lesson quotes must come out of the lab code.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { augCnn } from "../src/content/datasets/digits-cnn-aug.ts";
import { fullCnn, sourceCnn } from "../src/content/datasets/digits-cnn.ts";
import { accuracyShifted, labelSurvival, TEST_SHIFTS, trainLinear, type TransformId } from "../src/lib/augmentation.ts";
import { averagePrecision, cocoAp, disc, growMask, iou, maskScores, matchDetections, nms, precisionRecall, shiftMask } from "../src/lib/detection.ts";
import { APPLES, DETECTIONS } from "../src/lib/detection-scene.ts";
import { parseDigits } from "../src/lib/digits.ts";
import { downsample, grey, IMAGENET_MEAN, IMAGENET_STD, indexCHW, indexHWC, makeScene, normalize, tensorBytes, toTensor, type Channel } from "../src/lib/images.ts";
import { PRESETS, trace } from "../src/lib/receptive.ts";
import { METHODS, runMethod, targetTest } from "../src/lib/transfer.ts";
import {
  argmaxOf,
  cnnFrom,
  cnnInputGrad,
  cnnLogits,
  cnnLossGrads,
  cnnInit,
  cnnProbs,
  cnnTrace,
  confusion,
  conv2d,
  conv2dBackward,
  flipH,
  flipV,
  gradCam,
  occlusion,
  outSize,
  overlapCount,
  pool2d,
  pool2dBackward,
  resizeBilinear,
  rotate180,
  rotate90,
  shiftImage,
  shiftSimilarity,
  spearman,
  topPixels,
  trainCnn,
  vol,
} from "../src/lib/vision.ts";

const close = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} vs ${b}`);
const ref = JSON.parse(readFileSync(new URL("./fixtures/torch-vision.json", import.meta.url), "utf8"));
const extra = JSON.parse(readFileSync(new URL("./fixtures/torch-vision-extra.json", import.meta.url), "utf8"));
const digits = parseDigits(JSON.parse(readFileSync(new URL("../public/datasets/digits-8x8.json", import.meta.url), "utf8")));

describe("digits data", () => {
  it("has 1,797 images, a 1,258 / 539 split, and every class in both parts", () => {
    assert.equal(digits.labels.length, 1797);
    assert.equal(digits.train.length, 1258);
    assert.equal(digits.test.length, 539);
    for (let c = 0; c < 10; c++) {
      assert.ok(digits.train.some((i) => digits.labels[i] === c));
      assert.ok(digits.test.some((i) => digits.labels[i] === c));
    }
    assert.ok(digits.raw.every((r) => r.every((v) => v >= 0 && v <= 16)));
  });
});

describe("convolution and pooling match PyTorch", () => {
  it("conv2d forward and backward, with stride and padding", () => {
    for (const c of ref.conv) {
      const x = vol(c.cin, c.h, c.w, c.x);
      const out = conv2d(x, c.weight, c.bias, c.k, c.stride, c.padding);
      assert.deepEqual([out.c, out.h, out.w], c.outShape);
      assert.equal(out.h, outSize(c.h, c.k, c.stride, c.padding));
      out.data.forEach((v, i) => close(v, c.out[i], 1e-12, "out"));
      const { dx, dw, db } = conv2dBackward(x, c.weight, c.k, c.stride, c.padding, vol(out.c, out.h, out.w, c.gradOut));
      dx.data.forEach((v, i) => close(v, c.dx[i], 1e-12, "dx"));
      dw.forEach((v, i) => close(v, c.dw[i], 1e-12, "dw"));
      db.forEach((v, i) => close(v, c.db[i], 1e-12, "db"));
    }
  });

  it("max and average pooling, forward and backward", () => {
    for (const p of ref.pool) {
      const x = vol(2, 6, 6, p.x);
      const { out, argmax } = pool2d(x, p.kind);
      out.data.forEach((v, i) => close(v, p.out[i], 1e-12, p.kind));
      const dx = pool2dBackward(x, p.kind, argmax, vol(2, 3, 3, p.gradOut));
      dx.data.forEach((v, i) => close(v, p.dx[i], 1e-12, `${p.kind} dx`));
    }
  });

  it("the shipped CNN gives PyTorch's logits on every test image", () => {
    const net = cnnFrom(fullCnn);
    digits.test.forEach((idx, n) => cnnLogits(net, digits.images[idx]).forEach((v, k) => close(v, ref.fullTestLogits[n][k], 1e-9, `image ${idx}`)));
    const acc = digits.test.filter((i) => argmaxOf(cnnLogits(net, digits.images[i])) === digits.labels[i]).length / digits.test.length;
    close(acc, ref.fullTestAccuracy, 1e-12);
    close(acc, fullCnn.testAccuracy, 1e-6);
    const src = cnnFrom(sourceCnn);
    const st = digits.test.filter((i) => digits.labels[i] < 5);
    close(st.filter((i) => argmaxOf(cnnLogits(src, digits.images[i])) === digits.labels[i]).length / st.length, ref.sourceTestAccuracy, 1e-12);
  });

  it("training gradients and input gradients", () => {
    const net = cnnFrom(fullCnn);
    const idx = digits.test.slice(0, 6);
    const { grads } = cnnLossGrads(
      net,
      idx.map((i) => digits.images[i]),
      idx.map((i) => digits.labels[i]),
    );
    (["convW", "convB", "headW", "headB"] as const).forEach((k) => grads[k].forEach((v, i) => close(v, ref.cnnGrads[k][i], 1e-10, k)));
    cnnInputGrad(net, digits.images[idx[0]], digits.labels[idx[0]]).forEach((v, i) => close(v, ref.inputGrad[i], 1e-10, "input grad"));
  });
});

describe("image tensors match torchvision", () => {
  const img = makeScene();
  it("the scene, ToTensor, Normalize, greyscale and downsampling", () => {
    assert.deepEqual(Array.from(img), extra.images.hwc);
    const t = toTensor(img);
    t.forEach((v, i) => close(v, extra.images.chw[i], 1e-12, "chw"));
    t.forEach((v, i) => close(normalize(v, Math.floor(i / 256) as Channel), extra.images.normalized[i], 1e-12, "norm"));
    for (let p = 0; p < 256; p++) close(grey(t[p], t[256 + p], t[512 + p]), extra.images.grey[p], 1e-12, "grey");
    downsample(img, 2).data.forEach((v, i) => close(v, extra.images.down2[i], 1e-12, "down2"));
    downsample(img, 4).data.forEach((v, i) => close(v, extra.images.down4[i], 1e-12, "down4"));
  });
  it("quoted numbers: value ranges after normalising, and the cost of a forgotten ÷ 255", () => {
    const lo = Math.min(...[0, 1, 2].map((c) => normalize(0, c as Channel)));
    const hi = Math.max(...[0, 1, 2].map((c) => normalize(1, c as Channel)));
    assert.equal(lo.toFixed(2), "-2.12");
    assert.equal(hi.toFixed(2), "2.64");
    assert.equal(normalize(255, 0).toFixed(0), "1111");
    assert.deepEqual([IMAGENET_MEAN.length, IMAGENET_STD.length], [3, 3]);
    assert.equal(224 * 224 * 3, 150528);
  });
});

describe("augmentations match torchvision", () => {
  it("flips, rotations and shifts", () => {
    for (const c of extra.transforms) {
      const x = digits.images[c.index];
      assert.deepEqual(Array.from(flipH(x)), c.flipH);
      assert.deepEqual(Array.from(flipV(x)), c.flipV);
      assert.deepEqual(Array.from(rotate90(x)), c.rot90);
      assert.deepEqual(Array.from(rotate180(x)), c.rot180);
      assert.deepEqual(Array.from(shiftImage(x, 1, -2)), c.shift_r1_u2);
      assert.deepEqual(Array.from(shiftImage(x, -2, 1)), c.shift_l2_d1);
    }
  });
});

describe("shift augmentation", () => {
  it("the shift-trained CNN gives PyTorch's logits and accuracies, clean and shifted", () => {
    const a = extra.augmentation;
    const nets = { fullCnn: cnnFrom(fullCnn), augCnn: cnnFrom(augCnn) };
    const aug = nets.augCnn;
    digits.test.forEach((idx, n) => cnnLogits(aug, digits.images[idx]).forEach((v, k) => close(v, a.augTestLogits[n][k], 1e-9, `image ${idx}`)));
    for (const name of ["fullCnn", "augCnn"] as const)
      a.shifts.forEach(([dx, dy]: [number, number], s: number) => {
        const ok = digits.test.filter((i) => argmaxOf(cnnLogits(nets[name], shiftImage(digits.images[i], dx, dy))) === digits.labels[i]).length;
        close(ok / digits.test.length, a[name][s], 1e-12, `${name} shift ${dx},${dy}`);
      });
    close(augCnn.testAccuracy, a.augCnn[0], 1e-6);
  });
});

describe("CNN training matches torch.optim.Adam", () => {
  it("20 full-batch steps, all layers and head only", () => {
    const t = extra.training;
    const start = cnnFrom({ classes: 5, ...t.start });
    const X = t.indices.map((i: number) => digits.images[i]);
    const y = t.indices.map((i: number) => digits.labels[i] - 5);
    for (const [mode, freeze] of [
      ["all", false],
      ["head", true],
    ] as const) {
      const net = trainCnn(start, X, y, t.steps, t.lr, freeze);
      (["convW", "convB", "headW", "headB"] as const).forEach((k) => net[k].forEach((v, i) => close(v, t[mode][k][i], 1e-9, `${mode} ${k}`)));
    }
  });
});

describe("explanations match PyTorch", () => {
  const net = cnnFrom(fullCnn);
  it("bilinear resize as F.interpolate(align_corners=False)", () => {
    resizeBilinear(extra.resize.src, 6, 8).forEach((v, i) => close(v, extra.resize.dst[i], 1e-12, "resize"));
  });
  it("Grad-CAM, gradient saliency, occlusion and their rank agreement", () => {
    for (const e of extra.explain) {
      const x = digits.images[e.index];
      cnnProbs(net, x).forEach((v, i) => close(v, e.probs[i], 1e-9, "probs"));
      const g = gradCam(net, x, e.label);
      g.alpha.forEach((v, i) => close(v, e.alpha[i], 1e-10, "alpha"));
      g.cam.forEach((v, i) => close(v, e.cam[i], 1e-10, "cam"));
      g.upsampled.forEach((v, i) => close(v, e.camUp[i], 1e-10, "cam up"));
      const sal = cnnInputGrad(net, x, e.label);
      sal.forEach((v, i) => close(v, e.inputGrad[i], 1e-10, "grad"));
      const occ = occlusion(net, x, e.label);
      occ.forEach((v, i) => close(v, e.occlusion[i], 1e-9, "occlusion"));
      close(spearman(sal.map(Math.abs), occ), e.rhoSalOcc, 1e-9, "rho sal");
      close(spearman(g.upsampled, occ), e.rhoCamOcc, 1e-9, "rho cam");
    }
  });
});

describe("detection matches torchvision.ops and pycocotools", () => {
  const boxes = DETECTIONS.map((d) => d.box);
  const scores = DETECTIONS.map((d) => d.score);
  const d = extra.detection;
  it("uses the same scene as the fixture", () => {
    assert.deepEqual(APPLES, d.gt);
    assert.deepEqual(boxes, d.raw);
    assert.deepEqual(scores, d.scores);
  });
  it("box IoU and NMS", () => {
    boxes.forEach((b, i) => APPLES.forEach((g, j) => close(iou(b, g), d.iou[i][j], 1e-12, "iou")));
    for (const [thr, keep] of Object.entries(d.nms)) assert.deepEqual(nms(boxes, scores, Number(thr)), keep, `nms ${thr}`);
  });
  it("COCO average precision before and after NMS", () => {
    for (const [key, r] of Object.entries(d.coco) as [string, { ap: number; ap50: number; ap75: number; perThreshold: number[] }][]) {
      const keep = key === "none" ? boxes.map((_, i) => i) : nms(boxes, scores, Number(key));
      const kb = keep.map((i) => boxes[i]);
      const ks = keep.map((i) => scores[i]);
      const c = cocoAp(kb, ks, APPLES);
      c.per.forEach((v, i) => close(v, r.perThreshold[i], 1e-12, `${key} AP@${i}`));
      close(c.mean, r.ap, 1e-12, `${key} AP`);
      close(averagePrecision(matchDetections(kb, ks, APPLES, 0.5), APPLES.length), r.ap50, 1e-12, `${key} AP50`);
      close(averagePrecision(matchDetections(kb, ks, APPLES, 0.75), APPLES.length), r.ap75, 1e-12, `${key} AP75`);
    }
  });
  it("mask scores", () => {
    const truth = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0];
    const s = maskScores([0, 1, 1, 1, 1, 1, 0, 0, 0, 0], truth);
    assert.deepEqual([s.tp, s.fp, s.fn, s.tn], [3, 2, 1, 4]);
    close(s.iou, 3 / 6, 1e-15);
    close(s.dice, 6 / 9, 1e-15);
    close(s.pixelAccuracy, 0.7, 1e-15);
    const empty = maskScores(new Array(10).fill(0), truth);
    assert.equal(empty.iou, 0);
    close(empty.pixelAccuracy, 0.6, 1e-15);
  });
});

/* ---------- Every number the Path D lessons quote ---------- */

const pct1 = (v: number) => (v * 100).toFixed(1);

describe("lesson numbers: image representation", () => {
  const img = makeScene();
  it("the selected pixel, its memory indices and the pipeline", () => {
    assert.deepEqual([0, 1, 2].map((c) => img[indexHWC(4, 11, c)]), [250, 205, 60]);
    assert.deepEqual([0, 1, 2].map((c) => indexHWC(4, 11, c)), [225, 226, 227]);
    assert.deepEqual([0, 1, 2].map((c) => indexCHW(4, 11, c)), [75, 331, 587]);
    const norm = (y: number, x: number) => [0, 1, 2].map((c) => normalize(img[indexHWC(y, x, c)] / 255, c as Channel).toFixed(3));
    const raw = (y: number, x: number) => [0, 1, 2].map((c) => normalize(img[indexHWC(y, x, c)], c as Channel).toFixed(1));
    assert.deepEqual(norm(4, 11), ["2.163", "1.553", "-0.759"]);
    assert.deepEqual(raw(4, 11), ["1089.6", "913.1", "264.9"]);
    assert.deepEqual([0, 1, 2].map((c) => img[indexHWC(10, 3, c)]), [200, 60, 50]);
    assert.deepEqual(norm(10, 3), ["1.307", "-0.985", "-0.933"]);
    assert.deepEqual(raw(10, 3), ["871.2", "265.8", "220.4"]);
    assert.deepEqual([indexHWC(10, 3, 0), indexCHW(10, 3, 0), indexHWC(10, 3, 1), indexCHW(10, 3, 1)], [489, 163, 490, 419]);
  });
  it("memory and resolution", () => {
    assert.equal((tensorBytes(224, 224, 3, 4) / 1024).toFixed(1), "588.0");
    assert.equal((tensorBytes(224, 224, 3, 4, 32) / 1024 / 1024).toFixed(1), "18.4");
    assert.deepEqual([16, 8, 4].map((n) => 3 * n * n), [768, 192, 48]);
    assert.equal(downsample(img, 4).size, 4);
    assert.equal(16 * 3 * 480 * 640 * 4, 58982400);
  });
});

describe("lesson numbers: augmentation", () => {
  const net = cnnFrom(fullCnn);
  const row = (t: TransformId, d: number) => labelSurvival(digits, net, t)[d];
  it("which transforms keep the label", () => {
    assert.deepEqual([row("rot180", 6).kept, row("rot180", 6).top, row("rot180", 6).topCount, row("rot180", 6).total], [0, 9, 51, 54]);
    assert.deepEqual([row("rot180", 9).top, row("rot180", 9).topCount, row("rot180", 9).total], [6, 34, 54]);
    assert.deepEqual([row("flipH", 3).kept, row("flipH", 3).top, row("flipH", 3).topCount, row("flipH", 3).total], [0, 8, 44, 55]);
    assert.deepEqual([row("flipH", 0).kept, row("flipH", 0).total, row("flipH", 8).kept, row("flipH", 8).total], [52, 53, 42, 52]);
    assert.deepEqual([row("rot90", 5).kept, row("rot90", 5).top, row("rot90", 5).topCount, row("rot90", 5).total], [0, 4, 53, 55]);
    assert.ok(labelSurvival(digits, net, "rot90").every((r) => r.top === 4));
    assert.deepEqual([row("shift", 0).kept, row("shift", 0).total, row("shift", 8).kept, row("shift", 8).total], [17, 53, 9, 52]);
  });
  it("shift training: the CNNs and the linear model", () => {
    const aug = cnnFrom(augCnn);
    const acc = (m: typeof net) => TEST_SHIFTS.map((t) => pct1(accuracyShifted(digits, (x) => argmaxOf(cnnLogits(m, x)), t.dx, t.dy)));
    assert.deepEqual(acc(net), ["98.7", "57.0", "56.6", "65.3", "54.0", "24.1", "19.3"]);
    assert.deepEqual(acc(aug), ["96.8", "94.6", "93.9", "91.5", "94.1", "64.2", "43.0"]);
    const plain = trainLinear(digits, false);
    const shifted = trainLinear(digits, true);
    assert.deepEqual([plain.n, shifted.n], [1258, 6290]);
    assert.deepEqual([0, 1].map((s) => pct1(accuracyShifted(digits, plain.model.predict, TEST_SHIFTS[s].dx, TEST_SHIFTS[s].dy))), ["95.4", "43.2"]);
    assert.deepEqual([0, 1].map((s) => pct1(accuracyShifted(digits, shifted.model.predict, TEST_SHIFTS[s].dx, TEST_SHIFTS[s].dy))), ["89.8", "80.9"]);
  });
});

describe("lesson numbers: convolution", () => {
  const four = digits.test.find((i) => digits.labels[i] === 4)!;
  const edge = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  it("the default window, extremes, sizes and parameter counts", () => {
    const out = conv2d(vol(1, 8, 8, digits.images[four]), edge, [0], 3);
    assert.equal(out.data[9], -0.75);
    assert.deepEqual([1, 2, 3].map((r) => [3, 4, 5].map((c) => digits.raw[four][r * 8 + c])), [
      [16, 10, 0],
      [13, 11, 12],
      [10, 15, 16],
    ]);
    const max = Math.max(...out.data);
    assert.equal(max, 3.875);
    assert.equal(out.data.indexOf(max), 12); // row 3, column 1, counting from 1
    assert.equal(Math.min(...out.data), -3.5);
    assert.deepEqual(
      [
        [1, 0],
        [1, 1],
        [2, 0],
        [2, 1],
      ].map(([s, p]) => outSize(8, 3, s, p)),
      [6, 8, 3, 4],
    );
    assert.deepEqual([9 + 1, 8 * 10, 64 * 288 + 288, 16 * (27 + 1), 128 * (64 * 9 + 1)], [10, 80, 18720, 448, 73856]);
  });
  it("learned filter 1 never fires on any test digit", () => {
    for (const i of digits.test) {
      const z = conv2d(vol(1, 8, 8, digits.images[i]), fullCnn.convW.slice(0, 9), [fullCnn.convB[0]], 3);
      assert.ok(z.data.every((v) => v <= 0), `image ${i}`);
    }
  });
  it("a one-hot filter shifts the image", () => {
    const x = vol(1, 8, 8, digits.images[four]);
    const centre = conv2d(x, [0, 0, 0, 0, 1, 0, 0, 0, 0], [0], 3);
    const corner = conv2d(x, [1, 0, 0, 0, 0, 0, 0, 0, 0], [0], 3);
    for (let i = 1; i < 6; i++) for (let j = 1; j < 6; j++) assert.equal(corner.data[i * 6 + j], centre.data[(i - 1) * 6 + j - 1]);
  });
});

describe("lesson numbers: pooling and architectures", () => {
  const net = cnnFrom(fullCnn);
  const four = digits.test.find((i) => digits.labels[i] === 4)!;
  it("pooling feature map 2 of the 4", () => {
    const map = Float64Array.from(cnnTrace(net, digits.images[four]).r.data.subarray(36, 72));
    assert.equal(pool2d(vol(1, 6, 6, map), "max").out.data[1].toFixed(2), "1.16");
    assert.equal(pool2d(vol(1, 6, 6, map), "avg").out.data[1].toFixed(2), "0.40");
  });
  it("feature map 1 is all zeros for every test digit", () => {
    for (const i of digits.test) assert.ok(cnnTrace(net, digits.images[i]).r.data.subarray(0, 36).every((v) => v === 0));
  });
  it("similarity of a digit and its shifted copy at each stage", () => {
    const avg = (dx: number, dy: number) => {
      const s = [0, 0, 0];
      for (const i of digits.test) shiftSimilarity(net, digits.images[i], dx, dy).forEach((v, k) => (s[k] += v));
      return s.map((v) => (v / digits.test.length).toFixed(3));
    };
    assert.deepEqual(avg(1, 0), ["0.435", "0.744", "0.830"]);
    assert.deepEqual(avg(0, 1), ["0.622", "0.834", "0.897"]);
    assert.deepEqual(avg(2, 0), ["-0.046", "0.397", "0.544"]);
  });
  it("receptive fields and sizes", () => {
    const last = (k: keyof typeof PRESETS) => trace(PRESETS[k].layers, PRESETS[k].input).at(-1)!;
    assert.deepEqual([last("course").field, last("course").size], [4, 3]);
    assert.deepEqual(
      trace(PRESETS.stacked.layers, 32).map((r) => r.field),
      [3, 5, 7, 8],
    );
    const r18 = trace(PRESETS.resnet18.layers, 224);
    assert.deepEqual([r18.at(-1)!.field, r18.at(-1)!.jump, r18.at(-1)!.size], [435, 32, 7]);
    assert.deepEqual([r18[0].size, r18[1].size, r18[5].size, r18[9].size, r18[13].size], [112, 56, 56, 28, 14]);
    // The worked example's stack, and the exercise's.
    const ex = trace(
      [
        { name: "c", k: 3, s: 1, p: 1 },
        { name: "p", k: 2, s: 2, p: 0 },
        { name: "c", k: 3, s: 1, p: 1 },
        { name: "p", k: 2, s: 2, p: 0 },
        { name: "c", k: 3, s: 1, p: 1 },
      ],
      64,
    );
    assert.deepEqual(
      ex.map((r) => r.field),
      [3, 4, 8, 10, 18],
    );
    assert.equal(ex.at(-1)!.size, 16);
  });
  it("a receptive field is exactly the set of inputs that can change an output", () => {
    // Brute force with the PyTorch-checked conv2dBackward: push a gradient back from one centre output.
    const layers = PRESETS.stacked.layers.slice(0, 3);
    const n = 15;
    const shapes = [n];
    for (const l of layers) shapes.push(outSize(shapes.at(-1)!, l.k, l.s, l.p));
    let g = vol(1, shapes.at(-1)!, shapes.at(-1)!);
    g.data[Math.floor(shapes.at(-1)! / 2) * shapes.at(-1)! + Math.floor(shapes.at(-1)! / 2)] = 1;
    for (let l = layers.length - 1; l >= 0; l--) {
      const x = vol(1, shapes[l], shapes[l]);
      g = conv2dBackward(x, new Array(9).fill(1), 3, layers[l].s, layers[l].p, g).dx;
    }
    const rows = new Set<number>();
    g.data.forEach((v, i) => v && rows.add(Math.floor(i / n)));
    assert.equal(rows.size, trace(layers, n).at(-1)!.field);
  });
});

describe("lesson numbers: transfer learning", () => {
  it("draw 1 with 5 per digit, and ten-draw averages and ranges", () => {
    assert.equal(targetTest(digits).length, 269);
    assert.deepEqual(
      METHODS.map((m) => pct1(runMethod(digits, m, 5, 1).accuracy)),
      ["87.4", "85.5", "87.7", "88.1"],
    );
    const table: Record<number, Record<string, number[]>> = {};
    for (const k of [1, 2, 5, 10, 20]) {
      table[k] = {};
      for (const m of METHODS) table[k][m] = Array.from({ length: 10 }, (_, s) => runMethod(digits, m, k, s + 1).accuracy);
    }
    const mean = (v: number[]) => pct1(v.reduce((a, b) => a + b, 0) / v.length);
    const means = (k: number) => METHODS.map((m) => mean(table[k][m]));
    assert.deepEqual(means(1), ["68.6", "69.4", "71.1", "71.2"]);
    assert.deepEqual(means(2), ["81.9", "82.5", "83.1", "83.1"]);
    assert.deepEqual(means(5), ["90.7", "91.6", "91.8", "91.8"]);
    assert.deepEqual(means(10), ["93.7", "94.3", "94.2", "94.4"]);
    assert.deepEqual(means(20), ["95.6", "95.6", "96.0", "96.2"]);
    const range = (k: number, m: string) => [pct1(Math.min(...table[k][m])), pct1(Math.max(...table[k][m]))];
    assert.deepEqual(range(1, "scratch"), ["50.9", "79.9"]);
    assert.deepEqual(range(1, "finetune"), ["55.0", "87.4"]);
    assert.deepEqual(range(1, "linear"), ["50.2", "85.1"]);
    assert.deepEqual(range(20, "scratch"), ["92.2", "97.8"]);
    // "At most 1.8 points": the better pretrained method over scratch, from the rounded table.
    const gaps = [1, 2, 5, 10, 20].map((k) => Math.max(Number(means(k)[2]), Number(means(k)[3])) - Number(means(k)[1]));
    assert.equal(Math.max(...gaps).toFixed(1), "1.8");
    assert.equal(Math.min(...gaps).toFixed(1), "0.1");
    // "As much as 35 points" between draws for one method.
    assert.equal(Math.round(Math.max(...METHODS.map((m) => Math.max(...table[1][m]) - Math.min(...table[1][m]))) * 100), 35);
    assert.equal(512 * 5 + 5, 2565);
    assert.equal(512 * 12 + 12, 6156);
  });
});

describe("lesson numbers: detection and segmentation", () => {
  const boxes = DETECTIONS.map((d) => d.box);
  const scores = DETECTIONS.map((d) => d.score);
  const kept = (thr: number) => {
    const k = nms(boxes, scores, thr);
    return { b: k.map((i) => boxes[i]), s: k.map((i) => scores[i]), n: k.length };
  };
  it("IoU panel", () => {
    assert.equal(iou([50, 60, 100, 110], APPLES[0]).toFixed(3), "0.667");
    assert.equal(iou([50, 70, 80, 100], APPLES[0]).toFixed(3), "0.360");
    assert.equal(iou(boxes[0], APPLES[0]).toFixed(3), "0.855");
    assert.equal(iou([0, 0, 10, 10], [5, 0, 15, 10]).toFixed(3), "0.333");
  });
  it("NMS and AP at each threshold", () => {
    const k5 = kept(0.5);
    const m5 = matchDetections(k5.b, k5.s, APPLES, 0.5);
    assert.deepEqual([k5.n, m5.filter((m) => m.tp).length, m5.filter((m) => !m.tp).length], [10, 6, 4]);
    assert.deepEqual(
      m5.map((m) => m.bestIou.toFixed(2)),
      ["0.85", "0.85", "0.66", "0.91", "0.78", "0.00", "0.92", "0.00", "0.61", "0.00"],
    );
    assert.deepEqual(
      precisionRecall(m5, 6).map((p) => [p.precision.toFixed(2), p.recall.toFixed(2)]),
      [
        ["1.00", "0.17"],
        ["1.00", "0.33"],
        ["1.00", "0.50"],
        ["1.00", "0.67"],
        ["1.00", "0.83"],
        ["0.83", "0.83"],
        ["0.86", "1.00"],
        ["0.75", "1.00"],
        ["0.67", "1.00"],
        ["0.60", "1.00"],
      ],
    );
    assert.equal(averagePrecision(m5, 6).toFixed(3), "0.976");
    assert.equal(((84 + (17 * 6) / 7) / 101).toFixed(3), "0.976");
    assert.equal(averagePrecision(matchDetections(k5.b, k5.s, APPLES, 0.75), 6).toFixed(3), "0.718");
    assert.equal(cocoAp(k5.b, k5.s, APPLES).mean.toFixed(3), "0.654");
    const k3 = kept(0.3);
    assert.deepEqual([k3.n, matchDetections(k3.b, k3.s, APPLES, 0.5).filter((m) => m.tp).length], [8, 5]);
    assert.equal(averagePrecision(matchDetections(k3.b, k3.s, APPLES, 0.5), 6).toFixed(3), "0.832");
    assert.equal(iou(boxes[8], boxes[9]).toFixed(2), "0.33");
    assert.equal(iou(boxes[11], boxes[4]).toFixed(2), "0.47");
    assert.equal(kept(0.7).n, 13);
    assert.equal(averagePrecision(matchDetections(boxes, scores, APPLES, 0.5), 6).toFixed(3), "0.916");
    // If the leaf's 0.66 were 0.20, AP50 after NMS would be 1.
    const s2 = k5.s.map((v) => (v === 0.66 ? 0.2 : v));
    assert.equal(averagePrecision(matchDetections(k5.b, s2, APPLES, 0.5), 6), 1);
  });
  it("mask scores and the exercise", () => {
    const N = 16;
    const truth = disc(N, 7.5, 7.5, 3.5);
    assert.equal(truth.reduce((a, b) => a + b, 0), 32);
    const f = (m: ArrayLike<number>) => maskScores(m, truth);
    assert.deepEqual([f(shiftMask(truth, N, 1, 0)).iou.toFixed(3), f(shiftMask(truth, N, 1, 0)).dice.toFixed(3)], ["0.684", "0.813"]);
    assert.deepEqual([f(growMask(truth, N, true)).iou.toFixed(3), f(growMask(truth, N, true)).dice.toFixed(3)], ["0.615", "0.762"]);
    assert.deepEqual([f(new Uint8Array(N * N)).pixelAccuracy, f(new Uint8Array(N * N)).iou], [0.875, 0]);
    // Exercise: 11-point AP for hit, miss, hit, hit, miss with 3 objects.
    const prec = [1, 0.5, 2 / 3, 0.75, 0.6];
    const rec = [1 / 3, 1 / 3, 2 / 3, 1, 1];
    const ap11 = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].reduce((s, r) => s + Math.max(0, ...prec.filter((_, i) => rec[i] >= r - 1e-12)), 0) / 11;
    assert.equal(ap11.toFixed(3), "0.841");
  });
});

describe("lesson numbers: evaluation and interpretation", () => {
  const net = cnnFrom(fullCnn);
  const X = digits.test.map((i) => digits.images[i]);
  const y = digits.test.map((i) => digits.labels[i]);
  const { counts, predictions } = confusion(net, X, y);
  it("confusion matrix, recall and the mistakes", () => {
    assert.equal(counts.reduce((s, r, i) => s + r[i], 0), 532);
    assert.deepEqual(
      counts.map((r, i) => Math.round((100 * r[i]) / r.reduce((a, b) => a + b, 0))),
      [100, 96, 98, 100, 100, 96, 98, 100, 100, 98],
    );
    const mistakes = digits.test
      .map((idx, n) => ({ idx, t: digits.labels[idx], p: predictions[n], conf: Math.max(...cnnProbs(net, digits.images[idx])) }))
      .filter((m) => m.t !== m.p)
      .sort((a, b) => b.conf - a.conf)
      .map((m) => `${m.idx}:${m.t}>${m.p}:${pct1(m.conf)}`);
    assert.deepEqual(mistakes, ["1662:9>5:99.8", "1495:1>9:94.9", "792:6>4:85.1", "1274:5>2:81.1", "421:5>9:74.8", "1522:1>9:65.6", "77:2>7:51.7"]);
    assert.equal(counts[1][9], 2);
  });
  it("explanation agreement, for image 77 and on average", () => {
    const tops = (i: number, k: number, n = net) => ({
      g: topPixels(cnnInputGrad(n, digits.images[i], k).map(Math.abs)),
      c: topPixels(gradCam(n, digits.images[i], k).upsampled),
      o: topPixels(occlusion(n, digits.images[i], k)),
    });
    const t77 = tops(77, 7);
    assert.deepEqual([overlapCount(t77.g, t77.o), overlapCount(t77.c, t77.o), overlapCount(t77.g, t77.c)], [2, 0, 2]);
    const sum = [0, 0, 0];
    digits.test.forEach((i, n) => {
      const t = tops(i, predictions[n]);
      sum[0] += overlapCount(t.g, t.o);
      sum[1] += overlapCount(t.c, t.o);
      sum[2] += overlapCount(t.g, t.c);
    });
    assert.deepEqual(
      sum.map((s) => (s / digits.test.length).toFixed(2)),
      ["2.20", "1.14", "1.35"],
    );
    assert.equal((8 * 8) / 64, 1); // eight random pixels of 64 share 1 with another eight, on average
  });
  it("the model-randomisation check", () => {
    const rnd = cnnInit(10, 1);
    const rho: number[] = [];
    const inkT: number[] = [];
    const inkR: number[] = [];
    const inkOwn: number[] = [];
    for (const i of digits.test) {
      const k = digits.labels[i];
      const g = cnnInputGrad(net, digits.images[i], k).map(Math.abs);
      const r = cnnInputGrad(rnd, digits.images[i], k).map(Math.abs);
      rho.push(spearman(r, g));
      inkT.push(spearman(g, digits.images[i]));
      inkR.push(spearman(r, digits.images[i]));
      inkOwn.push(spearman(cnnInputGrad(rnd, digits.images[i], argmaxOf(cnnLogits(rnd, digits.images[i]))).map(Math.abs), digits.images[i]));
    }
    const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
    assert.equal(mean(rho).toFixed(2), "0.21");
    assert.equal(mean(inkT).toFixed(2), "0.23");
    assert.equal(mean(inkR).toFixed(2), "0.30");
    assert.ok(mean(inkOwn) > mean(inkT)); // also when explaining the untrained network's own answer
  });
});
