/*
 * The transfer-learning experiment of the "Image classification and transfer learning" lab.
 * Source task: digits 0–4 (sourceCnn, trained beforehand in PyTorch). Target task: digits 5–9
 * from only k labelled training images per class. Four ways to learn the target, each trained
 * for the same 150 full-batch Adam steps and scored on every target test image.
 */
import { sourceCnn } from "../content/datasets/digits-cnn.ts";
import type { Digits } from "./digits.ts";
import { mulberry32, shuffled } from "./rng.ts";
import { argmaxOf, cnnFrom, cnnInit, cnnLogits, trainCnn, trainSoftmax } from "./vision.ts";

export const TRANSFER_STEPS = 150;
export const METHODS = ["linear", "scratch", "frozen", "finetune"] as const;
export type Method = (typeof METHODS)[number];
export const METHOD_LABEL: Record<Method, string> = {
  linear: "Linear model on pixels",
  scratch: "CNN from scratch",
  frozen: "Pretrained filters, frozen",
  finetune: "Pretrained, fine-tuned",
};

/** The k training images per target class (5–9) for one draw. */
export function drawTarget(d: Digits, k: number, seed: number) {
  const rand = mulberry32(seed);
  const pool = d.train.filter((i) => d.labels[i] >= 5);
  return [5, 6, 7, 8, 9].flatMap((c) =>
    shuffled(
      pool.filter((i) => d.labels[i] === c),
      rand,
    ).slice(0, k),
  );
}

export const targetTest = (d: Digits) => d.test.filter((i) => d.labels[i] >= 5);

/** Train one method on one draw and return its accuracy on the target test images. */
export function runMethod(d: Digits, method: Method, k: number, seed: number) {
  const idx = drawTarget(d, k, seed);
  const X = idx.map((i) => d.images[i]);
  const y = idx.map((i) => d.labels[i] - 5);
  const test = targetTest(d);
  let predict: (x: ArrayLike<number>) => number;
  if (method === "linear") predict = trainSoftmax(X, y, 5, TRANSFER_STEPS, 0.05).predict;
  else {
    let start;
    if (method === "scratch") start = cnnInit(5, 100 + seed);
    else {
      // The pretrained filters with a new, randomly initialised 5-way head.
      const src = cnnFrom(sourceCnn);
      start = { ...cnnInit(5, 200 + seed), convW: src.convW.slice(), convB: src.convB.slice() };
    }
    const net = trainCnn(start, X, y, TRANSFER_STEPS, 0.01, method === "frozen");
    predict = (x) => argmaxOf(cnnLogits(net, x));
  }
  const correct = test.filter((i) => predict(d.images[i]) === d.labels[i] - 5).length;
  return { accuracy: correct / test.length, correct, total: test.length };
}
