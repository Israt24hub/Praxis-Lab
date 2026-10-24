/*
 * The augmentation experiments of the "Image preprocessing and augmentation" lab: what a few
 * transforms do to each digit's label (as the trained CNN reads it), and how much training on
 * shifted copies helps when test digits are shifted.
 */
import type { Digits } from "./digits.ts";
import { argmaxOf, cnnLogits, flipH, flipV, rotate180, rotate90, shiftImage, type SmallCnn, trainSoftmax } from "./vision.ts";

export const TRANSFORMS = {
  flipH: { label: "Mirror left–right", apply: (x: ArrayLike<number>) => flipH(x) },
  flipV: { label: "Flip upside down", apply: (x: ArrayLike<number>) => flipV(x) },
  rot180: { label: "Turn 180°", apply: (x: ArrayLike<number>) => rotate180(x) },
  rot90: { label: "Turn 90°", apply: (x: ArrayLike<number>) => rotate90(x) },
  shift: { label: "Move 1 pixel right", apply: (x: ArrayLike<number>) => shiftImage(x, 1, 0) },
} as const;
export type TransformId = keyof typeof TRANSFORMS;

/** For each digit: how many transformed test images the network still reads as that digit, and its most common reading. */
export function labelSurvival(d: Digits, net: SmallCnn, t: TransformId) {
  return Array.from({ length: 10 }, (_, c) => {
    const idx = d.test.filter((i) => d.labels[i] === c);
    const counts = new Array<number>(10).fill(0);
    for (const i of idx) counts[argmaxOf(cnnLogits(net, TRANSFORMS[t].apply(d.images[i])))]++;
    const top = argmaxOf(counts);
    return { digit: c, kept: counts[c], total: idx.length, top, topCount: counts[top] };
  });
}

/** The shifts used for training (the original plus one pixel each way) and for stress-testing. */
export const TRAIN_SHIFTS: [number, number][] = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
export const TEST_SHIFTS: { dx: number; dy: number; label: string }[] = [
  { dx: 0, dy: 0, label: "As they are" },
  { dx: 1, dy: 0, label: "1 right" },
  { dx: -1, dy: 0, label: "1 left" },
  { dx: 0, dy: 1, label: "1 down" },
  { dx: 0, dy: -1, label: "1 up" },
  { dx: 1, dy: 1, label: "1 right, 1 down" },
  { dx: 2, dy: 0, label: "2 right" },
];

export function accuracyShifted(d: Digits, predict: (x: ArrayLike<number>) => number, dx: number, dy: number) {
  return d.test.filter((i) => predict(shiftImage(d.images[i], dx, dy)) === d.labels[i]).length / d.test.length;
}

export const LINEAR_STEPS = 30;
export const LINEAR_LR = 0.1;

/** Logistic regression on the pixels, trained on the originals only or on all five shifted copies. */
export function trainLinear(d: Digits, augment: boolean) {
  const X: Float64Array[] = [];
  const y: number[] = [];
  for (const i of d.train)
    for (const [dx, dy] of augment ? TRAIN_SHIFTS : TRAIN_SHIFTS.slice(0, 1)) {
      X.push(shiftImage(d.images[i], dx, dy));
      y.push(d.labels[i]);
    }
  return { model: trainSoftmax(X, y, 10, LINEAR_STEPS, LINEAR_LR), n: X.length };
}
