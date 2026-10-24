"use client";

import { useMemo, useState } from "react";

import { collapseLinear, type DatasetId, PLANE_RANGE, planeData, trainBoundary } from "@/lib/boundaries";
import { type Activation, activations, forward, countParams } from "@/lib/nn";

import { ChartFrame, Checkbox, LegendItem, Segmented, Stats, StepSlider, Verdict, ticks } from "./lab-ui";

/*
 * Two panels for "Neural network layers and activations". The first plots the common
 * activation functions and their slopes. The second trains a network with one hidden
 * layer in the browser and draws the boundary it learns, so learners can see that
 * without a non-linear activation, extra units and layers still only draw a line.
 */

const ACT_COLOURS: Record<Exclude<Activation, "linear">, string> = {
  relu: "var(--dg-cat-1)",
  sigmoid: "var(--dg-cat-2)",
  tanh: "var(--dg-cat-3)",
  gelu: "var(--dg-cat-5)",
};
const ACT_DASH: Record<Exclude<Activation, "linear">, string | undefined> = { relu: undefined, sigmoid: "7 4", tanh: "2 3", gelu: "10 3 2 3" };
const SHOWN = ["relu", "sigmoid", "tanh", "gelu"] as const;
/** Accuracy over 80 points: whole percentages, or one decimal when there is a half (52.5%). */
const acc = (a: number) => {
  const v = Math.round(a * 1000) / 10;
  return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)}%`;
};
const ZS = ticks(-4, 4, 0.25);

function ActivationPanel() {
  const [zi, setZi] = useState(ZS.indexOf(1));
  const [slopes, setSlopes] = useState(false);
  const z = ZS[zi];
  const W = 560;
  const H = 300;
  const pad = { l: 40, r: 16, t: 16, b: 34 };
  const [y0, y1] = slopes ? [-0.25, 1.25] : [-1.25, 4];
  const sx = (v: number) => pad.l + ((v + 4) / 8) * (W - pad.l - pad.r);
  const sy = (v: number) => H - pad.b - ((v - y0) / (y1 - y0)) * (H - pad.t - pad.b);
  const curve = (f: (v: number) => number) =>
    Array.from({ length: 321 }, (_, i) => -4 + i / 40)
      .map((v, i) => `${i ? "L" : "M"}${sx(v).toFixed(1)} ${sy(Math.max(y0 - 1, Math.min(y1 + 1, f(v)))).toFixed(1)}`)
      .join(" ");
  const yTicks = slopes ? [0, 0.5, 1] : [-1, 0, 1, 2, 3, 4];

  return (
    <section aria-labelledby="ly-act" className="space-y-5">
      <h3 id="ly-act" className="font-semibold">
        1. Four activation functions
      </h3>
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @2xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] @2xl:items-end">
        <StepSlider label="Pre-activation z" values={ZS} index={zi} onChange={setZi} format={(v) => v.toFixed(2)} />
        <Checkbox checked={slopes} onChange={setSlopes} label="Show slopes φ′(z) instead" help="The slope is what backpropagation multiplies by." />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <ChartFrame
          label={slopes ? "Chart: slopes of four activation functions" : "Chart: four activation functions"}
          focus={sx(z) / W}
          legend={SHOWN.map((k) => (
            <LegendItem key={k} swatch={<line x1="0" y1="7" x2="20" y2="7" stroke={ACT_COLOURS[k]} strokeWidth="2.5" strokeDasharray={ACT_DASH[k]} />}>
              {activations[k].label}
            </LegendItem>
          ))}
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${slopes ? "Slopes" : "Values"} of ReLU, sigmoid, tanh and GELU for z from −4 to 4, with z = ${z} marked.`}>
            {yTicks.map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="dg-grid" />
                <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="dg-label">
                  {t}
                </text>
              </g>
            ))}
            {ticks(-4, 4, 1).map((t) => (
              <text key={t} x={sx(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                {t}
              </text>
            ))}
            <line x1={sx(0)} x2={sx(0)} y1={pad.t} y2={H - pad.b} stroke="var(--color-line-strong)" />
            <line x1={pad.l} x2={W - pad.r} y1={sy(0)} y2={sy(0)} stroke="var(--color-line-strong)" />
            <defs>
              <clipPath id="ly-act-clip">
                <rect x={pad.l} y={pad.t} width={W - pad.l - pad.r} height={H - pad.t - pad.b} />
              </clipPath>
            </defs>
            <g clipPath="url(#ly-act-clip)">
              {SHOWN.map((k) => (
                <path key={k} d={curve(slopes ? activations[k].df : activations[k].f)} fill="none" stroke={ACT_COLOURS[k]} strokeWidth={2.5} strokeDasharray={ACT_DASH[k]} />
              ))}
            </g>
            <line x1={sx(z)} x2={sx(z)} y1={pad.t} y2={H - pad.b} stroke="var(--dg-ink)" strokeDasharray="3 3" />
            {SHOWN.map((k) => {
              const v = slopes ? activations[k].df(z) : activations[k].f(z);
              return v >= y0 && v <= y1 ? <circle key={k} cx={sx(z)} cy={sy(v)} r={4.5} fill={ACT_COLOURS[k]} stroke="var(--color-surface)" strokeWidth={1.5} /> : null;
            })}
            <text x={W - pad.r} y={H - 4} textAnchor="end" className="dg-label">
              z
            </text>
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <div className="overflow-x-auto rounded-panel border border-line bg-surface">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Each activation and its slope at z = {z}</caption>
              <thead>
                <tr className="border-b border-line text-left">
                  <th scope="col" className="px-3 py-2 font-semibold">
                    At z = {z.toFixed(2)}
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">
                    φ(z)
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">
                    slope φ′(z)
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {SHOWN.map((k) => (
                  <tr key={k} className="border-b border-line last:border-0">
                    <th scope="row" className="px-3 py-2 text-left font-sans font-semibold">
                      {activations[k].label}
                    </th>
                    <td className="px-3 py-2 text-right">{activations[k].f(z).toFixed(4)}</td>
                    <td className="px-3 py-2 text-right">{activations[k].df(z).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Verdict tone="neutral" title={z === 0 ? "At z = 0" : z > 0 ? "Positive z" : "Negative z"}>
            {z <= -2
              ? "ReLU is exactly 0 with slope 0: a ReLU unit here passes no gradient back. Sigmoid and tanh are nearly flat; GELU’s slope is small but not zero."
              : z >= 2
                ? "ReLU and GELU grow like z itself, with slope about 1. Sigmoid and tanh are flattening out (saturating): their slopes shrink towards 0."
                : z === 0
                  ? "Sigmoid is 0.5 with its largest slope, 0.25; tanh is 0 with slope 1. ReLU’s slope jumps from 0 to 1 here (PyTorch uses 0 at exactly z = 0)."
                  : "Near zero, sigmoid, tanh and GELU are all bending; that bend is what lets stacked layers draw curves."}
          </Verdict>
        </div>
      </div>
    </section>
  );
}

const DATASETS: [DatasetId, string][] = [
  ["blobs", "Two blobs"],
  ["xor", "XOR (four corners)"],
  ["circle", "Circle inside a ring"],
];
const ACTS: Activation[] = ["linear", "relu", "tanh", "sigmoid", "gelu"];
const HIDDEN = [0, 1, 2, 3, 4, 8];
const STEPS = [0, 25, 50, 100, 200, 500, 1000];
const GRID = 56;
const BANDS = 5;

function BoundaryPanel() {
  const [dataId, setDataId] = useState<DatasetId>("xor");
  const [act, setAct] = useState<Activation>("tanh");
  const [hi, setHi] = useState(HIDDEN.indexOf(4));
  const [si, setSi] = useState(STEPS.indexOf(500));
  const hidden = HIDDEN[hi];
  const steps = STEPS[si];
  const data = useMemo(() => planeData(dataId), [dataId]);
  const run = useMemo(() => trainBoundary(data, hidden, act, steps), [data, hidden, act, steps]);

  const S = 420;
  const pad = 30;
  const R = PLANE_RANGE;
  const sx = (v: number) => pad + ((v + R) / (2 * R)) * (S - 2 * pad);
  const sy = (v: number) => S - pad - ((v + R) / (2 * R)) * (S - 2 * pad);

  // Shade the plane by the predicted probability: BANDS confidence bands on each side of 0.5.
  const shading = useMemo(() => {
    const cell = (2 * R) / GRID;
    const pts: number[][] = [];
    for (let j = 0; j < GRID; j++) for (let i = 0; i < GRID; i++) pts.push([-R + (i + 0.5) * cell, -R + (j + 0.5) * cell]);
    const logits = forward(run.net, pts).outs[run.net.length - 1];
    const one = Array.from({ length: BANDS }, () => "");
    const zero = Array.from({ length: BANDS }, () => "");
    const px = (S - 2 * pad) / GRID;
    logits.forEach(([z], k) => {
      const p = 1 / (1 + Math.exp(-z));
      const band = Math.min(BANDS - 1, Math.floor(Math.abs(p - 0.5) * 2 * BANDS));
      const i = k % GRID;
      const j = Math.floor(k / GRID);
      const d = `M${(pad + i * px).toFixed(2)} ${(S - pad - (j + 1) * px).toFixed(2)}h${px.toFixed(2)}v${px.toFixed(2)}h${(-px).toFixed(2)}Z`;
      if (p >= 0.5) one[band] += d;
      else zero[band] += d;
    });
    return { one, zero };
  }, [run, R]);

  const hiddenOut = hidden > 0 ? forward(run.net, data.X).outs[0] : null;
  const dead = hiddenOut ? Array.from({ length: hidden }, (_, j) => hiddenOut.every((r) => r[j] === 0)).filter(Boolean).length : 0;
  const collapsed = act === "linear" || hidden === 0 ? collapseLinear(run.net) : null;
  const fmtW = (v: number) => (Math.abs(v) < 0.005 ? "0.00" : v.toFixed(2));

  const verdict =
    steps === 0
      ? { tone: "neutral" as const, title: "Untrained", text: "These are the starting weights, drawn at random (with a fixed seed). Add training steps to watch the boundary move." }
      : collapsed && hidden > 0
        ? {
            tone: "bad" as const,
            title: `No activation: ${hidden} hidden unit${hidden === 1 ? "" : "s"} collapse into one straight line`,
            text: `A linear step applied to a linear step is still one linear step: this network computes exactly z = ${fmtW(collapsed.w[0])}·x₁ + ${fmtW(collapsed.w[1])}·x₂ + ${fmtW(collapsed.b)}, whose boundary is a line.`,
          }
        : hidden === 0
          ? { tone: "neutral" as const, title: "No hidden layer: logistic regression", text: "One linear step and a sigmoid. Its boundary is always a straight line." }
          : run.accuracy === 1
            ? { tone: "good" as const, title: "Every training point is on the right side", text: `The ${activations[act].label} units bend the boundary to fit the classes.${dead ? ` (${dead} of ${hidden} units never switch on, so the rest did the work.)` : ""}` }
            : dead > 0
              ? {
                  tone: "warn" as const,
                  title: `Stuck at ${acc(run.accuracy)}: ${dead} of ${hidden} ReLU units are dead`,
                  text: "A dead ReLU outputs 0 for every training point, so its gradient is 0 and training cannot revive it. The units left alive cannot draw the shape. More units, another activation or another starting point usually fix it.",
                }
              : { tone: "warn" as const, title: `${acc(run.accuracy)} of training points on the right side`, text: "The boundary has not reached the shape yet: too few units for this shape, or too few steps." };

  return (
    <section aria-labelledby="ly-boundary" className="space-y-5">
      <h3 id="ly-boundary" className="font-semibold">
        2. What a hidden layer can draw
      </h3>
      <p className="text-sm text-fg-muted">
        A network with inputs x₁ and x₂, one hidden layer and one output is trained in your browser (binary cross-entropy, full-batch Adam, learning rate 0.05,
        fixed starting weights). The shading is its predicted probability of the filled class.
      </p>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented legend="Data" value={dataId} onChange={setDataId} options={DATASETS} />
        <Segmented legend="Hidden-layer activation" value={act} onChange={setAct} options={ACTS.map((a) => [a, activations[a].label] as const)} />
        <div className="grid gap-5 @2xl:grid-cols-2">
          <StepSlider label="Hidden units" values={HIDDEN} index={hi} onChange={setHi} help={hidden === 0 ? "0 = no hidden layer (logistic regression)." : undefined} />
          <StepSlider label="Training steps" values={STEPS} index={si} onChange={setSi} />
        </div>
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: training points and the network’s decision regions"
          focus={[0.15, 0.85]}
          legend={
            <>
              <LegendItem swatch={<circle cx="10" cy="7" r="4.5" fill="var(--dg-ink)" />}>class 1</LegendItem>
              <LegendItem swatch={<circle cx="10" cy="7" r="4.5" fill="var(--color-surface)" stroke="var(--dg-ink)" strokeWidth="1.75" />}>class 0</LegendItem>
              <LegendItem swatch={<rect x="1" y="1" width="18" height="12" fill="var(--dg-hl)" fillOpacity="0.4" />}>predicted class 1</LegendItem>
              <LegendItem swatch={<rect x="1" y="1" width="18" height="12" fill="var(--color-highlight)" fillOpacity="0.3" />}>predicted class 0</LegendItem>
            </>
          }
        >
          <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto h-auto w-full max-w-[440px]" role="img" aria-label={`Decision regions after ${steps} steps: ${acc(run.accuracy)} of the ${data.y.length} training points are classified correctly.`}>
            {shading.one.map((d, k) => (
              <path key={`o${k}`} d={d} fill="var(--dg-hl)" fillOpacity={0.06 + 0.4 * (k / (BANDS - 1))} shapeRendering="crispEdges" />
            ))}
            {shading.zero.map((d, k) => (
              <path key={`z${k}`} d={d} fill="var(--color-highlight)" fillOpacity={0.04 + 0.3 * (k / (BANDS - 1))} shapeRendering="crispEdges" />
            ))}
            <rect x={pad} y={pad} width={S - 2 * pad} height={S - 2 * pad} fill="none" stroke="var(--color-line-strong)" />
            {ticks(-2, 2, 1).map((t) => (
              <g key={t}>
                <text x={sx(t)} y={S - 6} textAnchor="middle" className="dg-label">
                  {t}
                </text>
                <text x={pad - 6} y={sy(t) + 4} textAnchor="end" className="dg-label">
                  {t}
                </text>
              </g>
            ))}
            {data.X.map(([a, b], i) => (
              <circle key={i} cx={sx(a)} cy={sy(b)} r={4.5} fill={data.y[i] ? "var(--dg-ink)" : "var(--color-surface)"} stroke="var(--dg-ink)" strokeWidth={1.75} />
            ))}
            <text x={S - pad} y={pad - 8} textAnchor="end" className="dg-label">
              x₁ →  x₂ ↑
            </text>
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              ["training accuracy", acc(run.accuracy)],
              ["loss (cross-entropy)", run.loss.toFixed(3)],
              ["parameters", String(countParams(run.net))],
              ["hidden units", hidden === 0 ? "none" : String(hidden)],
              ["units never active", hidden === 0 || act !== "relu" ? "—" : `${dead} of ${hidden}`],
              ["steps", String(steps)],
            ]}
          />
          <Verdict tone={verdict.tone} title={verdict.title}>
            {verdict.text}
          </Verdict>
          <p className="text-sm text-fg-muted">
            Accuracy is on the {data.y.length} training points, the right check for “can this network draw the shape?”. Whether it generalises is a separate
            question, answered with held-out data.
          </p>
        </div>
      </div>
      <p className="text-sm text-fg-faint">
        The points are invented, generated from a fixed seed. Training is real and runs in your browser, so the same settings always give the same picture.
      </p>
    </section>
  );
}

export function LayersLab() {
  return (
    <div className="@container space-y-10">
      <ActivationPanel />
      <BoundaryPanel />
    </div>
  );
}
