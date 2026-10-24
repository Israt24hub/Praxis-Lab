/*
 * Box and mask arithmetic for the "Object detection and segmentation" lab: IoU, non-maximum
 * suppression, matching detections to ground truth, precision–recall and average precision,
 * and mask overlap. Boxes are [x1, y1, x2, y2] in pixels, as torchvision.ops uses them.
 * Checked against torchvision.ops and pycocotools in tests/vision.test.ts.
 */
export type BoxXYXY = readonly [number, number, number, number];

export const area = (b: BoxXYXY) => Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]);

export function intersection(a: BoxXYXY, b: BoxXYXY) {
  const w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]);
  const h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
  return w > 0 && h > 0 ? w * h : 0;
}

/** Intersection over union: overlap area divided by the area covered by either box. */
export function iou(a: BoxXYXY, b: BoxXYXY) {
  const inter = intersection(a, b);
  const union = area(a) + area(b) - inter;
  return union > 0 ? inter / union : 0;
}

/**
 * Greedy non-maximum suppression: take the highest-scoring box, drop every remaining box that
 * overlaps it by more than `threshold` IoU, repeat. Returns kept indices, highest score first.
 */
export function nms(boxes: readonly BoxXYXY[], scores: readonly number[], threshold: number) {
  const order = scores.map((_, i) => i).sort((i, j) => scores[j] - scores[i] || i - j);
  const removed = new Array<boolean>(boxes.length).fill(false);
  const keep: number[] = [];
  for (const i of order) {
    if (removed[i]) continue;
    keep.push(i);
    for (const j of order) if (!removed[j] && j !== i && iou(boxes[i], boxes[j]) > threshold) removed[j] = true;
  }
  return keep;
}

export interface Match {
  /** Index of the detection, in the order given (sorted by score inside). */
  det: number;
  score: number;
  /** Ground-truth box it was matched to, or -1 for a false positive. */
  gt: number;
  /** Best IoU with any ground-truth box. */
  bestIou: number;
  tp: boolean;
}

/**
 * Match detections to ground truth the way COCO does: in order of decreasing score, each
 * detection takes the unmatched ground-truth box it overlaps most, if that IoU is at least the
 * threshold; otherwise it is a false positive. A ground-truth box can be matched only once.
 */
export function matchDetections(dets: readonly BoxXYXY[], scores: readonly number[], gts: readonly BoxXYXY[], threshold: number): Match[] {
  const order = scores.map((_, i) => i).sort((i, j) => scores[j] - scores[i] || i - j);
  const taken = new Array<boolean>(gts.length).fill(false);
  return order.map((d) => {
    let bestFree = -1;
    let bestFreeIou = threshold;
    let bestIou = 0;
    gts.forEach((g, k) => {
      const o = iou(dets[d], g);
      if (o > bestIou) bestIou = o;
      if (!taken[k] && o >= bestFreeIou) {
        bestFreeIou = o;
        bestFree = k;
      }
    });
    if (bestFree >= 0) taken[bestFree] = true;
    return { det: d, score: scores[d], gt: bestFree, bestIou, tp: bestFree >= 0 };
  });
}

/** Precision and recall after each detection, in score order. */
export function precisionRecall(matches: readonly Match[], nGt: number) {
  let tp = 0;
  let fp = 0;
  return matches.map((m) => {
    if (m.tp) tp++;
    else fp++;
    return { precision: tp / (tp + fp), recall: nGt ? tp / nGt : 0, tp, fp };
  });
}

/**
 * COCO-style average precision: make precision non-increasing from the right (the "envelope"),
 * read it at the 101 recall levels 0, 0.01, …, 1, and average. Recall levels that are never
 * reached count as 0.
 */
export function averagePrecision(matches: readonly Match[], nGt: number) {
  const pr = precisionRecall(matches, nGt);
  const env = pr.map((p) => p.precision);
  for (let i = env.length - 2; i >= 0; i--) env[i] = Math.max(env[i], env[i + 1]);
  let sum = 0;
  for (let r = 0; r <= 100; r++) {
    // The same floating-point levels as COCO's np.linspace(0, 1, 101).
    const level = r === 100 ? 1 : r * 0.01;
    const i = pr.findIndex((p) => p.recall >= level);
    sum += i >= 0 ? env[i] : 0;
  }
  return sum / 101;
}

/** COCO's headline AP: the average of AP over the IoU thresholds 0.50, 0.55, …, 0.95. */
export const COCO_THRESHOLDS = Array.from({ length: 10 }, (_, i) => (i === 9 ? 0.95 : i * ((0.95 - 0.5) / 9) + 0.5));
export function cocoAp(dets: readonly BoxXYXY[], scores: readonly number[], gts: readonly BoxXYXY[]) {
  const per = COCO_THRESHOLDS.map((t) => averagePrecision(matchDetections(dets, scores, gts, t), gts.length));
  return { per, mean: per.reduce((s, v) => s + v, 0) / per.length };
}

/* ---------- Masks ---------- */

export function maskScores(pred: ArrayLike<boolean | number>, truth: ArrayLike<boolean | number>) {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  for (let i = 0; i < truth.length; i++) {
    const p = Boolean(pred[i]);
    const t = Boolean(truth[i]);
    if (p && t) tp++;
    else if (p) fp++;
    else if (t) fn++;
    else tn++;
  }
  return {
    tp,
    fp,
    fn,
    tn,
    pixelAccuracy: (tp + tn) / truth.length,
    iou: tp + fp + fn ? tp / (tp + fp + fn) : 1,
    dice: tp + fp + fn ? (2 * tp) / (2 * tp + fp + fn) : 1,
  };
}

/** A filled disc on an n × n grid (1 inside, 0 outside). */
export function disc(n: number, cx: number, cy: number, r: number) {
  return Uint8Array.from({ length: n * n }, (_, i) => ((i % n) - cx) ** 2 + (Math.floor(i / n) - cy) ** 2 <= r * r ? 1 : 0);
}

export function shiftMask(m: ArrayLike<number>, n: number, dx: number, dy: number) {
  return Uint8Array.from({ length: n * n }, (_, i) => {
    const x = (i % n) - dx;
    const y = Math.floor(i / n) - dy;
    return x >= 0 && x < n && y >= 0 && y < n ? m[y * n + x] : 0;
  });
}

/** Grow (dilate) or shrink (erode) a mask by one pixel, using the four side neighbours. */
export function growMask(m: ArrayLike<number>, n: number, grow: boolean) {
  return Uint8Array.from({ length: n * n }, (_, i) => {
    const x = i % n;
    const y = Math.floor(i / n);
    const nb = [m[i], x > 0 ? m[i - 1] : 0, x < n - 1 ? m[i + 1] : 0, y > 0 ? m[i - n] : 0, y < n - 1 ? m[i + n] : 0];
    return grow ? (nb.some(Boolean) ? 1 : 0) : nb.every(Boolean) ? 1 : 0;
  });
}
