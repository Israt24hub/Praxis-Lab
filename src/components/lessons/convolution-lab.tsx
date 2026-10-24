"use client";

import { useMemo, useState } from "react";

import { fullCnn } from "@/content/datasets/digits-cnn";
import type { Digits } from "@/lib/digits";
import { conv2d, outSize, vol } from "@/lib/vision";

import { Segmented, Stats, StepSlider, Verdict } from "./lab-ui";
import { diverging, ink, PictureFrame, PixelGrid } from "./pixel-grid";
import { DigitsCredit, DigitsStatus, useDigits } from "./use-digits";

/*
 * "Convolution and feature maps": slide a 3 × 3 filter over a real 8 × 8 digit, see the nine
 * multiplications behind one output value, and how stride and padding change the output size.
 */

type KernelId = "vertical" | "horizontal" | "blur" | "sharpen" | "learned" | "custom";
const HAND: Record<Exclude<KernelId, "learned" | "custom">, number[]> = {
  vertical: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
  horizontal: [-1, -2, -1, 0, 0, 0, 1, 2, 1],
  blur: Array(9).fill(1 / 9),
  sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
};
const KERNEL_NOTE: Record<KernelId, string> = {
  vertical: "Left column negative, right column positive: positive where paper turns into ink going right (a stroke’s left edge), negative at its right edge.",
  horizontal: "Top row negative, bottom row positive: positive at a stroke’s top edge, negative at its bottom edge.",
  blur: "Nine equal weights of 1/9: each output is the average of its 3 × 3 neighbourhood.",
  sharpen: "The centre minus its four neighbours, plus the centre again: boosts local contrast.",
  learned: "Nobody chose these weights; gradient descent did, while training the network to classify digits.",
  custom: "Your own filter. Try a single 1 off-centre (the image shifts), or −1 and 1 side by side (a tiny edge detector).",
};
const DIGIT_CHOICES = [0, 1, 3, 4, 7] as const;
const fmt = (v: number, d = 2) => (Math.abs(v) < 0.005 && d === 2 ? "0" : v.toFixed(d)).replace("-", "−");
const fmtW = (v: number) => (Number.isInteger(v) ? String(v) : Math.abs(v - 1 / 9) < 1e-12 ? "1/9" : v.toFixed(2)).replace("-", "−");

function Lab({ d }: { d: Digits }) {
  const [digit, setDigit] = useState<string>("4");
  const [kernel, setKernel] = useState<KernelId>("vertical");
  const [learned, setLearned] = useState(0);
  const [custom, setCustom] = useState([0, 0, 0, 0, 1, 0, 0, 0, 0]);
  const [stride, setStride] = useState<"1" | "2">("1");
  const [padding, setPadding] = useState<"0" | "1">("0");
  const [pos, setPos] = useState(9);

  const index = useMemo(() => d.test.find((i) => d.labels[i] === Number(digit)) ?? d.test[0], [d, digit]);
  const image = d.images[index];
  const s = Number(stride);
  const p = Number(padding);
  const weights = kernel === "learned" ? fullCnn.convW.slice(learned * 9, learned * 9 + 9) : kernel === "custom" ? custom : HAND[kernel];
  const bias = kernel === "learned" ? fullCnn.convB[learned] : 0;
  const out = useMemo(() => conv2d(vol(1, 8, 8, image), weights, [bias], 3, s, p), [image, weights, bias, s, p]);
  const n = out.h;
  const at = Math.min(pos, n * n - 1);
  const oy = Math.floor(at / n);
  const ox = at % n;
  const P = 8 + 2 * p; // padded size
  const px = (y: number, x: number) => (y < p || x < p || y >= 8 + p || x >= 8 + p ? 0 : image[(y - p) * 8 + (x - p)]);
  const inWindow = (y: number, x: number) => y >= oy * s && y < oy * s + 3 && x >= ox * s && x < ox * s + 3;
  const products = Array.from({ length: 9 }, (_, q) => px(oy * s + Math.floor(q / 3), ox * s + (q % 3)) * weights[q]);
  const value = out.data[at];
  const maxAbs = Math.max(1e-9, ...Array.from(out.data, Math.abs));
  const positions = Array.from({ length: n * n }, (_, i) => i);
  const fcParams = 64 * (8 * 36) + 8 * 36;

  return (
    <div className="@container space-y-10">
      <section aria-labelledby="cv-slide" className="space-y-5">
        <h3 id="cv-slide" className="font-semibold">
          1. Slide a filter over the image
        </h3>
        <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
          <div className="grid gap-5 @2xl:grid-cols-2">
            <Segmented legend="Digit" value={digit} onChange={setDigit} options={DIGIT_CHOICES.map((c) => [String(c), String(c)] as const)} />
            <Segmented
              legend="Filter"
              value={kernel}
              onChange={setKernel}
              options={[
                ["vertical", "Vertical edge"],
                ["horizontal", "Horizontal edge"],
                ["blur", "Blur"],
                ["sharpen", "Sharpen"],
                ["learned", "Learned by the CNN"],
                ["custom", "Your own"],
              ]}
            />
          </div>
          {kernel === "learned" ? (
            <StepSlider label="Which of the network’s 8 filters" values={[1, 2, 3, 4, 5, 6, 7, 8]} index={learned} onChange={setLearned} />
          ) : null}
          {kernel === "custom" ? (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Your filter’s nine weights (whole numbers from −9 to 9)</legend>
              <div className="grid w-fit grid-cols-3 gap-2">
                {custom.map((v, q) => (
                  <input
                    key={q}
                    type="number"
                    min={-9}
                    max={9}
                    step={1}
                    value={v}
                    aria-label={`Weight in row ${Math.floor(q / 3) + 1}, column ${(q % 3) + 1}`}
                    onChange={(e) => {
                      const n = Math.max(-9, Math.min(9, Math.round(Number(e.target.value) || 0)));
                      setCustom((c) => c.map((w, i) => (i === q ? n : w)));
                    }}
                    className="w-16 rounded-control border border-line-strong bg-page px-2 py-1.5 text-center font-mono text-sm"
                  />
                ))}
              </div>
            </fieldset>
          ) : null}
          <div className="grid gap-5 @2xl:grid-cols-3">
            <Segmented
              legend="Stride"
              value={stride}
              onChange={(v) => {
                setStride(v);
                setPos(0);
              }}
              options={[
                ["1", "1"],
                ["2", "2"],
              ]}
            />
            <Segmented
              legend="Padding"
              value={padding}
              onChange={(v) => {
                setPadding(v);
                setPos(0);
              }}
              options={[
                ["0", "None"],
                ["1", "1 pixel of zeros"],
              ]}
            />
            <StepSlider
              label="Output position"
              values={positions}
              index={at}
              onChange={setPos}
              format={(i) => `row ${Math.floor(i / n) + 1}, col ${(i % n) + 1}`}
            />
          </div>
        </div>

        <div className="grid gap-6 @3xl:grid-cols-3">
          <PictureFrame caption={p ? "Input with a border of zeros (pale). The window is outlined." : "Input (8 × 8). The 3 × 3 window is outlined."}>
            <PixelGrid
              w={P}
              h={P}
              fill={(y, x) => (y < p || x < p || y >= 8 + p || x >= 8 + p ? "rgb(214,226,240)" : ink(px(y, x)))}
              text={(y, x) => (inWindow(y, x) ? fmt(px(y, x), 1) : null)}
              boxes={[{ x: ox * s, y: oy * s, w: 3, h: 3 }]}
              label={`The digit ${digit}${p ? " with one pixel of zero padding" : ""}; the window covers rows ${oy * s + 1}–${oy * s + 3} and columns ${ox * s + 1}–${ox * s + 3}${p ? " of the padded image" : ""}.`}
              maxWidth={300}
            />
          </PictureFrame>
          <PictureFrame caption="Filter weights (orange positive, blue negative).">
            <PixelGrid
              w={3}
              h={3}
              fill={(y, x) => diverging(weights[y * 3 + x] / Math.max(1e-9, ...weights.map(Math.abs)))}
              text={(y, x) => fmtW(weights[y * 3 + x])}
              label={`Filter weights, row by row: ${weights.map(fmtW).join(", ")}${bias ? `; bias ${fmt(bias)}` : ""}.`}
              maxWidth={170}
              gridLines
            />
            <p className="mt-2 text-center text-sm text-fg-muted">{bias ? `bias ${fmt(bias)}` : "no bias"}</p>
          </PictureFrame>
          <PictureFrame caption={`Feature map (${n} × ${n}). The current output is outlined.`}>
            <PixelGrid
              w={n}
              h={n}
              fill={(y, x) => diverging(out.data[y * n + x] / maxAbs)}
              text={n <= 8 ? (y, x) => fmt(out.data[y * n + x], 1) : undefined}
              boxes={[{ x: ox, y: oy, w: 1, h: 1 }]}
              label={`Feature map of ${n} by ${n} values; the value at row ${oy + 1}, column ${ox + 1} is ${fmt(value)}.`}
              maxWidth={300}
            />
          </PictureFrame>
        </div>

        <div className="grid gap-6 @3xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="overflow-x-auto rounded-panel border border-line bg-surface p-4">
            <p className="mb-2 text-sm font-semibold">The nine multiplications for this output</p>
            <p className="font-mono text-sm leading-7 tabular-nums">
              {products.map((v, q) => (
                <span key={q}>
                  {q ? " + " : ""}
                  <span className="whitespace-nowrap">
                    {fmt(px(oy * s + Math.floor(q / 3), ox * s + (q % 3)), 2)}×{fmtW(weights[q])}
                  </span>
                </span>
              ))}
              {bias ? ` + ${fmt(bias)}` : ""} = <strong>{fmt(value)}</strong>
            </p>
          </div>
          <Verdict tone="neutral" title={`Output size: ⌊(8 + 2×${p} − 3) / ${s}⌋ + 1 = ${outSize(8, 3, s, p)}`}>
            {kernel === "learned" && learned === 0
              ? "This learned filter (with its bias) gives a negative value at every position of every test digit, so after the network’s ReLU it is always 0 — a ‘dead’ filter the network never uses."
              : KERNEL_NOTE[kernel]}
          </Verdict>
        </div>
      </section>

      <section aria-labelledby="cv-share" className="space-y-5">
        <h3 id="cv-share" className="font-semibold">
          2. One set of weights, every position
        </h3>
        <p className="text-sm text-fg-muted">
          The same nine weights (and one bias) were used at all {n * n} positions. That is weight sharing: a filter that detects a vertical stroke detects
          it anywhere in the picture.
        </p>
        <Stats
          items={[
            ["parameters in one 3 × 3 filter", "9 + 1 bias = 10"],
            ["the network’s layer: 8 filters", "80"],
            ["a dense layer making the same 8 × 6 × 6 outputs", fcParams.toLocaleString("en-GB")],
          ]}
        />
      </section>
      <DigitsCredit extra="Every value is computed in your browser; the learned filters are the trained network’s." />
    </div>
  );
}

export function ConvolutionLab() {
  const { data, error, retry } = useDigits();
  return data ? <Lab d={data} /> : <DigitsStatus error={error} retry={retry} />;
}
