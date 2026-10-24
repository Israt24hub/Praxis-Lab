"use client";

import { useMemo, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { augCnn } from "@/content/datasets/digits-cnn-aug";
import { fullCnn } from "@/content/datasets/digits-cnn";
import { accuracyShifted, labelSurvival, TEST_SHIFTS, TRAIN_SHIFTS, trainLinear, TRANSFORMS, type TransformId } from "@/lib/augmentation";
import { cx } from "@/lib/cx";
import type { Digits } from "@/lib/digits";
import { argmaxOf, cnnFrom, cnnLogits, shiftImage } from "@/lib/vision";

import { pct, Segmented, Verdict } from "./lab-ui";
import { ink, PictureFrame, PixelGrid } from "./pixel-grid";
import { DigitsCredit, DigitsStatus, useDigits } from "./use-digits";

/*
 * "Image preprocessing and augmentation": which transforms keep a digit's label, and what
 * training on shifted copies buys — for a small CNN (trained both ways beforehand in PyTorch and
 * evaluated here) and for a linear model (trained here, both ways, on request).
 */

const NOTE: Record<TransformId, { tone: "good" | "warn" | "bad"; title: string; text: string }> = {
  flipH: {
    tone: "bad",
    title: "Not label-preserving for most digits",
    text: "A mirrored 3 or 7 is not a digit at all, so training on mirrored digits would teach the model shapes that never occur. Mirroring is a standard augmentation for photos of animals or cars, where a mirror image is still the same thing.",
  },
  flipV: {
    tone: "bad",
    title: "Changes or destroys most labels",
    text: "Upside-down handwriting does not occur in this task, and several digits turn into other shapes. Fine for satellite or microscope images, where there is no ‘up’.",
  },
  rot180: {
    tone: "bad",
    title: "A 6 turned around is a 9",
    text: "Here the label itself changes. An augmentation that turns 6s into 9s while keeping the label 6 teaches the model a contradiction.",
  },
  rot90: {
    tone: "bad",
    title: "Turned a quarter, almost everything is read as a 4",
    text: "So the 4s ‘surviving’ is an accident. Small rotations (a few degrees) are realistic for handwriting; a quarter turn is not. The amount of a transform matters as much as its kind.",
  },
  shift: {
    tone: "good",
    title: "A moved digit is still the same digit",
    text: "Every label survives a 1-pixel move — yet this network, trained only on centred digits, reads many of them wrongly. That is a gap augmentation can fill (part 2).",
  },
};

function SurvivalPanel({ d, net }: { d: Digits; net: ReturnType<typeof cnnFrom> }) {
  const [t, setT] = useState<TransformId>("rot180");
  const [digit, setDigit] = useState(6);
  const rows = useMemo(() => labelSurvival(d, net, t), [d, net, t]);
  const examples = useMemo(() => d.test.filter((i) => d.labels[i] === digit).slice(0, 6), [d, digit]);
  const note = NOTE[t];
  return (
    <section aria-labelledby="au-keep" className="space-y-5">
      <h3 id="au-keep" className="font-semibold">
        1. Does the label survive the transform?
      </h3>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented legend="Transform" value={t} onChange={setT} options={Object.entries(TRANSFORMS).map(([k, v]) => [k as TransformId, v.label] as const)} />
        <Segmented
          legend="Show examples of"
          value={String(digit)}
          onChange={(v) => setDigit(Number(v))}
          options={Array.from({ length: 10 }, (_, c) => [String(c), String(c)] as const)}
        />
      </div>
      <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <PictureFrame caption="Six test images: original above, transformed below, with what the trained network reads.">
          <div className="grid grid-cols-6 gap-2">
            {examples.map((i) => {
              const moved = TRANSFORMS[t].apply(d.images[i]);
              const p = argmaxOf(cnnLogits(net, moved));
              return (
                <div key={i} className="space-y-1 text-center">
                  <PixelGrid w={8} h={8} fill={(y, x) => ink(d.images[i][y * 8 + x])} label={`Original ${digit}`} maxWidth={64} />
                  <PixelGrid w={8} h={8} fill={(y, x) => ink(moved[y * 8 + x])} label={`Transformed ${digit}, read as ${p}`} maxWidth={64} />
                  <p className={cx("font-mono text-sm", p === digit ? "text-fg-muted" : "font-bold text-fg")}>→ {p}</p>
                </div>
              );
            })}
          </div>
        </PictureFrame>
        <div className="overflow-x-auto rounded-panel border border-line bg-surface">
          <table className="w-full min-w-[20rem] border-collapse text-sm">
            <caption className="px-3 pt-3 text-left font-semibold">After “{TRANSFORMS[t].label.toLowerCase()}”, the network reads…</caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="px-3 py-1.5 font-semibold">
                  Digit
                </th>
                <th scope="col" className="px-3 py-1.5 text-right font-semibold">
                  still itself
                </th>
                <th scope="col" className="px-3 py-1.5 text-right font-semibold">
                  most often read as
                </th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {rows.map((r) => (
                <tr key={r.digit} className={cx("border-b border-line last:border-0", r.digit === digit && "bg-mist")}>
                  <th scope="row" className="px-3 py-1 text-left">
                    {r.digit}
                  </th>
                  <td className="px-3 py-1 text-right">
                    {r.kept} / {r.total}
                  </td>
                  <td className="px-3 py-1 text-right">
                    {r.top} ({r.topCount})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Verdict tone={note.tone} title={note.title}>
        {note.text}
      </Verdict>
    </section>
  );
}

function ShiftTrainingPanel({ d, net }: { d: Digits; net: ReturnType<typeof cnnFrom> }) {
  const aug = useMemo(() => cnnFrom(augCnn), []);
  const [shift, setShift] = useState(1);
  const [linear, setLinear] = useState<null | "training" | { plain: number[]; aug: number[] }>(null);
  const s = TEST_SHIFTS[shift];
  const cnnAcc = useMemo(
    () => [net, aug].map((m) => TEST_SHIFTS.map((t) => accuracyShifted(d, (x) => argmaxOf(cnnLogits(m, x)), t.dx, t.dy))),
    [d, net, aug],
  );
  const trainBoth = () => {
    setLinear("training");
    setTimeout(() => {
      const plain = trainLinear(d, false).model;
      setTimeout(() => {
        const augm = trainLinear(d, true).model;
        setLinear({
          plain: TEST_SHIFTS.map((t) => accuracyShifted(d, plain.predict, t.dx, t.dy)),
          aug: TEST_SHIFTS.map((t) => accuracyShifted(d, augm.predict, t.dx, t.dy)),
        });
      }, 0);
    }, 30);
  };
  const example = d.test[3];
  const rows: [string, string, number | null, number | null][] = [
    ["Small CNN", "trained beforehand in PyTorch", cnnAcc[0][shift], cnnAcc[1][shift]],
    ["Linear model", "trained in your browser", linear && linear !== "training" ? linear.plain[shift] : null, linear && linear !== "training" ? linear.aug[shift] : null],
  ];
  const gain = cnnAcc[1][shift] - cnnAcc[0][shift];
  return (
    <section aria-labelledby="au-train" className="space-y-5">
      <h3 id="au-train" className="font-semibold">
        2. Train on shifted copies, then test on shifted digits
      </h3>
      <p className="text-sm text-fg-muted">
        Each model is trained twice: on the {d.train.length.toLocaleString("en-GB")} training images as they are, and on those plus copies moved one pixel left,
        right, up and down ({(d.train.length * TRAIN_SHIFTS.length).toLocaleString("en-GB")} images). The test images are never used for training; shifting
        them here is a stress test.
      </p>
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @3xl:grid-cols-[minmax(0,1fr)_auto] @3xl:items-center">
        <Segmented legend="Shift every test image" value={String(shift)} onChange={(v) => setShift(Number(v))} options={TEST_SHIFTS.map((t, i) => [String(i), t.label] as const)} />
        <div className="w-20">
          <PixelGrid w={8} h={8} fill={(y, x) => ink(shiftImage(d.images[example], s.dx, s.dy)[y * 8 + x])} label={`A test digit shifted: ${s.label}`} maxWidth={80} />
        </div>
      </div>
      <div className="overflow-x-auto rounded-panel border border-line bg-surface">
        <table className="w-full min-w-[20rem] border-collapse text-sm">
          <caption className="sr-only">Test accuracy with test images shifted {s.label.toLowerCase()}</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="px-3 py-2 font-semibold">
                Model
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                trained on originals
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                trained with shifted copies
              </th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map(([name, how, a, b]) => (
              <tr key={name} className="border-b border-line last:border-0">
                <th scope="row" className="px-3 py-2 text-left font-normal">
                  <span className="font-semibold">{name}</span> <span className="text-fg-muted">({how})</span>
                </th>
                <td className="px-3 py-2 text-right font-mono">{a === null ? "–" : pct(a)}</td>
                <td className="px-3 py-2 text-right font-mono">{b === null ? "–" : pct(b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {linear === null || linear === "training" ? (
        <button type="button" onClick={trainBoth} disabled={linear === "training"} className={buttonStyles("secondary", "px-4 py-2")}>
          {linear === "training" ? "Training the linear model twice…" : "Train the linear model both ways (about a second)"}
        </button>
      ) : null}
      <Verdict tone={shift === 0 ? "neutral" : gain > 0.1 ? "good" : "warn"} title={shift === 0 ? "On unshifted test digits, augmentation costs a little" : `Shifted copies: ${pct(cnnAcc[0][shift])} → ${pct(cnnAcc[1][shift])} for the CNN`}>
        {shift === 0
          ? "This is the number you would report: test images prepared exactly like real inputs. Training on shifted copies trades a little accuracy here for robustness when inputs move. Train the linear model too: with only one weight per pixel and class, it cannot learn every position at once, and pays far more."
          : s.dx === 1 && s.dy === 1
            ? "The model never saw a diagonal move in training, yet it still gains: the four one-pixel shifts taught it part of the general idea."
            : s.dx === 2
              ? "Two pixels is further than any training copy moved. The gain shrinks: augmentation protects mostly against the variation it shows the model."
              : "This is exactly the variation the shifted copies showed the model, and it now handles it."}
      </Verdict>
    </section>
  );
}

function Lab({ d }: { d: Digits }) {
  const net = useMemo(() => cnnFrom(fullCnn), []);
  return (
    <div className="@container space-y-10">
      <SurvivalPanel d={d} net={net} />
      <ShiftTrainingPanel d={d} net={net} />
      <DigitsCredit extra="All accuracies are computed in your browser on the 539 test digits." />
    </div>
  );
}

export function AugmentationLab() {
  const { data, error, retry } = useDigits();
  return data ? <Lab d={data} /> : <DigitsStatus error={error} retry={retry} />;
}
