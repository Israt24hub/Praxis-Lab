"use client";

import { useState } from "react";

import { centralDiff, forwardDiff, functions, neuronChain } from "@/lib/calculus";

import { ChartFrame, LegendItem, Segmented, Stats, StepSlider, Verdict, ticks } from "./lab-ui";

/*
 * Two panels, computed in the browser. 1: a function, its tangent line (the exact
 * derivative) and a secant line through x and x + h — the finite-difference
 * estimate — as h shrinks. 2: the chain rule for one neuron with a squared-error
 * loss, one factor at a time, checked against a finite difference.
 */

const H_VALUES = [1, 0.5, 0.1, 0.01, 0.001];
const fmt = (v: number, d = 4) => (Math.abs(v) < 5e-13 ? "0" : Math.abs(v) < 1e-3 ? v.toExponential(2) : v.toFixed(d));

function SlopePanel() {
  const [fnId, setFn] = useState("cubic");
  const fn = functions.find((f) => f.id === fnId) ?? functions[0];
  const xs = ticks(Math.ceil(fn.range[0]), Math.floor(fn.range[1]), fn.id === "sigmoid" ? 0.5 : 0.25).filter((x) => x <= fn.range[1] - 0.25 && x >= fn.range[0] + 0.25);
  const startIndex = (() => {
    const target = fn.id === "square" ? 1.5 : fn.id === "cubic" ? 2 : fn.id === "sin" ? 1 : 0;
    let best = 0;
    xs.forEach((x, i) => {
      if (Math.abs(x - target) < Math.abs(xs[best] - target)) best = i;
    });
    return best;
  })();
  const [xIndex, setXIndex] = useState<number | null>(null);
  const [hIndex, setHIndex] = useState(0);
  const xi = xIndex === null || xIndex >= xs.length ? startIndex : xIndex;
  const x = xs[xi];
  const h = H_VALUES[hIndex];
  const exact = fn.df(x);
  const fwd = forwardDiff(fn.f, x, h);
  const ctr = centralDiff(fn.f, x, h);

  const W = 560;
  const H = 360;
  const pad = { l: 44, r: 16, t: 16, b: 34 };
  const [x0, x1] = fn.range;
  const [y0, y1] = fn.yRange;
  const sx = (v: number) => pad.l + ((v - x0) / (x1 - x0)) * (W - pad.l - pad.r);
  const sy = (v: number) => H - pad.b - ((v - y0) / (y1 - y0)) * (H - pad.t - pad.b);
  const curve = Array.from({ length: 301 }, (_, i) => x0 + (i / 300) * (x1 - x0))
    .map((v, i) => `${i ? "L" : "M"}${sx(v).toFixed(1)} ${sy(fn.f(v)).toFixed(1)}`)
    .join(" ");
  const lineThrough = (px: number, py: number, slope: number) => `M${sx(x0)} ${sy(py + slope * (x0 - px))} L${sx(x1)} ${sy(py + slope * (x1 - px))}`;
  const yStep = y1 - y0 > 10 ? 3 : y1 - y0 > 4 ? 2 : 0.5;

  return (
    <section aria-labelledby="dv-slope" className="space-y-5">
      <h3 id="dv-slope" className="font-semibold">
        1. A derivative is a slope
      </h3>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented
          legend="Function"
          value={fnId}
          onChange={(id) => {
            setFn(id);
            setXIndex(null);
          }}
          options={functions.map((f) => [f.id, f.label] as const)}
        />
        <div className="grid gap-5 @2xl:grid-cols-2">
          <StepSlider label="Point x" values={xs} index={xi} onChange={setXIndex} format={(v) => String(+v.toFixed(2))} />
          <StepSlider label="Step h for the estimate" values={H_VALUES} index={hIndex} onChange={setHIndex} help="The secant joins x and x + h. Smaller h, closer to the tangent." />
        </div>
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: the function, its tangent and a secant"
          focus={[sx(x) / W, sx(Math.min(x1, x + h)) / W]}
          legend={
            <>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--dg-ink)" strokeWidth="2.5" />}>f(x) = {fn.label}</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--dg-hl)" strokeWidth="2.5" />}>tangent: slope f′(x)</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-highlight)" strokeWidth="2.5" strokeDasharray="6 4" />}>secant through x and x + h</LegendItem>
            </>
          }
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${fn.label} with its tangent at x = ${x.toFixed(2)}, slope ${exact.toFixed(3)}, and a secant with h = ${h}.`}>
            <defs>
              <clipPath id="dv-clip">
                <rect x={pad.l} y={pad.t} width={W - pad.l - pad.r} height={H - pad.t - pad.b} />
              </clipPath>
            </defs>
            {ticks(y0, y1, yStep).map((t) => (
              <g key={`y${t}`}>
                <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className={t === 0 ? "dg-line" : "dg-grid"} />
                <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="dg-label">
                  {+t.toFixed(2)}
                </text>
              </g>
            ))}
            {ticks(x0, x1, fn.id === "sin" ? Math.PI / 2 : fn.id === "sigmoid" ? 2 : 1).map((t) => (
              <text key={`x${t}`} x={sx(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                {fn.id === "sin" ? (Math.abs(t) < 1e-9 ? "0" : `${+(t / Math.PI).toFixed(1)}π`) : +t.toFixed(2)}
              </text>
            ))}
            <g clipPath="url(#dv-clip)">
              <path d={curve} fill="none" stroke="var(--dg-ink)" strokeWidth={2.5} />
              <path d={lineThrough(x, fn.f(x), exact)} stroke="var(--dg-hl)" strokeWidth={2.5} />
              <path d={lineThrough(x, fn.f(x), fwd)} stroke="var(--color-highlight)" strokeWidth={2.5} strokeDasharray="6 4" />
              <circle cx={sx(x + h)} cy={sy(fn.f(x + h))} r={5} fill="var(--color-surface)" stroke="var(--color-highlight)" strokeWidth={2.5} />
            </g>
            <circle cx={sx(x)} cy={sy(fn.f(x))} r={5.5} fill="var(--dg-ink)" />
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              ["exact f′(x)", fmt(exact)],
              ["forward estimate", fmt(fwd)],
              ["its error", fmt(Math.abs(fwd - exact))],
              ["central estimate", fmt(ctr)],
              ["its error", fmt(Math.abs(ctr - exact))],
              ["h", String(h)],
            ]}
          />
          <div className="rounded-panel border border-line bg-surface p-4 text-sm">
            <p className="font-semibold">The two estimates</p>
            <p className="math mt-2">forward: ( f(x + h) − f(x) ) / h</p>
            <p className="math">central: ( f(x + h) − f(x − h) ) / 2h</p>
          </div>
          <Verdict tone="neutral" title={`Slope ${fmt(exact, 3)} at x = ${+x.toFixed(2)}`}>
            {Math.abs(exact) < 1e-9
              ? "The tangent is flat: a small change in x barely changes f. Minimisers look for points like this."
              : `Near x, increasing x by a small amount δ changes f by about ${fmt(exact, 3)} × δ. Each tenfold drop in h cuts the forward error about tenfold; the central estimate’s error falls about a hundredfold.`}
          </Verdict>
        </div>
      </div>
    </section>
  );
}

const WS = ticks(-2, 2, 0.5);
const XS = ticks(-3, 3, 0.5);

function ChainPanel() {
  const [w, setW] = useState(0.5);
  const [b, setB] = useState(0);
  const [x, setX] = useState(2);
  const [y, setY] = useState<0 | 1>(1);
  const c = neuronChain(w, b, x, y);
  const eps = 1e-6;
  const fdW = (neuronChain(w + eps, b, x, y).L - neuronChain(w - eps, b, x, y).L) / (2 * eps);
  const idx = (vals: number[], v: number) => vals.findIndex((q) => Math.abs(q - v) < 1e-9);

  const rows: [string, string, string][] = [
    ["z = w·x + b", fmt(c.z), "∂z/∂w = x = " + fmt(c.dz_dw, 2)],
    ["a = σ(z)", fmt(c.a), "∂a/∂z = a(1 − a) = " + fmt(c.da_dz)],
    ["L = (a − y)²", fmt(c.L), "∂L/∂a = 2(a − y) = " + fmt(c.dL_da)],
  ];

  return (
    <section aria-labelledby="dv-chain" className="space-y-5">
      <h3 id="dv-chain" className="font-semibold">
        2. The chain rule inside one neuron
      </h3>
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @2xl:grid-cols-2 @4xl:grid-cols-4">
        <StepSlider label="Weight w" values={WS} index={idx(WS, w)} onChange={(i) => setW(WS[i])} />
        <StepSlider label="Bias b" values={WS} index={idx(WS, b)} onChange={(i) => setB(WS[i])} />
        <StepSlider label="Input x" values={XS} index={idx(XS, x)} onChange={(i) => setX(XS[i])} />
        <Segmented<"0" | "1"> legend="Target y" value={String(y) as "0" | "1"} onChange={(v) => setY(v === "1" ? 1 : 0)} options={[["0", "0"], ["1", "1"]]} />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="min-w-0 overflow-x-auto rounded-panel border border-line bg-surface p-4" tabIndex={0} role="region" aria-label="Forward values and local derivatives">
          <table className="w-full border-collapse text-sm">
            <caption className="mb-2 text-left font-semibold">Forward pass, and each step’s local derivative</caption>
            <thead>
              <tr>
                <th scope="col" className="border-b border-line py-1.5 text-left font-medium text-fg-muted">
                  Step
                </th>
                <th scope="col" className="border-b border-line py-1.5 text-right font-medium text-fg-muted">
                  Value
                </th>
                <th scope="col" className="border-b border-line py-1.5 pl-4 text-left font-medium text-fg-muted">
                  Local derivative
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([step, value, local]) => (
                <tr key={step}>
                  <th scope="row" className="border-b border-line py-1.5 text-left font-mono font-normal">
                    {step}
                  </th>
                  <td className="border-b border-line py-1.5 text-right font-mono tabular-nums">{value}</td>
                  <td className="border-b border-line py-1.5 pl-4 font-mono">{local}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="math mt-4 text-sm">
            ∂L/∂w = ∂L/∂a × ∂a/∂z × ∂z/∂w = {fmt(c.dL_da)} × {fmt(c.da_dz)} × {fmt(c.dz_dw, 2)} = <span className="font-semibold">{fmt(c.dL_dw)}</span>
          </p>
          <p className="math mt-1 text-sm">
            ∂L/∂b = ∂L/∂a × ∂a/∂z × 1 = <span className="font-semibold">{fmt(c.dL_db)}</span>
          </p>
        </div>
        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              ["∂L/∂w, chain rule", fmt(c.dL_dw, 6)],
              ["∂L/∂w, finite difference", fmt(fdW, 6)],
              ["loss L", fmt(c.L)],
            ]}
          />
          <Verdict
            tone={Math.abs(c.dL_dw) < 1e-6 ? "neutral" : "good"}
            title={Math.abs(c.dL_dw) < 1e-6 ? "No gradient: w has nothing to learn here" : c.dL_dw < 0 ? "Increase w to lower the loss" : "Decrease w to lower the loss"}
          >
            {Math.abs(c.dL_dw) < 1e-6
              ? "Either x = 0 (so w has no effect), the prediction is already exact, or the sigmoid is saturated."
              : `The gradient’s sign says which way to move w; its size says how sensitive the loss is. A gradient-descent step with learning rate 0.1 would change w by ${fmt(-0.1 * c.dL_dw)}. The finite difference agrees to about six decimal places, which is how gradient code is usually checked.`}
          </Verdict>
        </div>
      </div>
    </section>
  );
}

export function DerivativesLab() {
  return (
    <div className="@container space-y-10">
      <SlopePanel />
      <ChainPanel />
      <p className="text-sm text-fg-faint">Every value is computed in your browser, with exact derivatives and with finite differences.</p>
    </div>
  );
}
