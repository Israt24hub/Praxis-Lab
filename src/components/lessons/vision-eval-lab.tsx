"use client";

import { useMemo, useState } from "react";

import { fullCnn } from "@/content/datasets/digits-cnn";
import { cx } from "@/lib/cx";
import type { Digits } from "@/lib/digits";
import { cnnFrom, cnnInit, cnnInputGrad, cnnProbs, confusion, gradCam, occlusion, overlapCount, type SmallCnn, spearman, topPixels } from "@/lib/vision";

import { Checkbox, pct, Segmented, Stats, Verdict } from "./lab-ui";
import { diverging, heat, ink, PictureFrame, PixelGrid } from "./pixel-grid";
import { DigitsCredit, DigitsStatus, useDigits } from "./use-digits";

/*
 * "Evaluating and interpreting vision models": the trained digit CNN's confusion matrix on the
 * 539 test images, its mistakes, and three explanation maps for any image — with a check of
 * whether the maps depend on what the network learned at all.
 */

type Cell = { t: number; p: number } | null;


function ConfusionPanel({ d, net, preds, onPick }: { d: Digits; net: SmallCnn; preds: number[]; onPick: (i: number) => void }) {
  const [cell, setCell] = useState<Cell>(null);
  const counts = useMemo(() => {
    const c = Array.from({ length: 10 }, () => new Array<number>(10).fill(0));
    d.test.forEach((i, n) => c[d.labels[i]][preds[n]]++);
    return c;
  }, [d, preds]);
  const correct = counts.reduce((s, r, i) => s + r[i], 0);
  const shown = d.test
    .map((i, n) => ({ i, p: preds[n], t: d.labels[i] }))
    .filter((r) => (cell ? r.t === cell.t && r.p === cell.p : r.t !== r.p))
    .map((r) => ({ ...r, conf: Math.max(...cnnProbs(net, d.images[r.i])) }))
    .sort((a, b) => b.conf - a.conf)
    .slice(0, 12);
  return (
    <section aria-labelledby="ev-cm" className="space-y-5">
      <h3 id="ev-cm" className="font-semibold">
        1. Where does the model go wrong?
      </h3>
      <p className="text-sm text-fg-muted">
        The trained CNN gets {correct} of {d.test.length} test digits right ({pct(correct / d.test.length)}). Rows are the true digit, columns the prediction;
        everything off the diagonal is a mistake. Select a cell to see its images.
      </p>
      <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="overflow-x-auto rounded-panel border border-line bg-surface p-3">
          <table className="mx-auto border-collapse text-sm">
            <caption className="sr-only">Confusion matrix of the test set: true digit by predicted digit</caption>
            <thead>
              <tr>
                <th scope="col" className="max-w-16 px-1 py-1 text-xs font-semibold text-fg-muted">
                  true ↓ / predicted →
                </th>
                {counts.map((_, p) => (
                  <th key={p} scope="col" className="px-0.5 py-1 text-center font-mono text-xs @lg:text-sm">
                    {p}
                  </th>
                ))}
                <th scope="col" className="px-1 py-1 text-right text-xs font-semibold @lg:px-2">
                  recall
                </th>
              </tr>
            </thead>
            <tbody>
              {counts.map((row, t) => (
                <tr key={t}>
                  <th scope="row" className="px-1 py-0.5 text-center font-mono">
                    {t}
                  </th>
                  {row.map((n, p) => {
                    const sel = cell?.t === t && cell?.p === p;
                    const off = t !== p && n > 0;
                    return (
                      <td key={p} className="p-0.5">
                        <button
                          type="button"
                          disabled={n === 0}
                          aria-pressed={sel}
                          aria-label={`True ${t}, predicted ${p}: ${n} image${n === 1 ? "" : "s"}`}
                          onClick={() => setCell(sel ? null : { t, p })}
                          className={cx(
                            "h-6 w-6 rounded font-mono text-xs tabular-nums @lg:h-9 @lg:w-9 @lg:text-sm",
                            sel ? "outline-2 outline-offset-1 outline-primary" : "",
                            off ? "bg-danger font-bold text-on-primary" : t === p && n ? "border border-primary bg-mist font-semibold text-fg" : n ? "text-fg" : "text-fg-faint",
                          )}
                        >
                          {n || "·"}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-1 text-right font-mono text-xs tabular-nums @lg:px-2 @lg:text-sm">{pct(row[t] / row.reduce((a, b) => a + b, 0), 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="min-w-0 space-y-3">
          <p className="text-sm font-semibold">{cell ? `True ${cell.t}, predicted ${cell.p}` : `All ${d.test.length - correct} mistakes`}, most confident first</p>
          <ul className="grid grid-cols-3 gap-3 @md:grid-cols-4">
            {shown.map((r) => {
              return (
                <li key={r.i}>
                  <button type="button" onClick={() => onPick(r.i)} className="w-full rounded-control border border-line p-1.5 text-center hover:border-primary">
                    <PixelGrid w={8} h={8} fill={(y, x) => ink(d.images[r.i][y * 8 + x])} label={`Test image ${r.i}: a ${r.t} read as ${r.p}`} maxWidth={72} />
                    <span className="mt-1 block font-mono text-xs">
                      {r.t} → {r.p} ({pct(r.conf)})
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="text-sm text-fg-muted">Select an image to explain it below. The percentage is the model’s confidence in its answer.</p>
        </div>
      </div>
    </section>
  );
}

function ExplainPanel({ d, index, trained }: { d: Digits; index: number; trained: SmallCnn }) {
  const [random, setRandom] = useState(false);
  const [target, setTarget] = useState<"pred" | "true">("pred");
  const randomNet = useMemo(() => cnnInit(10, 1), []);
  const net = random ? randomNet : trained;
  const x = d.images[index];
  const probs = cnnProbs(net, x);
  const pred = probs.indexOf(Math.max(...probs));
  const label = d.labels[index];
  const k = target === "pred" ? pred : label;
  const maps = { grad: cnnInputGrad(net, x, k).map(Math.abs), cam: gradCam(net, x, k).upsampled, occ: occlusion(net, x, k) };
  const tops = { grad: topPixels(maps.grad), cam: topPixels(maps.cam), occ: topPixels(maps.occ) };
  const gMax = Math.max(1e-12, ...maps.grad);
  const cMax = Math.max(1e-12, ...maps.cam);
  const oMax = Math.max(1e-12, ...Array.from(maps.occ, Math.abs));
  const inkRho = spearman(maps.grad, x);
  // The model-randomisation check: how alike are the trained and untrained networks' gradient maps?
  const vsTrained = random ? spearman(maps.grad, cnnInputGrad(trained, x, k).map(Math.abs)) : null;
  const r2 = (v: number) => v.toFixed(2).replace("-", "−");
  const panels: [string, string, (y: number, xx: number) => string][] = [
    ["Gradient |∂score/∂pixel|", "How much a tiny change to each pixel would move the score.", (y, xx) => heat(maps.grad[y * 8 + xx] / gMax)],
    ["Grad-CAM", "Feature maps weighted by their average gradient, resized to 8 × 8.", (y, xx) => heat(maps.cam[y * 8 + xx] / cMax)],
    ["Occlusion", "How much the score drops when a 2 × 2 patch is blanked (orange) or rises (blue).", (y, xx) => diverging(maps.occ[y * 8 + xx] / oMax)],
  ];
  return (
    <section aria-labelledby="ev-explain" className="space-y-5">
      <h3 id="ev-explain" className="font-semibold">
        2. Why did it say that? Three explanation maps
      </h3>
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @3xl:items-end">
        <Segmented
          legend="Explain the score of"
          value={target}
          onChange={setTarget}
          options={[
            ["pred", `its answer (${pred})`],
            ["true", `the true digit (${label})`],
          ]}
        />
        <Checkbox checked={random} onChange={setRandom} label="Use an untrained network (random weights)" help="A sanity check: an explanation of the trained model should change." />
      </div>
      <div className="grid grid-cols-2 gap-4 @3xl:grid-cols-4">
        <PictureFrame caption={`Test image ${index}: a ${label}. ${random ? "Untrained" : "Trained"} model says ${pred} (${pct(probs[pred], 0)}).`}>
          <PixelGrid w={8} h={8} fill={(y, xx) => ink(x[y * 8 + xx])} label={`Test image ${index}, a handwritten ${label}.`} maxWidth={180} />
        </PictureFrame>
        {panels.map(([title, help, fill], n) => (
          <PictureFrame key={title} caption={help}>
            <p className="mb-1.5 text-center text-sm font-semibold">{title}</p>
            <PixelGrid
              w={8}
              h={8}
              fill={fill}
              boxes={[...(n === 0 ? tops.grad : n === 1 ? tops.cam : tops.occ)].map((i) => ({ x: i % 8, y: Math.floor(i / 8), w: 1, h: 1, tone: "#111827" }))}
              label={`${title} for class ${k}; its ${Math.min(8, (n === 0 ? tops.grad : n === 1 ? tops.cam : tops.occ).size)} highest positive pixels are outlined.`}
              maxWidth={180}
            />
          </PictureFrame>
        ))}
      </div>
      <Stats
        columns={4}
        items={[
          ["top-8 pixels shared: gradient & occlusion", `${overlapCount(tops.grad, tops.occ)} of 8`],
          ["Grad-CAM & occlusion", `${overlapCount(tops.cam, tops.occ)} of 8`],
          ["gradient & Grad-CAM", `${overlapCount(tops.grad, tops.cam)} of 8`],
          vsTrained === null ? ["gradient map vs the ink (rank correlation)", r2(inkRho)] : ["gradient map vs the trained model’s (rank correlation)", r2(vsTrained)],
        ]}
      />
      <Verdict tone={random ? "warn" : "neutral"} title={random ? "The untrained network’s maps still look like a digit" : "Three methods, three different answers"}>
        {random
          ? "Its prediction is meaningless, yet its gradient map still follows the strokes — across the test set even slightly more closely than the trained model’s. The two maps do differ (their rank correlation averages about 0.2), which is what the model-randomisation check tests. Looking plausible is not."
          : "On average over the test set, the eight most important pixels by gradient and by occlusion share only about 2 pixels (8 random picks would share 1). Each map answers a different question; treat any one of them as a hypothesis to test, not as proof."}
      </Verdict>
    </section>
  );
}

function Lab({ d }: { d: Digits }) {
  const net = useMemo(() => cnnFrom(fullCnn), []);
  const preds = useMemo(() => confusion(net, d.test.map((i) => d.images[i]), d.test.map((i) => d.labels[i])).predictions, [net, d]);
  const firstMistake = d.test.find((i, n) => preds[n] !== d.labels[i]) ?? d.test[0];
  const [index, setIndex] = useState(firstMistake);
  return (
    <div className="@container space-y-10">
      <ConfusionPanel d={d} net={net} preds={preds} onPick={setIndex} />
      <ExplainPanel d={d} index={index} trained={net} />
      <DigitsCredit extra="The network is the course’s trained digit CNN; every map is computed in your browser." />
    </div>
  );
}

export function VisionEvalLab() {
  const { data, error, retry } = useDigits();
  return data ? <Lab d={data} /> : <DigitsStatus error={error} retry={retry} />;
}
