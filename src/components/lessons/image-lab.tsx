"use client";

import { useMemo, useState } from "react";

import { cx } from "@/lib/cx";
import { type Channel, downsample, grey, IMAGENET_MEAN, IMAGENET_STD, indexCHW, indexHWC, makeScene, normalize, SIZE, tensorBytes } from "@/lib/images";

import { Checkbox, Segmented, Stats, StepSlider, Verdict, ticks } from "./lab-ui";
import { PictureFrame, PixelGrid } from "./pixel-grid";

/*
 * Three panels for "Image representation and tensors", all computed in the browser from a
 * generated 16 × 16 image: pixels and channels in two memory layouts, the steps from bytes
 * to normalised model input, and what lowering the resolution keeps and loses.
 */

type View = "colour" | "r" | "g" | "b" | "grey";
const CH: [string, string][] = [
  ["R", "red"],
  ["G", "green"],
  ["B", "blue"],
];
const COORDS = ticks(0, SIZE - 1, 1);
const f3 = (v: number) => v.toFixed(3).replace("-", "−");
const kb = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MiB` : b >= 1024 ? `${(b / 1024).toFixed(1)} KiB` : `${b} bytes`);

function Pixels({ data, size, view, sel, label }: { data: ArrayLike<number>; size: number; view: View; sel?: [number, number]; label: string }) {
  const fill = (y: number, x: number) => {
    const [r, g, b] = [0, 1, 2].map((c) => Math.round(data[indexHWC(y, x, c, size)]));
    if (view === "colour") return `rgb(${r},${g},${b})`;
    const v = view === "grey" ? Math.round(grey(r, g, b)) : [r, g, b][view === "r" ? 0 : view === "g" ? 1 : 2];
    return `rgb(${v},${v},${v})`;
  };
  return <PixelGrid w={size} h={size} fill={fill} label={label} boxes={sel ? [{ x: sel[1], y: sel[0], w: 1, h: 1 }] : []} />;
}

function LayoutPanel({ img }: { img: Uint8Array }) {
  const [y, setY] = useState(4);
  const [x, setX] = useState(11);
  const [view, setView] = useState<View>("colour");
  const [layout, setLayout] = useState<"hwc" | "chw">("hwc");
  const rgb = [0, 1, 2].map((c) => img[indexHWC(y, x, c)]);
  const idx = [0, 1, 2].map((c) => (layout === "hwc" ? indexHWC(y, x, c) : indexCHW(y, x, c)));
  // A strip of memory around the selected pixel's red value.
  const start = Math.max(0, Math.min(SIZE * SIZE * 3 - 12, idx[0] - 3));
  const strip = Array.from({ length: 12 }, (_, i) => {
    const m = start + i;
    let c: number;
    let py: number;
    let px: number;
    if (layout === "hwc") {
      c = m % 3;
      const p = Math.floor(m / 3);
      py = Math.floor(p / SIZE);
      px = p % SIZE;
    } else {
      c = Math.floor(m / (SIZE * SIZE));
      const p = m % (SIZE * SIZE);
      py = Math.floor(p / SIZE);
      px = p % SIZE;
    }
    return { m, c, py, px, v: img[indexHWC(py, px, c)], mine: py === y && px === x };
  });

  return (
    <section aria-labelledby="im-layout" className="space-y-5">
      <h3 id="im-layout" className="font-semibold">
        1. An image is a grid of numbers
      </h3>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <div className="grid gap-5 @2xl:grid-cols-2">
          <StepSlider label="Row y (from the top)" values={COORDS} index={y} onChange={setY} />
          <StepSlider label="Column x (from the left)" values={COORDS} index={x} onChange={setX} />
        </div>
        <div className="grid gap-5 @2xl:grid-cols-2">
          <Segmented
            legend="Show"
            value={view}
            onChange={setView}
            options={[
              ["colour", "Colour"],
              ["r", "Red"],
              ["g", "Green"],
              ["b", "Blue"],
              ["grey", "Grey"],
            ]}
          />
          <Segmented
            legend="Memory layout"
            value={layout}
            onChange={setLayout}
            options={[
              ["hwc", "H × W × C (image files, NumPy)"],
              ["chw", "C × H × W (PyTorch)"],
            ]}
          />
        </div>
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <PictureFrame caption="The 16 × 16 image; the selected pixel is outlined.">
          <Pixels
            data={img}
            size={SIZE}
            view={view}
            sel={[y, x]}
            label={`The image ${view === "colour" ? "in colour" : view === "grey" ? "in grey" : `showing only the ${CH[view === "r" ? 0 : view === "g" ? 1 : 2][1]} channel`}; pixel (${y}, ${x}) is R ${rgb[0]}, G ${rgb[1]}, B ${rgb[2]}.`}
          />
        </PictureFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              ["pixel (row, column)", `(${y}, ${x})`],
              ["R, G, B", rgb.join(", ")],
              ["grey value", grey(rgb[0], rgb[1], rgb[2]).toFixed(1)],
              ["tensor shape", layout === "hwc" ? "(16, 16, 3)" : "(3, 16, 16)"],
              ["memory index of R, G, B", idx.join(", ")],
              ["values in the image", String(SIZE * SIZE * 3)],
            ]}
          />
          <figure>
            <figcaption className="mb-1.5 text-sm font-semibold">Twelve values in memory, in order</figcaption>
            <div className="grid grid-cols-6 gap-1 font-mono text-xs tabular-nums @md:grid-cols-12">
              {strip.map((s) => (
                <div key={s.m} className={cx("rounded border px-1 py-1 text-center", s.mine ? "border-primary bg-mist font-bold text-fg" : "border-line text-fg-muted")}>
                  <div className="font-sans">{CH[s.c][0]}</div>
                  <div>{s.v}</div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-fg-muted">
              {layout === "hwc"
                ? "H × W × C interleaves the channels: each pixel’s red, green and blue sit next to each other."
                : "C × H × W stores whole planes: all 256 red values, then all green, then all blue. The selected pixel’s three values are 256 apart."}
            </p>
          </figure>
        </div>
      </div>
    </section>
  );
}

function PipelinePanel({ img }: { img: Uint8Array }) {
  const [pi, setPi] = useState(1);
  const [forget, setForget] = useState(false);
  const PIXELS: [string, number, number][] = [
    ["Sky", 1, 2],
    ["Sun", 4, 11],
    ["Roof", 8, 5],
    ["Wall", 10, 3],
    ["Grass", 14, 12],
  ];
  const [, py, px] = PIXELS[pi];
  const rows = ([0, 1, 2] as Channel[]).map((c) => {
    const byte = img[indexHWC(py, px, c)];
    const scaled = forget ? byte : byte / 255;
    return { c, byte, scaled, norm: normalize(scaled, c) };
  });
  const big = rows.some((r) => Math.abs(r.norm) > 10);

  return (
    <section aria-labelledby="im-pipe" className="space-y-5">
      <h3 id="im-pipe" className="font-semibold">
        2. From bytes to the numbers a model expects
      </h3>
      <p className="text-sm text-fg-muted">
        Image files store each value as a byte from 0 to 255. A model pretrained on ImageNet expects floats scaled to 0–1 and then standardised with
        ImageNet’s per-channel mean and standard deviation.
      </p>
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @2xl:grid-cols-[minmax(0,1fr)_auto] @2xl:items-end">
        <Segmented legend="Pixel" value={String(pi)} onChange={(v) => setPi(Number(v))} options={PIXELS.map(([n], i) => [String(i), n] as const)} />
        <Checkbox checked={forget} onChange={setForget} label="Forget to divide by 255" help="A common bug: normalising the raw bytes." />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="overflow-x-auto rounded-panel border border-line bg-surface">
          <table className="w-full min-w-[22rem] border-collapse text-sm">
            <caption className="sr-only">Each channel of the selected pixel at each step</caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="px-3 py-2 font-semibold">
                  Channel
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  byte (0–255)
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  {forget ? "not scaled" : "÷ 255"}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  − mean, ÷ std
                </th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {rows.map((r) => (
                <tr key={r.c} className="border-b border-line last:border-0">
                  <th scope="row" className="px-3 py-2 text-left font-sans font-semibold">
                    {CH[r.c][1]} (mean {IMAGENET_MEAN[r.c]}, std {IMAGENET_STD[r.c]})
                  </th>
                  <td className="px-3 py-2 text-right">{r.byte}</td>
                  <td className="px-3 py-2 text-right">{forget ? r.scaled : f3(r.scaled)}</td>
                  <td className="px-3 py-2 text-right">{f3(r.norm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Verdict tone={big ? "bad" : "good"} title={big ? "Values in the hundreds: the model has never seen inputs like these" : "Values a pretrained model is used to"}>
          {big
            ? "Normalising raw bytes gives values up to about 1,111 where the model expects at most 2.64. The network still runs and still outputs a class, so nothing crashes — it is just wrong."
            : "After standardising, every possible value lies between −2.12 and +2.64, centred near 0: the scale the pretrained weights were trained on."}
        </Verdict>
      </div>
    </section>
  );
}

function ResolutionPanel({ img }: { img: Uint8Array }) {
  const [f, setF] = useState<"1" | "2" | "4">("1");
  const factor = Number(f);
  const small = useMemo(() => (factor === 1 ? { data: Float64Array.from(img), size: SIZE } : downsample(img, factor)), [img, factor]);
  const n = small.size;
  const at224 = tensorBytes(224, 224, 3, 4);
  return (
    <section aria-labelledby="im-res" className="space-y-5">
      <h3 id="im-res" className="font-semibold">
        3. Resolution
      </h3>
      <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented
          legend="Resolution"
          value={f}
          onChange={setF}
          options={[
            ["1", "16 × 16 (original)"],
            ["2", "8 × 8"],
            ["4", "4 × 4"],
          ]}
        />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <PictureFrame caption={factor === 1 ? "The original 16 × 16 image." : `Each new pixel is the average of a ${factor} × ${factor} block.`}>
          <Pixels data={small.data} size={n} view="colour" label={`The image at ${n} × ${n} pixels.`} />
        </PictureFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            columns={2}
            items={[
              ["shape (C, H, W)", `(3, ${n}, ${n})`],
              ["values", String(3 * n * n)],
              ["as bytes (uint8)", kb(tensorBytes(n, n, 3, 1))],
              ["as 32-bit floats", kb(tensorBytes(n, n, 3, 4))],
            ]}
          />
          <Verdict tone="neutral" title={factor === 1 ? "Every pixel kept" : `${factor * factor} pixels became 1`}>
            {factor === 1
              ? "Halving the width and height keeps a quarter of the values. Try 8 × 8 and 4 × 4: the house survives longer than its windows."
              : factor === 2
                ? "The sun and the house are still there; the windows have blurred into the wall. Small details disappear first."
                : "The house is now one reddish square: something red is there, but nothing says it is a house. A model cannot learn from detail that the input no longer contains."}
          </Verdict>
          <p className="text-sm text-fg-muted">
            For scale: one standard 224 × 224 RGB input is 150,528 values, {kb(at224)} as 32-bit floats; a batch of 32 is {kb(tensorBytes(224, 224, 3, 4, 32))}.
          </p>
        </div>
      </div>
    </section>
  );
}

export function ImageLab() {
  const img = useMemo(() => makeScene(), []);
  return (
    <div className="@container space-y-10">
      <LayoutPanel img={img} />
      <PipelinePanel img={img} />
      <ResolutionPanel img={img} />
      <p className="text-sm text-fg-faint">The picture is generated by a formula in your browser; every value shown is computed from it.</p>
    </div>
  );
}
