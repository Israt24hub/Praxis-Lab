/*
 * Convolution, pooling and a small CNN for the Computer Vision labs, with forward and
 * backward passes that match PyTorch (checked in tests/vision.test.ts against values
 * recorded by tests/fixtures/make_digits.py). Arrays are flat, channel-first (C, H, W),
 * in PyTorch's order. Pure and deterministic.
 */
import { softmax } from "./nn.ts";
import { mulberry32 } from "./rng.ts";

export interface Vol {
  c: number;
  h: number;
  w: number;
  data: Float64Array;
}

export const vol = (c: number, h: number, w: number, data?: ArrayLike<number>): Vol => ({ c, h, w, data: data ? Float64Array.from(data) : new Float64Array(c * h * w) });
export const at = (v: Vol, c: number, y: number, x: number) => v.data[(c * v.h + y) * v.w + x];

/** Output size of a convolution or pooling layer: ⌊(n + 2p − k) / s⌋ + 1. */
export const outSize = (n: number, k: number, stride: number, padding: number) => Math.floor((n + 2 * padding - k) / stride) + 1;

/**
 * 2-D convolution as deep-learning frameworks define it (cross-correlation: the kernel is
 * not flipped). weight has shape (F, C, k, k), bias (F).
 */
export function conv2d(x: Vol, weight: ArrayLike<number>, bias: ArrayLike<number>, k: number, stride = 1, padding = 0): Vol {
  const F = bias.length;
  const oh = outSize(x.h, k, stride, padding);
  const ow = outSize(x.w, k, stride, padding);
  const out = vol(F, oh, ow);
  for (let f = 0; f < F; f++)
    for (let i = 0; i < oh; i++)
      for (let j = 0; j < ow; j++) {
        let s = bias[f];
        for (let c = 0; c < x.c; c++)
          for (let a = 0; a < k; a++) {
            const y = i * stride + a - padding;
            if (y < 0 || y >= x.h) continue;
            for (let b = 0; b < k; b++) {
              const xx = j * stride + b - padding;
              if (xx < 0 || xx >= x.w) continue;
              s += weight[((f * x.c + c) * k + a) * k + b] * x.data[(c * x.h + y) * x.w + xx];
            }
          }
        out.data[(f * oh + i) * ow + j] = s;
      }
  return out;
}

/** Gradients of conv2d with respect to its input, weight and bias, given ∂L/∂output. */
export function conv2dBackward(x: Vol, weight: ArrayLike<number>, k: number, stride: number, padding: number, gradOut: Vol) {
  const F = gradOut.c;
  const dx = vol(x.c, x.h, x.w);
  const dw = new Float64Array(F * x.c * k * k);
  const db = new Float64Array(F);
  for (let f = 0; f < F; f++)
    for (let i = 0; i < gradOut.h; i++)
      for (let j = 0; j < gradOut.w; j++) {
        const g = gradOut.data[(f * gradOut.h + i) * gradOut.w + j];
        if (g === 0) continue;
        db[f] += g;
        for (let c = 0; c < x.c; c++)
          for (let a = 0; a < k; a++) {
            const y = i * stride + a - padding;
            if (y < 0 || y >= x.h) continue;
            for (let b = 0; b < k; b++) {
              const xx = j * stride + b - padding;
              if (xx < 0 || xx >= x.w) continue;
              const wi = ((f * x.c + c) * k + a) * k + b;
              const xi = (c * x.h + y) * x.w + xx;
              dw[wi] += g * x.data[xi];
              dx.data[xi] += g * weight[wi];
            }
          }
      }
  return { dx, dw, db };
}

/** Max or average pooling with window k and stride s (no padding). argmax records which input won. */
export function pool2d(x: Vol, kind: "max" | "avg", k = 2, s = 2) {
  const oh = outSize(x.h, k, s, 0);
  const ow = outSize(x.w, k, s, 0);
  const out = vol(x.c, oh, ow);
  const argmax = new Int32Array(x.c * oh * ow);
  for (let c = 0; c < x.c; c++)
    for (let i = 0; i < oh; i++)
      for (let j = 0; j < ow; j++) {
        let best = -Infinity;
        let bi = -1;
        let sum = 0;
        for (let a = 0; a < k; a++)
          for (let b = 0; b < k; b++) {
            const xi = (c * x.h + i * s + a) * x.w + j * s + b;
            const v = x.data[xi];
            sum += v;
            if (v > best) {
              best = v;
              bi = xi;
            }
          }
        const oi = (c * oh + i) * ow + j;
        out.data[oi] = kind === "max" ? best : sum / (k * k);
        argmax[oi] = bi;
      }
  return { out, argmax };
}

export function pool2dBackward(x: Vol, kind: "max" | "avg", argmax: Int32Array, gradOut: Vol, k = 2, s = 2) {
  const dx = vol(x.c, x.h, x.w);
  for (let c = 0; c < gradOut.c; c++)
    for (let i = 0; i < gradOut.h; i++)
      for (let j = 0; j < gradOut.w; j++) {
        const oi = (c * gradOut.h + i) * gradOut.w + j;
        const g = gradOut.data[oi];
        if (kind === "max") dx.data[argmax[oi]] += g;
        else for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) dx.data[(c * x.h + i * s + a) * x.w + j * s + b] += g / (k * k);
      }
  return dx;
}

/* ---------- The small CNN used by the digit labs ---------- */

/** conv 3×3 (8 filters, no padding) → ReLU → max-pool 2 → linear, on 8×8 images scaled to [0, 1]. */
export interface SmallCnn {
  classes: number;
  convW: Float64Array; // (8, 1, 3, 3)
  convB: Float64Array; // (8)
  headW: Float64Array; // (classes, 72)
  headB: Float64Array; // (classes)
}
export const FILTERS = 8;
export const FEATURES = FILTERS * 9;

export function cnnFrom(w: { classes: number; convW: number[]; convB: number[]; headW: number[]; headB: number[] }): SmallCnn {
  return { classes: w.classes, convW: Float64Array.from(w.convW), convB: Float64Array.from(w.convB), headW: Float64Array.from(w.headW), headB: Float64Array.from(w.headB) };
}

/** PyTorch's default initialisation for Conv2d and Linear: uniform ±1/√fan-in, from a seed. */
export function cnnInit(classes: number, seed: number): SmallCnn {
  const rand = mulberry32(seed);
  const u = (n: number, bound: number) => Float64Array.from({ length: n }, () => (2 * rand() - 1) * bound);
  return { classes, convW: u(FILTERS * 9, 1 / 3), convB: u(FILTERS, 1 / 3), headW: u(classes * FEATURES, 1 / Math.sqrt(FEATURES)), headB: u(classes, 1 / Math.sqrt(FEATURES)) };
}

export interface CnnTrace {
  x: Vol;
  z: Vol;
  r: Vol;
  p: { out: Vol; argmax: Int32Array };
  logits: number[];
}

/** The 72 pooled features of one image (after conv, ReLU and max-pool), flattened as PyTorch does. */
export function cnnTrace(net: SmallCnn, image: ArrayLike<number>): CnnTrace {
  const x = vol(1, 8, 8, image);
  const z = conv2d(x, net.convW, net.convB, 3);
  const r = vol(z.c, z.h, z.w, z.data.map((v) => (v > 0 ? v : 0)));
  const p = pool2d(r, "max");
  const logits = Array.from({ length: net.classes }, (_, k) => {
    let s = net.headB[k];
    for (let i = 0; i < FEATURES; i++) s += net.headW[k * FEATURES + i] * p.out.data[i];
    return s;
  });
  return { x, z, r, p, logits };
}

export const cnnLogits = (net: SmallCnn, image: ArrayLike<number>) => cnnTrace(net, image).logits;
export const cnnFeatures = (net: SmallCnn, image: ArrayLike<number>) => cnnTrace(net, image).p.out.data;
export const argmaxOf = (v: ArrayLike<number>) => {
  let best = 0;
  for (let i = 1; i < v.length; i++) if (v[i] > v[best]) best = i;
  return best;
};

/** ∂(logit of class k)/∂(input pixels): a gradient saliency map for one image. */
export function cnnInputGrad(net: SmallCnn, image: ArrayLike<number>, k: number): Float64Array {
  const t = cnnTrace(net, image);
  const dPool = vol(FILTERS, 3, 3, net.headW.subarray(k * FEATURES, (k + 1) * FEATURES));
  const dR = pool2dBackward(t.r, "max", t.p.argmax, dPool);
  const dZ = vol(dR.c, dR.h, dR.w, dR.data.map((g, i) => (t.z.data[i] > 0 ? g : 0)));
  return conv2dBackward(t.x, net.convW, 3, 1, 0, dZ).dx.data;
}

/** Class probabilities (softmax of the logits). */
export function cnnProbs(net: SmallCnn, image: ArrayLike<number>) {
  return softmax(cnnLogits(net, image));
}

/**
 * Grad-CAM (Selvaraju et al.) on the network's only convolutional layer: weight each of the 8
 * rectified feature maps (6 × 6) by the average gradient of the class logit with respect to it,
 * sum, and keep the positive part. Returns the 6 × 6 map and the map resized to the 8 × 8 input.
 */
export function gradCam(net: SmallCnn, image: ArrayLike<number>, k: number) {
  const t = cnnTrace(net, image);
  const dPool = vol(FILTERS, 3, 3, net.headW.subarray(k * FEATURES, (k + 1) * FEATURES));
  const dR = pool2dBackward(t.r, "max", t.p.argmax, dPool);
  const alpha = Array.from({ length: FILTERS }, (_, f) => {
    let s = 0;
    for (let q = 0; q < 36; q++) s += dR.data[f * 36 + q];
    return s / 36;
  });
  const cam = new Float64Array(36);
  for (let q = 0; q < 36; q++) {
    let s = 0;
    for (let f = 0; f < FILTERS; f++) s += alpha[f] * t.r.data[f * 36 + q];
    cam[q] = s > 0 ? s : 0;
  }
  return { alpha, cam, upsampled: resizeBilinear(cam, 6, 8) };
}

/** Bilinear resize of a square map, with PyTorch's align_corners=False convention. */
export function resizeBilinear(src: ArrayLike<number>, n: number, m: number) {
  const out = new Float64Array(m * m);
  const scale = n / m;
  const coord = (i: number) => {
    const c = Math.max(0, (i + 0.5) * scale - 0.5);
    const lo = Math.min(Math.floor(c), n - 1);
    const hi = Math.min(lo + 1, n - 1);
    return [lo, hi, c - lo] as const;
  };
  for (let y = 0; y < m; y++) {
    const [y0, y1, fy] = coord(y);
    for (let x = 0; x < m; x++) {
      const [x0, x1, fx] = coord(x);
      const top = src[y0 * n + x0] * (1 - fx) + src[y0 * n + x1] * fx;
      const bot = src[y1 * n + x0] * (1 - fx) + src[y1 * n + x1] * fx;
      out[y * m + x] = top * (1 - fy) + bot * fy;
    }
  }
  return out;
}

/**
 * Occlusion sensitivity: cover each patch × patch window (stride 1) with `fill`, record how much
 * the score (logit) of class k drops, and give every pixel the average drop of the windows that
 * covered it. Positive means hiding that pixel lowered the class score. The logit is used, as by
 * the gradient and Grad-CAM maps, so all three explain the same number (a probability near 1
 * barely moves, which would hide the differences).
 */
export function occlusion(net: SmallCnn, image: ArrayLike<number>, k: number, patch = 2, fill = 0) {
  const base = cnnLogits(net, image)[k];
  const sum = new Float64Array(64);
  const count = new Float64Array(64);
  for (let y = 0; y + patch <= 8; y++)
    for (let x = 0; x + patch <= 8; x++) {
      const img = Float64Array.from(image);
      for (let a = 0; a < patch; a++) for (let b = 0; b < patch; b++) img[(y + a) * 8 + x + b] = fill;
      const drop = base - cnnLogits(net, img)[k];
      for (let a = 0; a < patch; a++)
        for (let b = 0; b < patch; b++) {
          sum[(y + a) * 8 + x + b] += drop;
          count[(y + a) * 8 + x + b] += 1;
        }
    }
  return sum.map((s, i) => s / count[i]);
}

/**
 * Spearman rank correlation of two equally long arrays (ties get their average rank). Values are
 * rounded to 9 decimals first, so numbers that differ only by rounding error count as ties.
 */
export function spearman(a: ArrayLike<number>, b: ArrayLike<number>) {
  const rank = (raw: ArrayLike<number>) => {
    const v = Array.from(raw, (x) => Math.round(x * 1e9) / 1e9);
    const idx = Array.from({ length: v.length }, (_, i) => i).sort((i, j) => v[i] - v[j]);
    const r = new Float64Array(v.length);
    for (let i = 0; i < idx.length; ) {
      let j = i;
      while (j + 1 < idx.length && v[idx[j + 1]] === v[idx[i]]) j++;
      for (let q = i; q <= j; q++) r[idx[q]] = (i + j) / 2;
      i = j + 1;
    }
    return r;
  };
  const ra = rank(a);
  const rb = rank(b);
  const n = ra.length;
  const ma = ra.reduce((s, v) => s + v, 0) / n;
  const mb = rb.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (ra[i] - ma) * (rb[i] - mb);
    da += (ra[i] - ma) ** 2;
    db += (rb[i] - mb) ** 2;
  }
  return num / Math.sqrt(da * db);
}

/** counts[t][p]: how many test images of true class t the network predicted as p. */
export function confusion(net: SmallCnn, images: ArrayLike<number>[], labels: number[]) {
  const counts = Array.from({ length: net.classes }, () => new Array<number>(net.classes).fill(0));
  const predictions = images.map((img, i) => {
    const p = argmaxOf(cnnLogits(net, img));
    counts[labels[i]][p]++;
    return p;
  });
  return { counts, predictions };
}

/* ---------- Transforms of an 8 × 8 image (augmentations) ---------- */

/** Move the image dx pixels right and dy pixels down, filling the uncovered edge with 0. */
export function shiftImage(img: ArrayLike<number>, dx: number, dy: number, n = 8) {
  const out = new Float64Array(n * n);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const sy = y - dy;
      const sx = x - dx;
      if (sy >= 0 && sy < n && sx >= 0 && sx < n) out[y * n + x] = img[sy * n + sx];
    }
  return out;
}
/** Mirror left–right. */
export const flipH = (img: ArrayLike<number>, n = 8) => Float64Array.from({ length: n * n }, (_, i) => img[Math.floor(i / n) * n + (n - 1 - (i % n))]);
/** Mirror top–bottom. */
export const flipV = (img: ArrayLike<number>, n = 8) => Float64Array.from({ length: n * n }, (_, i) => img[(n - 1 - Math.floor(i / n)) * n + (i % n)]);
/** Turn half a circle. */
export const rotate180 = (img: ArrayLike<number>, n = 8) => Float64Array.from({ length: n * n }, (_, i) => img[n * n - 1 - i]);
/** Turn a quarter circle anticlockwise (as torch.rot90 and torchvision's rotate(90) do). */
export const rotate90 = (img: ArrayLike<number>, n = 8) => Float64Array.from({ length: n * n }, (_, i) => img[(i % n) * n + (n - 1 - Math.floor(i / n))]);

/**
 * Mean cross-entropy and its gradients over a batch. Written out for this one architecture with
 * flat arrays (the generic conv2d / pool2d code above gives the same numbers, more slowly), so
 * the transfer lab can train several networks in the browser in about a second.
 */
export function cnnLossGrads(net: SmallCnn, images: ArrayLike<number>[], labels: number[]) {
  const C = net.classes;
  const g = { convW: new Float64Array(FILTERS * 9), convB: new Float64Array(FILTERS), headW: new Float64Array(C * FEATURES), headB: new Float64Array(C) };
  const { convW, convB, headW, headB } = net;
  const z = new Float64Array(FILTERS * 36);
  const p = new Float64Array(FEATURES);
  const arg = new Int32Array(FEATURES);
  const logits = new Float64Array(C);
  const dP = new Float64Array(FEATURES);
  const n = images.length;
  let loss = 0;
  for (let s = 0; s < n; s++) {
    const x = images[s];
    for (let f = 0; f < FILTERS; f++)
      for (let i = 0; i < 6; i++)
        for (let j = 0; j < 6; j++) {
          let v = convB[f];
          for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++) v += convW[f * 9 + a * 3 + c] * x[(i + a) * 8 + j + c];
          z[f * 36 + i * 6 + j] = v;
        }
    for (let f = 0; f < FILTERS; f++)
      for (let u = 0; u < 3; u++)
        for (let v = 0; v < 3; v++) {
          let best = -Infinity;
          let bi = -1;
          for (let a = 0; a < 2; a++)
            for (let b = 0; b < 2; b++) {
              const idx = f * 36 + (2 * u + a) * 6 + 2 * v + b;
              const r = z[idx] > 0 ? z[idx] : 0;
              if (r > best) {
                best = r;
                bi = idx;
              }
            }
          p[f * 9 + u * 3 + v] = best;
          arg[f * 9 + u * 3 + v] = bi;
        }
    let max = -Infinity;
    for (let k = 0; k < C; k++) {
      let v = headB[k];
      for (let q = 0; q < FEATURES; q++) v += headW[k * FEATURES + q] * p[q];
      logits[k] = v;
      if (v > max) max = v;
    }
    let sum = 0;
    for (let k = 0; k < C; k++) sum += Math.exp(logits[k] - max);
    loss += max + Math.log(sum) - logits[labels[s]];
    dP.fill(0);
    for (let k = 0; k < C; k++) {
      const d = (Math.exp(logits[k] - max) / sum - (k === labels[s] ? 1 : 0)) / n;
      g.headB[k] += d;
      for (let q = 0; q < FEATURES; q++) {
        g.headW[k * FEATURES + q] += d * p[q];
        dP[q] += d * headW[k * FEATURES + q];
      }
    }
    for (let q = 0; q < FEATURES; q++) {
      const idx = arg[q];
      if (!(z[idx] > 0)) continue;
      const d = dP[q];
      const f = Math.floor(idx / 36);
      const i = Math.floor((idx % 36) / 6);
      const j = idx % 6;
      g.convB[f] += d;
      for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++) g.convW[f * 9 + a * 3 + c] += d * x[(i + a) * 8 + j + c];
    }
  }
  return { loss: loss / n, grads: g };
}

export const cloneCnn = (n: SmallCnn): SmallCnn => ({ classes: n.classes, convW: n.convW.slice(), convB: n.convB.slice(), headW: n.headW.slice(), headB: n.headB.slice() });

/**
 * Full-batch Adam on cross-entropy. With `freezeConv`, only the head is trained (the
 * pretrained filters are used as a fixed feature extractor).
 */
export function trainCnn(start: SmallCnn, images: ArrayLike<number>[], labels: number[], steps: number, lr = 0.01, freezeConv = false) {
  const net = cloneCnn(start);
  const keys = freezeConv ? (["headW", "headB"] as const) : (["convW", "convB", "headW", "headB"] as const);
  const state = keys.map((k) => ({ m: new Float64Array(net[k].length), v: new Float64Array(net[k].length) }));
  const [b1, b2, eps] = [0.9, 0.999, 1e-8];
  for (let t = 1; t <= steps; t++) {
    const { grads } = cnnLossGrads(net, images, labels);
    const c1 = 1 - b1 ** t;
    const c2 = 1 - b2 ** t;
    keys.forEach((key, n) => {
      const p = net[key];
      const gr = grads[key];
      const { m, v } = state[n];
      for (let q = 0; q < p.length; q++) {
        m[q] = b1 * m[q] + (1 - b1) * gr[q];
        v[q] = b2 * v[q] + (1 - b2) * gr[q] * gr[q];
        p[q] -= (lr * (m[q] / c1)) / (Math.sqrt(v[q] / c2) + eps);
      }
    });
  }
  return net;
}

/**
 * Multinomial logistic regression on given feature vectors (full-batch Adam with PyTorch’s
 * update rule), from zero weights. Written with flat typed arrays so it is fast enough to
 * run in the browser on a few thousand images.
 */
export function trainSoftmax(features: ArrayLike<number>[], labels: number[], classes: number, steps: number, lr = 0.05) {
  const n = features.length;
  const d = features[0].length;
  const X = new Float64Array(n * d);
  features.forEach((x, i) => X.set(x as ArrayLike<number>, i * d));
  const P = classes * d + classes; // weights, then biases
  const theta = new Float64Array(P);
  const g = new Float64Array(P);
  const m = new Float64Array(P);
  const v = new Float64Array(P);
  const z = new Float64Array(classes);
  const [b1, b2, eps] = [0.9, 0.999, 1e-8];
  for (let t = 1; t <= steps; t++) {
    g.fill(0);
    for (let i = 0; i < n; i++) {
      const off = i * d;
      let max = -Infinity;
      for (let k = 0; k < classes; k++) {
        let s = theta[classes * d + k];
        const wo = k * d;
        for (let j = 0; j < d; j++) s += theta[wo + j] * X[off + j];
        z[k] = s;
        if (s > max) max = s;
      }
      let sum = 0;
      for (let k = 0; k < classes; k++) {
        z[k] = Math.exp(z[k] - max);
        sum += z[k];
      }
      for (let k = 0; k < classes; k++) {
        const e = (z[k] / sum - (k === labels[i] ? 1 : 0)) / n;
        g[classes * d + k] += e;
        const wo = k * d;
        for (let j = 0; j < d; j++) g[wo + j] += e * X[off + j];
      }
    }
    const c1 = 1 - b1 ** t;
    const c2 = 1 - b2 ** t;
    for (let q = 0; q < P; q++) {
      m[q] = b1 * m[q] + (1 - b1) * g[q];
      v[q] = b2 * v[q] + (1 - b2) * g[q] * g[q];
      theta[q] -= (lr * (m[q] / c1)) / (Math.sqrt(v[q] / c2) + eps);
    }
  }
  const scores = (x: ArrayLike<number>) =>
    Array.from({ length: classes }, (_, k) => {
      let s = theta[classes * d + k];
      for (let j = 0; j < d; j++) s += theta[k * d + j] * x[j];
      return s;
    });
  return { predict: (x: ArrayLike<number>) => argmaxOf(scores(x)), scores, weights: theta.subarray(0, classes * d), bias: theta.subarray(classes * d) };
}

/** Pearson correlation of two equally long arrays. */
export function pearson(a: ArrayLike<number>, b: ArrayLike<number>) {
  const n = a.length;
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i];
    mb += b[i];
  }
  ma /= n;
  mb /= n;
  let s = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    s += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return da && db ? s / Math.sqrt(da * db) : 0;
}

/** How alike the original and shifted versions are at each stage: pixels, feature maps, pooled. */
export function shiftSimilarity(net: SmallCnn, image: ArrayLike<number>, dx: number, dy: number) {
  const moved = shiftImage(image, dx, dy);
  const a = cnnTrace(net, image);
  const b = cnnTrace(net, moved);
  return [pearson(image, moved), pearson(a.r.data, b.r.data), pearson(a.p.out.data, b.p.out.data)] as const;
}


/** The k pixels a map ranks highest, counting only positive values (ties broken by position). */
export function topPixels(m: ArrayLike<number>, k = 8) {
  return new Set(
    Array.from(m, (v, i) => [v, i] as const)
      .filter(([v]) => v > 0)
      .sort((a, b) => b[0] - a[0] || a[1] - b[1])
      .slice(0, k)
      .map(([, i]) => i),
  );
}
export const overlapCount = (a: Set<number>, b: Set<number>) => [...a].filter((i) => b.has(i)).length;
