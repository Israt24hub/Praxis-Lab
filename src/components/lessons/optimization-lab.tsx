"use client";

import { useMemo, useState } from "react";

import { contourBands } from "@/lib/contour";
import { descend, nearestMinimum, surfaces, type P } from "@/lib/optimize";

import { ChartFrame, LegendItem, Segmented, Stats, StepSlider, Verdict, ticks } from "./lab-ui";

/*
 * Gradient descent on three two-parameter loss surfaces, computed in the browser.
 * Change the learning rate, momentum, number of steps and starting point, and
 * watch the path over the contour map and the loss step by step.
 */

const LRS = [0.01, 0.02, 0.05, 0.1, 0.15, 0.19, 0.2, 0.21, 0.3, 0.5, 0.9, 1, 1.05];
const MOMENTA = [0, 0.5, 0.9];
const STEPS = [10, 25, 50, 100, 200];
const LEVELS = 9;
const GRID = 72;

const fmtLoss = (v: number) => (!Number.isFinite(v) ? "∞" : v === 0 ? "0" : Math.abs(v) < 1e-3 || Math.abs(v) >= 1e4 ? v.toExponential(2) : v.toFixed(4));

export function OptimizationLab() {
  const [surfaceId, setSurfaceId] = useState("valley");
  const surface = surfaces.find((s) => s.id === surfaceId) ?? surfaces[0];
  const [lrIndex, setLrIndex] = useState(LRS.indexOf(0.1));
  const [mIndex, setMIndex] = useState(0);
  const [stepsIndex, setStepsIndex] = useState(3);
  const [start, setStart] = useState<P | null>(null);

  const lr = LRS[lrIndex];
  const momentum = MOMENTA[mIndex];
  const steps = STEPS[stepsIndex];
  const s0 = start ?? surface.start;
  const run = useMemo(() => descend(surface, s0, lr, steps, momentum), [surface, s0, lr, steps, momentum]);

  const fmin = Math.min(...surface.minima.map((m) => surface.f(m)));
  const end = run.path[run.path.length - 1];
  const finalLoss = run.losses[run.losses.length - 1];
  const reached = run.losses.findIndex((l) => l - fmin < 1e-3);
  const near = nearestMinimum(surface, end);
  const endMin = surface.f(near.minimum);
  const atMinimum = !run.diverged && finalLoss - endMin < 1e-3;
  const atGlobal = atMinimum && endMin - fmin < 1e-9;
  const lastTen = run.losses.slice(-11);
  const stalled = !run.diverged && !atMinimum && lastTen.length > 10 && lastTen[lastTen.length - 1] > lastTen[0] * 0.98;

  const { w1, w2 } = surface.range;
  const starts1 = ticks(w1[0] + 0.5, w1[1] - 0.5, 0.1);
  const starts2 = ticks(w2[0] + 0.5, w2[1] - 0.5, 0.1);
  const near_ = (vals: number[], v: number) => vals.reduce((bi, x, i) => (Math.abs(x - v) < Math.abs(vals[bi] - v) ? i : bi), 0);

  // Contour bands: cells grouped into LEVELS bands of log-loss, each drawn as one path.
  const W = 440;
  const pad = 26;
  const sx = (v: number) => pad + ((v - w1[0]) / (w1[1] - w1[0])) * (W - 2 * pad);
  const sy = (v: number) => W - pad - ((v - w2[0]) / (w2[1] - w2[0])) * (W - 2 * pad);
  const bands = useMemo(() => contourBands(surface.f, fmin, w1, w2, W, pad, GRID, LEVELS), [surface, fmin, w1, w2]);

  const shown = run.path;
  const clipW1 = (v: number) => Math.max(w1[0], Math.min(w1[1], v));
  const pathXs = shown.map((p) => clipW1(p[0]));
  const pathFocus: [number, number] = [sx(Math.min(...pathXs)) / W, sx(Math.max(...pathXs)) / W];
  const pathD = shown.map((p, i) => `${i ? "L" : "M"}${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`).join(" ");

  // Loss by step, on a log scale.
  const LW = 560;
  const LH = 220;
  const lp = { l: 56, r: 16, t: 24, b: 36 };
  const logLo = -8;
  const logHi = 6;
  const gap = (l: number) => Math.log10(Math.max(1e-8, Math.min(1e6, l - fmin)));
  const lx = (t: number) => lp.l + (t / steps) * (LW - lp.l - lp.r);
  const ly = (v: number) => LH - lp.b - ((v - logLo) / (logHi - logLo)) * (LH - lp.t - lp.b);

  const verdict = run.diverged
    ? { tone: "bad" as const, title: "Diverged: the steps grew until the loss exploded", text: surface.id === "twominima" ? "The outer walls of this surface get steeper and steeper, so a large step lands even higher up, and the next step is larger still." : `Each step overshoots the minimum by more than it corrects. In the steepest direction (curvature ${surface.id === "bowl" ? 2 : 10}), any learning rate above 2 ÷ ${surface.id === "bowl" ? 2 : 10} = ${surface.id === "bowl" ? "1" : "0.2"} does this.` }
    : atGlobal
      ? {
          tone: "good" as const,
          title: `Reached the minimum in ${reached} step${reached === 1 ? "" : "s"}`,
          text: surface.minima.length > 1 ? "This start lies in the deeper valley, so plain downhill steps find the lowest loss." : "Within 0.001 of the lowest possible loss.",
        }
      : atMinimum
        ? { tone: "warn" as const, title: "Converged — to the higher valley", text: `The gradient is zero here too, so gradient descent stops at loss ${fmtLoss(finalLoss)}, while the other valley goes down to ${fmtLoss(fmin)}. Try a start with a smaller first weight.` }
        : stalled
          ? { tone: "bad" as const, title: "Bouncing, not converging", text: "The learning rate is exactly at the edge of stability for the steepest direction: each step jumps to the opposite side at the same height." }
          : { tone: "warn" as const, title: `Still on its way after ${steps} steps`, text: "The steps are too small, or the valley’s shallow direction is slow. A larger learning rate, momentum or more steps would get there." };

  return (
    <div className="@container space-y-6">
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented
          legend="Loss surface"
          value={surfaceId}
          onChange={(id) => {
            setSurfaceId(id);
            setStart(null);
          }}
          options={surfaces.map((s) => [s.id, s.label] as const)}
        />
        <div className="grid gap-5 @2xl:grid-cols-3">
          <StepSlider label="Learning rate η" values={LRS} index={lrIndex} onChange={setLrIndex} />
          <StepSlider label="Momentum β" values={MOMENTA} index={mIndex} onChange={setMIndex} help="0 is plain gradient descent." />
          <StepSlider label="Steps" values={STEPS} index={stepsIndex} onChange={setStepsIndex} />
        </div>
        <div className="grid gap-5 @2xl:grid-cols-2">
          <StepSlider label="Start: first weight w₁" values={starts1} index={near_(starts1, s0[0])} onChange={(i) => setStart([starts1[i], s0[1]])} format={(v) => v.toFixed(1)} />
          <StepSlider label="Start: second weight w₂" values={starts2} index={near_(starts2, s0[1])} onChange={(i) => setStart([s0[0], starts2[i]])} format={(v) => v.toFixed(1)} />
        </div>
      </div>

      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ChartFrame
          label="Chart: contour map of the loss with the path gradient descent took"
          focus={pathFocus}
          legend={
            <>
              <LegendItem swatch={<rect x="1" y="1" width="18" height="12" fill="var(--dg-hl)" fillOpacity="0.45" />}>darker = lower loss</LegendItem>
              <LegendItem swatch={<path d="M1 10 L8 4 L13 9 L19 3" fill="none" stroke="var(--color-highlight)" strokeWidth="2.5" />}>path, one dot per step</LegendItem>
              <LegendItem swatch={<path d="M5 2 L15 12 M15 2 L5 12" stroke="var(--dg-ink)" strokeWidth="2.5" />}>minimum</LegendItem>
            </>
          }
        >
          <svg viewBox={`0 0 ${W} ${W}`} className="mx-auto h-auto w-full max-w-[440px]" role="img" aria-label={`Gradient descent on ${surface.label} from (${s0[0].toFixed(1)}, ${s0[1].toFixed(1)}) with learning rate ${lr}.`}>
            <defs>
              <clipPath id="op-clip">
                <rect x={pad} y={pad} width={W - 2 * pad} height={W - 2 * pad} />
              </clipPath>
            </defs>
            {bands.map((d, k) => (
              <path key={k} d={d} fill="var(--dg-hl)" fillOpacity={0.05 + 0.5 * ((LEVELS - 1 - k) / (LEVELS - 1)) ** 1.4} shapeRendering="crispEdges" />
            ))}
            <rect x={pad} y={pad} width={W - 2 * pad} height={W - 2 * pad} fill="none" stroke="var(--color-line-strong)" />
            {ticks(w1[0], w1[1], 1).map((t) => (
              <text key={`x${t}`} x={sx(t)} y={W - 8} textAnchor="middle" className="dg-label">
                {t}
              </text>
            ))}
            {ticks(w2[0], w2[1], 1).map((t) => (
              <text key={`y${t}`} x={pad - 6} y={sy(t) + 4} textAnchor="end" className="dg-label">
                {t}
              </text>
            ))}
            {surface.minima.map((m, i) => (
              <path key={i} d={`M${sx(m[0]) - 6} ${sy(m[1]) - 6} L${sx(m[0]) + 6} ${sy(m[1]) + 6} M${sx(m[0]) + 6} ${sy(m[1]) - 6} L${sx(m[0]) - 6} ${sy(m[1]) + 6}`} stroke="var(--dg-ink)" strokeWidth={2.5} />
            ))}
            <g clipPath="url(#op-clip)">
              <path d={pathD} fill="none" stroke="var(--color-highlight)" strokeWidth={2} />
              {shown.map((p, i) => (
                <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r={i === 0 ? 6 : 2.75} fill={i === 0 ? "var(--color-surface)" : "var(--color-highlight)"} stroke="var(--color-highlight)" strokeWidth={i === 0 ? 2.5 : 0} />
              ))}
            </g>
            <text x={pad} y={16} className="dg-label">
              w₂ ↑   w₁ →
            </text>
          </svg>
        </ChartFrame>

        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              ["final loss", fmtLoss(finalLoss)],
              ["steps to reach the minimum", reached >= 0 ? String(reached) : "not reached"],
              ["final point", run.diverged ? "far away" : `(${end[0].toFixed(3)}, ${end[1].toFixed(3)})`],
            ]}
          />
          <Verdict tone={verdict.tone} title={verdict.title}>
            {verdict.text}
          </Verdict>
          <ChartFrame label="Chart: loss at every step, log scale">
            <svg viewBox={`0 0 ${LW} ${LH}`} className="h-auto w-full" role="img" aria-label={`Loss above the minimum at each of ${run.losses.length - 1} steps, on a logarithmic scale.`}>
              {[-8, -6, -4, -2, 0, 2, 4, 6].map((e) => (
                <g key={e}>
                  <line x1={lp.l} x2={LW - lp.r} y1={ly(e)} y2={ly(e)} className="dg-grid" />
                  <text x={lp.l - 8} y={ly(e) + 4} textAnchor="end" className="dg-label">
                    {e === 0 ? "1" : `1e${e}`}
                  </text>
                </g>
              ))}
              {ticks(0, steps, steps <= 25 ? 5 : steps <= 50 ? 10 : steps <= 100 ? 20 : 50).map((t) => (
                <text key={t} x={lx(t)} y={LH - lp.b + 18} textAnchor="middle" className="dg-label">
                  {t}
                </text>
              ))}
              <text x={LW - lp.r} y={LH - 4} textAnchor="end" className="dg-label">
                step
              </text>
              <text x={lp.l} y={14} className="dg-label">
                loss above the lowest possible
              </text>
              <line x1={lp.l} x2={LW - lp.r} y1={ly(-3)} y2={ly(-3)} stroke="var(--color-success)" strokeDasharray="2 4" strokeWidth={2} />
              <path d={run.losses.map((l, t) => `${t ? "L" : "M"}${lx(t).toFixed(1)} ${ly(gap(l)).toFixed(1)}`).join(" ")} fill="none" stroke="var(--dg-hl)" strokeWidth={2.5} />
            </svg>
          </ChartFrame>
          <p className="text-sm text-fg-muted">
            Update rule: v ← β·v − η·∇L(w), then w ← w + v. The dotted line is 0.001 above the minimum, the threshold used for “reached”; gaps below 1e-8 are drawn at 1e-8.
          </p>
        </div>
      </div>
      <p className="text-sm text-fg-faint">
        The three surfaces are simple formulas chosen to show typical behaviour; real loss surfaces have millions of dimensions. Every step is computed in your
        browser.
      </p>
    </div>
  );
}
