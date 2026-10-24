/*
 * The made-up picture used by the detection lab: six apples on a 320 × 200 canvas and the output
 * of an imaginary detector (13 scored boxes, with duplicates and false alarms). Invented for
 * teaching; tests/fixtures/make_vision_extra.py re-types these boxes for the reference values.
 */
import type { BoxXYXY } from "./detection.ts";

export const SCENE_W = 320;
export const SCENE_H = 200;

export const APPLES: BoxXYXY[] = [
  [40, 60, 90, 110],
  [120, 40, 170, 92],
  [200, 90, 246, 136],
  [260, 30, 300, 72],
  [150, 130, 196, 176],
  [172, 134, 216, 178],
];

export const DETECTIONS: { box: BoxXYXY; score: number }[] = [
  { box: [42, 62, 92, 112], score: 0.96 },
  { box: [36, 56, 88, 106], score: 0.81 },
  { box: [118, 42, 168, 90], score: 0.92 },
  { box: [126, 48, 176, 98], score: 0.7 },
  { box: [204, 94, 252, 142], score: 0.88 },
  { box: [262, 34, 298, 74], score: 0.75 },
  { box: [70, 20, 110, 56], score: 0.66 },
  { box: [255, 24, 296, 68], score: 0.55 },
  { box: [151, 131, 197, 177], score: 0.62 },
  { box: [173, 135, 217, 179], score: 0.85 },
  { box: [10, 150, 50, 190], score: 0.38 },
  { box: [205, 88, 240, 128], score: 0.3 },
  { box: [222, 20, 252, 50], score: 0.22 },
];
