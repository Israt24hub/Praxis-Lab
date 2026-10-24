"use client";

import { useMemo, useState } from "react";

import { fullCnn } from "@/content/datasets/digits-cnn";
import type { Digits } from "@/lib/digits";
import { PRESETS, trace } from "@/lib/receptive";
import { cnnFrom, cnnTrace, pool2d, shiftSimilarity, vol } from "@/lib/vision";

import { Segmented, Stats, StepSlider, Verdict } from "./lab-ui";
import { heat, ink, PictureFrame, PixelGrid } from "./pixel-grid";
import { DigitsCredit, DigitsStatus, useDigits } from "./use-digits";

/*
 * "Pooling and CNN architectures": max and average pooling on the trained network's real feature
 * maps, how much pooling helps when the digit moves by a pixel, and how the receptive field and
 * output size change through a stack of layers (up to ResNet-18).
 */

const DIGITS = [0, 2, 4, 5, 7] as const;
const f1 = (v: number) => v.toFixed(1);
const f2 = (v: number) => v.toFixed(2).replace("-", "−");

function PoolPanel({ d, net }: { d: Digits; net: ReturnType<typeof cnnFrom> }) {
  const [digit, setDigit] = useState("4");
  const [filter, setFilter] = useState(1);
  const [kind, setKind] = useState<"max" | "avg">("max");
  const [cell, setCell] = useState(1);
  const index = useMemo(() => d.test.find((i) => d.labels[i] === Number(digit)) ?? d.test[0], [d, digit]);
  const t = useMemo(() => cnnTrace(net, d.images[index]), [net, d, index]);
  const map = Float64Array.from(t.r.data.subarray(filter * 36, filter * 36 + 36));
  const pooled = pool2d(vol(1, 6, 6, map), kind);
  const top = Math.max(1e-9, ...map);
  const u = Math.floor(cell / 3);
  const v = cell % 3;
  const win = [0, 1, 2, 3].map((q) => map[(2 * u + Math.floor(q / 2)) * 6 + 2 * v + (q % 2)]);
  const out = pooled.out.data[cell];
  return (
    <section aria-labelledby="pl-pool" className="space-y-5">
      <h3 id="pl-pool" className="font-semibold">
        1. Max and average pooling on real feature maps
      </h3>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <div className="grid gap-5 @2xl:grid-cols-2">
          <Segmented legend="Digit" value={digit} onChange={setDigit} options={DIGITS.map((c) => [String(c), String(c)] as const)} />
          <Segmented
            legend="Pooling"
            value={kind}
            onChange={setKind}
            options={[
              ["max", "Max of each 2 × 2"],
              ["avg", "Average of each 2 × 2"],
            ]}
          />
        </div>
        <div className="grid gap-5 @2xl:grid-cols-2">
          <StepSlider label="Feature map (one per filter)" values={[1, 2, 3, 4, 5, 6, 7, 8]} index={filter} onChange={setFilter} />
          <StepSlider label="Pooled output" values={[0, 1, 2, 3, 4, 5, 6, 7, 8]} index={cell} onChange={setCell} format={(i) => `row ${Math.floor(i / 3) + 1}, col ${(i % 3) + 1}`} />
        </div>
      </div>
      <div className="grid gap-6 @3xl:grid-cols-3">
        <PictureFrame caption="Input digit (8 × 8).">
          <PixelGrid w={8} h={8} fill={(y, x) => ink(d.images[index][y * 8 + x])} label={`A handwritten ${digit} from the test set.`} maxWidth={260} />
        </PictureFrame>
        <PictureFrame caption={`Feature map ${filter + 1} after ReLU (6 × 6). The 2 × 2 window is outlined.`}>
          <PixelGrid
            w={6}
            h={6}
            fill={(y, x) => heat(map[y * 6 + x] / top)}
            text={(y, x) => f1(map[y * 6 + x])}
            boxes={[{ x: 2 * v, y: 2 * u, w: 2, h: 2 }]}
            label={`Feature map ${filter + 1}: 36 values from 0 to ${f1(top)}. The window holds ${win.map(f1).join(", ")}.`}
            maxWidth={260}
          />
        </PictureFrame>
        <PictureFrame caption={`After ${kind === "max" ? "max" : "average"} pooling (3 × 3).`}>
          <PixelGrid
            w={3}
            h={3}
            fill={(y, x) => heat(pooled.out.data[y * 3 + x] / top)}
            text={(y, x) => f1(pooled.out.data[y * 3 + x])}
            boxes={[{ x: v, y: u, w: 1, h: 1 }]}
            label={`Pooled map of 9 values: ${Array.from(pooled.out.data, f1).join(", ")}.`}
            maxWidth={200}
          />
        </PictureFrame>
      </div>
      <Verdict tone="neutral" title={`${kind === "max" ? "max" : "mean"}(${win.map(f1).join(", ")}) = ${f2(out)}`}>
        {filter === 0
          ? "Filter 1 is all zeros: its output is negative everywhere on every test digit, so the ReLU always outputs 0. A ‘dead’ filter like this is one of the network’s 8 that it never uses. Try another."
          : kind === "max"
          ? "Max pooling keeps the strongest response in each window: “this feature appeared somewhere here”. 36 values become 9, with no weights to learn."
          : "Average pooling keeps how much of the feature the window holds, so a strong response next to three zeros is diluted to a quarter."}
      </Verdict>
    </section>
  );
}

function ShiftPanel({ d, net }: { d: Digits; net: ReturnType<typeof cnnFrom> }) {
  const [shift, setShift] = useState<"r1" | "d1" | "r2">("r1");
  const [dx, dy] = shift === "r1" ? [1, 0] : shift === "d1" ? [0, 1] : [2, 0];
  const mean = useMemo(() => {
    const sum = [0, 0, 0];
    for (const i of d.test) shiftSimilarity(net, d.images[i], dx, dy).forEach((v, k) => (sum[k] += v));
    return sum.map((s) => s / d.test.length);
  }, [d, net, dx, dy]);
  const stages = ["pixels", "feature maps (after ReLU)", "after max pooling"];
  return (
    <section aria-labelledby="pl-shift" className="space-y-5">
      <h3 id="pl-shift" className="font-semibold">
        2. Move the digit: what still matches?
      </h3>
      <p className="text-sm text-fg-muted">
        For each of the {d.test.length} test digits, compare the original with a shifted copy at three stages of the network, using the correlation
        between the two sets of numbers (1 means identical up to scale, 0 means unrelated).
      </p>
      <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented
          legend="Shift"
          value={shift}
          onChange={setShift}
          options={[
            ["r1", "1 pixel right"],
            ["d1", "1 pixel down"],
            ["r2", "2 pixels right"],
          ]}
        />
      </div>
      <Stats columns={3} items={stages.map((s, k) => [`average correlation: ${s}`, mean[k].toFixed(3).replace("-", "−")] as [string, string])} />
      <Verdict tone={shift === "r2" ? "warn" : "neutral"} title="Each stage tolerates the move a little better">
        {shift === "r2"
          ? "Two pixels is a quarter of the image’s width: the raw pixels are now unrelated, and pooling recovers only part of the similarity."
          : "The filters respond to strokes wherever they are, and pooling forgets exactly where in each 2 × 2 window they were. That is tolerance to small shifts, not invariance — this network still gets only about 57% of test digits right after a 1-pixel move to the right."}
      </Verdict>
    </section>
  );
}

function FieldPanel() {
  const [preset, setPreset] = useState<keyof typeof PRESETS>("resnet18");
  const P = PRESETS[preset];
  const rows = trace(P.layers, P.input);
  return (
    <section aria-labelledby="pl-field" className="space-y-5">
      <h3 id="pl-field" className="font-semibold">
        3. Receptive field and output size through a network
      </h3>
      <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented legend="Network" value={preset} onChange={setPreset} options={Object.entries(PRESETS).map(([k, v]) => [k, v.label] as const)} />
      </div>
      <div className="overflow-x-auto rounded-panel border border-line bg-surface">
        <table className="w-full min-w-[38rem] border-collapse text-sm">
          <caption className="sr-only">Output size, receptive field and jump (input pixels between neighbouring outputs) after each layer of {P.label}</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="px-3 py-2 font-semibold">
                Layer
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                k, stride, padding
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                output size
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                receptive field
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                jump
              </th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            <tr className="border-b border-line">
              <th scope="row" className="px-3 py-2 text-left font-normal text-fg-muted">
                input
              </th>
              <td className="px-3 py-2 text-right">–</td>
              <td className="px-3 py-2 text-right font-mono">
                {P.input} × {P.input}
              </td>
              <td className="px-3 py-2 text-right font-mono">1 × 1</td>
              <td className="px-3 py-2 text-right font-mono">1</td>
            </tr>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <th scope="row" className="px-3 py-2 text-left font-normal">
                  {r.name}
                </th>
                <td className="px-3 py-2 text-right font-mono">
                  {r.k}, {r.s}, {r.p}
                </td>
                <td className="px-3 py-2 text-right font-mono">
                  {r.size} × {r.size}
                </td>
                <td className="px-3 py-2 text-right font-mono">
                  {r.field} × {r.field}
                </td>
                <td className="px-3 py-2 text-right font-mono">{r.jump}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Verdict tone="neutral" title={`One final output sees ${rows.at(-1)!.field} × ${rows.at(-1)!.field} input pixels`}>
        {preset === "course"
          ? "A 3 × 3 convolution then a 2 × 2 pool: each of the 72 features sees a 4 × 4 patch of the 8 × 8 digit."
          : preset === "stacked"
            ? "After three stacked 3 × 3 convolutions each output sees 7 × 7, like one 7 × 7 filter, with 27 instead of 49 weights per input–output channel pair and a ReLU between each — the VGG design. The pool then widens the view to 8 × 8 and halves the resolution."
            : "Each stride-2 layer doubles the jump, so later 3 × 3 layers widen the view fast. The residual shortcuts (not listed) add the block’s input to its output; they make deep stacks trainable but do not widen the view. A receptive field larger than the 224-pixel image just means padding is included."}
      </Verdict>
    </section>
  );
}

function Lab({ d }: { d: Digits }) {
  const net = useMemo(() => cnnFrom(fullCnn), []);
  return (
    <div className="@container space-y-10">
      <PoolPanel d={d} net={net} />
      <ShiftPanel d={d} net={net} />
      <FieldPanel />
      <DigitsCredit extra="Feature maps are the trained network’s, computed in your browser." />
    </div>
  );
}

export function PoolingLab() {
  const { data, error, retry } = useDigits();
  return data ? <Lab d={data} /> : <DigitsStatus error={error} retry={retry} />;
}
