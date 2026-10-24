"use client";

import { useMemo, useState } from "react";

import { contourBands } from "@/lib/contour";
import type { OptimizerName } from "@/lib/nn";
import type { P } from "@/lib/optimize";
import { bestRegressionLoss, race, raceSurfaces, regressionData, type Schedule, trainRegression } from "@/lib/optimizers";

import { ChartFrame, Checkbox, LegendItem, Segmented, Stats, StepSlider, Verdict, ticks } from "./lab-ui";

/*
 * Two panels for "Gradient descent and optimizers": SGD, momentum and Adam racing on the
 * same loss surface with the same learning rate, and mini-batch SGD training a small
 * linear regression with a choice of batch size, learning rate and schedule.
 */

const OPTS: { id: OptimizerName; label: string; colour: string; dash?: string }[] = [
  { id: "sgd", label: "SGD", colour: "var(--dg-cat-2)" },
  { id: "momentum", label: "Momentum 0.9", colour: "var(--dg-cat-3)", dash: "7 4" },
  { id: "adam", label: "Adam", colour: "var(--dg-cat-5)", dash: "2 3" },
];
const RACE_LRS = [0.003, 0.01, 0.03, 0.1, 0.15, 0.3, 1];
const RACE_STEPS = 300;
const fmtLoss = (v: number) => (!Number.isFinite(v) ? "∞" : v < 1e-3 || v >= 1e4 ? v.toExponential(1) : v.toFixed(3));

function RacePanel() {
  const [surfaceId, setSurfaceId] = useState("valley");
  const surface = raceSurfaces.find((s) => s.id === surfaceId) ?? raceSurfaces[0];
  const [lri, setLri] = useState(RACE_LRS.indexOf(0.1));
  const [shown, setShown] = useState<Record<OptimizerName, boolean>>({ sgd: true, momentum: true, adam: true });
  const lr = RACE_LRS[lri];
  const runs = useMemo(() => OPTS.map((o) => race(surface, surface.start, { name: o.id, lr }, RACE_STEPS)), [surface, lr]);
  const fmin = Math.min(...surface.minima.map((m) => surface.f(m)));
  const { w1, w2 } = surface.range;
  const W = 420;
  const pad = 34;
  const bands = useMemo(() => contourBands(surface.f, fmin, w1, w2, W, pad), [surface, fmin, w1, w2]);
  const sx = (v: number) => pad + ((v - w1[0]) / (w1[1] - w1[0])) * (W - 2 * pad);
  const sy = (v: number) => W - pad - ((v - w2[0]) / (w2[1] - w2[0])) * (W - 2 * pad);
  const clip = (p: P): P => [Math.max(w1[0] - 1, Math.min(w1[1] + 1, p[0])), Math.max(w2[0] - 1, Math.min(w2[1] + 1, p[1]))];

  const LW = 560;
  const LH = 220;
  const lp = { l: 56, r: 16, t: 24, b: 36 };
  const lx = (t: number) => lp.l + (t / RACE_STEPS) * (LW - lp.l - lp.r);
  const ly = (v: number) => LH - lp.b - ((v + 8) / 14) * (LH - lp.t - lp.b);
  const gap = (l: number) => Math.log10(Math.max(1e-8, Math.min(1e6, l - fmin)));

  const results = OPTS.map((o, k) => ({ ...o, run: runs[k] }));
  const winners = results.filter((r) => r.run.reached >= 0).sort((a, b) => a.run.reached - b.run.reached);
  const diverged = results.filter((r) => r.run.diverged).map((r) => r.label);

  return (
    <section aria-labelledby="op-race" className="space-y-5">
      <h3 id="op-race" className="font-semibold">
        1. Three optimizers, one learning rate
      </h3>
      <p className="text-sm text-fg-muted">
        Each optimizer starts at the same point and gets the same learning rate η, with PyTorch’s update rules. The number means something different to each:
        SGD multiplies the gradient by η, momentum lets steps build up to about 10η × the gradient, and Adam moves each weight by roughly η regardless of the
        gradient’s size.
      </p>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented legend="Loss surface" value={surfaceId} onChange={setSurfaceId} options={raceSurfaces.map((s) => [s.id, s.label] as const)} />
        <div className="grid gap-5 @2xl:grid-cols-[minmax(0,1fr)_auto] @2xl:items-end">
          <StepSlider label="Learning rate η (shared)" values={RACE_LRS} index={lri} onChange={setLri} />
          <fieldset className="flex flex-wrap gap-x-5 gap-y-2">
            <legend className="mb-2 text-sm font-semibold">Show</legend>
            {OPTS.map((o) => (
              <Checkbox key={o.id} checked={shown[o.id]} onChange={(v) => setShown({ ...shown, [o.id]: v })} label={o.label} />
            ))}
          </fieldset>
        </div>
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ChartFrame
          label="Chart: contour map of the loss with each optimizer’s path"
          focus={[0.05, 0.95]}
          legend={
            <>
              {OPTS.map((o) => (
                <LegendItem key={o.id} swatch={<line x1="0" y1="7" x2="20" y2="7" stroke={o.colour} strokeWidth="2.5" strokeDasharray={o.dash} />}>
                  {o.label}
                </LegendItem>
              ))}
              <LegendItem swatch={<path d="M5 2 L15 12 M15 2 L5 12" stroke="var(--dg-ink)" strokeWidth="2.5" />}>minimum</LegendItem>
            </>
          }
        >
          <svg viewBox={`0 0 ${W} ${W}`} className="mx-auto h-auto w-full max-w-[440px]" role="img" aria-label={`Paths of SGD, momentum and Adam on ${surface.label} with learning rate ${lr}.`}>
            <defs>
              <clipPath id="opr-clip">
                <rect x={pad} y={pad} width={W - 2 * pad} height={W - 2 * pad} />
              </clipPath>
            </defs>
            {bands.map((d, k) => (
              <path key={k} d={d} fill="var(--dg-hl)" fillOpacity={0.05 + 0.5 * ((8 - k) / 8) ** 1.4} shapeRendering="crispEdges" />
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
            <g clipPath="url(#opr-clip)">
              {results.map((r) =>
                shown[r.id] ? (
                  <path
                    key={r.id}
                    d={r.run.path.map((p, i) => `${i ? "L" : "M"}${sx(clip(p)[0]).toFixed(1)} ${sy(clip(p)[1]).toFixed(1)}`).join(" ")}
                    fill="none"
                    stroke={r.colour}
                    strokeWidth={2.25}
                    strokeDasharray={r.dash}
                  />
                ) : null,
              )}
            </g>
            <circle cx={sx(surface.start[0])} cy={sy(surface.start[1])} r={6} fill="var(--color-surface)" stroke="var(--dg-ink)" strokeWidth={2.5} />
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            items={results.map((r) => [
              r.label,
              r.run.diverged ? "diverged" : r.run.reached >= 0 ? `${r.run.reached} steps` : `not yet (${fmtLoss(r.run.losses[r.run.losses.length - 1] - fmin)} above)`,
            ])}
          />
          <Verdict
            tone={winners.length ? "good" : "bad"}
            title={winners.length ? `Fastest to the minimum: ${winners[0].label}, in ${winners[0].run.reached} steps` : "None reached the minimum in 300 steps"}
          >
            {diverged.length ? `Diverged: ${diverged.join(" and ")}. ` : ""}
            “Reached” means within 0.001 of the lowest loss. Try several learning rates: the fastest optimizer at one η is often not the fastest at another, and
            the ones that work over the widest range of η are easiest to tune.
          </Verdict>
          <ChartFrame label="Chart: loss above the minimum at every step for each optimizer, log scale">
            <svg viewBox={`0 0 ${LW} ${LH}`} className="h-auto w-full" role="img" aria-label="Loss above the minimum by step for the three optimizers, logarithmic scale.">
              {[-8, -6, -4, -2, 0, 2, 4, 6].map((e) => (
                <g key={e}>
                  <line x1={lp.l} x2={LW - lp.r} y1={ly(e)} y2={ly(e)} className="dg-grid" />
                  <text x={lp.l - 8} y={ly(e) + 4} textAnchor="end" className="dg-label">
                    {e === 0 ? "1" : `1e${e}`}
                  </text>
                </g>
              ))}
              {ticks(0, RACE_STEPS, 50).map((t) => (
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
              {results.map((r) =>
                shown[r.id] ? (
                  <path
                    key={r.id}
                    d={r.run.losses.map((l, t) => `${t ? "L" : "M"}${lx(t).toFixed(1)} ${ly(gap(l)).toFixed(1)}`).join(" ")}
                    fill="none"
                    stroke={r.colour}
                    strokeWidth={2.25}
                    strokeDasharray={r.dash}
                  />
                ) : null,
              )}
            </svg>
          </ChartFrame>
        </div>
      </div>
    </section>
  );
}

const BATCHES = [1, 8, 32, 256];
const SGD_LRS = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1];
const EPOCHS = 10;
const SCHEDULES: [Schedule, string][] = [
  ["constant", "Constant"],
  ["step", "Step: ÷10 halfway"],
  ["cosine", "Cosine decay"],
];

function MiniBatchPanel() {
  const [bi, setBi] = useState(1);
  const [lri, setLri] = useState(SGD_LRS.indexOf(0.03));
  const [schedule, setSchedule] = useState<Schedule>("constant");
  const batch = BATCHES[bi];
  const lr = SGD_LRS[lri];
  const run = useMemo(() => trainRegression(batch, lr, EPOCHS, schedule), [batch, lr, schedule]);
  const best = useMemo(() => {
    const { X, y } = regressionData();
    return bestRegressionLoss(X, y).loss;
  }, []);
  const final = run.losses[run.losses.length - 1];
  const excess = final / best - 1;
  const totalSteps = run.stepsPerEpoch * EPOCHS;
  const lastEpoch = run.losses.slice(-run.stepsPerEpoch - 1);
  const stillFalling = !run.diverged && lastEpoch[0] - lastEpoch[lastEpoch.length - 1] > 0.01 * final;

  const W = 560;
  const H = 260;
  const pad = { l: 48, r: 16, t: 24, b: 36 };
  const [lo, hi] = [Math.log10(0.2), Math.log10(100)];
  const ex = (step: number) => pad.l + (step / totalSteps) * (W - pad.l - pad.r);
  const ey = (v: number) => H - pad.b - ((Math.log10(Math.min(Math.max(v, 0.2), 100)) - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const every = Math.max(1, Math.floor(run.losses.length / 700));
  const d = run.losses
    .map((l, t) => [l, t] as const)
    .filter(([, t]) => t % every === 0 || t === run.losses.length - 1)
    .map(([l, t], i) => `${i ? "L" : "M"}${ex(t).toFixed(1)} ${ey(l).toFixed(1)}`)
    .join(" ");

  const growing = !run.diverged && final > run.losses[0];
  const verdict = run.diverged || growing
    ? {
        tone: "bad" as const,
        title: run.diverged ? "Diverged" : "Diverging: the loss is growing",
        text: `${run.diverged ? `The loss blew up after ${run.losses.length - 1} steps.` : `After ${run.losses.length - 1} steps the loss is higher than where it started.`} ${batch < 256 ? "Single examples can be far from the average, so small batches need smaller learning rates than full batches." : "Each step overshoots the minimum by more than it corrects: lower the learning rate."}`,
      }
    : excess < 0.01
      ? { tone: "good" as const, title: `Converged: within ${(excess * 100).toFixed(1)}% of the best possible loss`, text: "The curve flattens on the lowest loss a straight-line model can reach on this data." }
      : stillFalling
        ? { tone: "warn" as const, title: "Too slow: still falling after 10 epochs", text: "The learning rate is too small for this batch size (or there are too few steps per epoch). The curve is smooth but has not arrived." }
        : { tone: "warn" as const, title: `Noisy floor: ${(excess * 100).toFixed(1)}% above the best loss`, text: "Each mini-batch points a slightly different way, so a constant learning rate keeps the weights jittering around the minimum. A smaller learning rate, a bigger batch or a decaying schedule settles them." };

  return (
    <section aria-labelledby="op-batch" className="space-y-5">
      <h3 id="op-batch" className="font-semibold">
        2. Mini-batches and the learning rate
      </h3>
      <p className="text-sm text-fg-muted">
        Plain SGD fits y = w₁x₁ + w₂x₂ + b to 256 invented examples for 10 epochs, starting from zero. Each epoch shuffles the data and takes one step per
        batch. The curve is the loss on all 256 examples after every step.
      </p>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <div className="grid gap-5 @2xl:grid-cols-2">
          <StepSlider label="Batch size" values={BATCHES} index={bi} onChange={setBi} help={`${Math.ceil(256 / batch)} steps per epoch`} />
          <StepSlider label="Learning rate η" values={SGD_LRS} index={lri} onChange={setLri} />
        </div>
        <Segmented legend="Schedule" value={schedule} onChange={setSchedule} options={SCHEDULES} />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: training loss after every step, logarithmic scale"
          legend={
            <>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--dg-hl)" strokeWidth="2" />}>loss on all 256 examples</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-success)" strokeWidth="2" strokeDasharray="2 4" />}>best possible ({best.toFixed(3)})</LegendItem>
            </>
          }
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Loss over ${EPOCHS} epochs with batch size ${batch}, learning rate ${lr}, ${schedule} schedule: final loss ${fmtLoss(final)}.`}>
            {[0.3, 1, 3, 10, 30, 100].map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={W - pad.r} y1={ey(t)} y2={ey(t)} className="dg-grid" />
                <text x={pad.l - 8} y={ey(t) + 4} textAnchor="end" className="dg-label">
                  {t}
                </text>
              </g>
            ))}
            {ticks(0, EPOCHS, 2).map((e) => (
              <text key={e} x={ex(e * run.stepsPerEpoch)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                {e}
              </text>
            ))}
            <text x={W - pad.r} y={H - 4} textAnchor="end" className="dg-label">
              epoch
            </text>
            <line x1={pad.l} x2={W - pad.r} y1={ey(best)} y2={ey(best)} stroke="var(--color-success)" strokeDasharray="2 4" strokeWidth={2} />
            <path d={d} fill="none" stroke="var(--dg-hl)" strokeWidth={batch === 1 ? 1 : 1.75} />
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            columns={2}
            items={[
              ["final loss", fmtLoss(final)],
              ["above the best", run.diverged || growing ? "—" : `${(excess * 100).toFixed(1)}%`],
              ["steps taken", String(run.losses.length - 1)],
              ["examples per step", String(batch)],
            ]}
          />
          <Verdict tone={verdict.tone} title={verdict.title}>
            {verdict.text}
          </Verdict>
        </div>
      </div>
      <p className="text-sm text-fg-faint">The data is invented and generated from a fixed seed, and so is the shuffling: the same settings always give the same curve.</p>
    </section>
  );
}

export function OptimizersLab() {
  return (
    <div className="@container space-y-10">
      <RacePanel />
      <MiniBatchPanel />
    </div>
  );
}
