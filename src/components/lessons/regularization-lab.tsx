"use client";

import { useMemo, useState } from "react";

import { type Bug, curveData, curvePredict, overfitOneBatch, SANITY_STEPS, trainCurve, truth } from "@/lib/regularization";

import { ChartFrame, Checkbox, LegendItem, Segmented, Stats, StepSlider, Verdict, ticks } from "./lab-ui";

/*
 * Two panels for "Regularization and training diagnostics": an over-sized network fitted
 * to 15 noisy points, with weight decay, dropout and early stopping to rein it in; and the
 * "overfit one batch" check, run correctly and with four common bugs.
 */

const DECAYS = [0, 0.01, 0.1, 0.3, 1];
const DROPOUTS = [0, 0.1, 0.2, 0.5];
const EPOCHS = [250, 500, 1000, 2000];
const f3 = (v: number) => (v < 0.001 ? v.toExponential(1) : v.toFixed(3));

function LogAxis({ x0, x1, y, lo, hi, values }: { x0: number; x1: number; y: (v: number) => number; lo: number; hi: number; values: number[] }) {
  return (
    <>
      {values
        .filter((v) => v >= lo && v <= hi)
        .map((v) => (
          <g key={v}>
            <line x1={x0} x2={x1} y1={y(v)} y2={y(v)} className="dg-grid" />
            <text x={x0 - 8} y={y(v) + 4} textAnchor="end" className="dg-label">
              {v}
            </text>
          </g>
        ))}
    </>
  );
}

function OverfitPanel() {
  const [wdi, setWdi] = useState(0);
  const [dpi, setDpi] = useState(0);
  const [ei, setEi] = useState(EPOCHS.length - 1);
  const [early, setEarly] = useState(false);
  const wd = DECAYS[wdi];
  const dropout = DROPOUTS[dpi];
  const epochs = EPOCHS[ei];
  const data = useMemo(() => curveData(), []);
  const run = useMemo(() => trainCurve({ weightDecay: wd, dropout, epochs, earlyStopping: early }), [wd, dropout, epochs, early]);

  const keptVal = early ? run.bestVal : run.val[run.val.length - 1];
  const keptTrain = early ? run.train[run.bestEpoch] : run.train[run.train.length - 1];
  const finalVal = run.val[run.val.length - 1];
  const overfit = !early && finalVal > 1.2 * run.bestVal && run.bestEpoch < epochs * 0.8;
  const underfit = keptTrain > 0.08;

  // Fit chart
  const W = 520;
  const H = 300;
  const pad = { l: 40, r: 16, t: 16, b: 34 };
  const sx = (v: number) => pad.l + ((v + 1.05) / 2.1) * (W - pad.l - pad.r);
  const sy = (v: number) => H - pad.b - ((Math.max(-2.2, Math.min(2.2, v)) + 2) / 4) * (H - pad.t - pad.b);
  const xs = Array.from({ length: 211 }, (_, i) => -1.05 + i * 0.01);
  const fit = xs.map((x, i) => `${i ? "L" : "M"}${sx(x).toFixed(1)} ${sy(curvePredict(run.net, x)).toFixed(1)}`).join(" ");
  const real = xs.map((x, i) => `${i ? "L" : "M"}${sx(x).toFixed(1)} ${sy(truth(x)).toFixed(1)}`).join(" ");

  // Loss chart
  const LW = 520;
  const LH = 240;
  const lp = { l: 52, r: 28, t: 20, b: 34 };
  const [lo, hi] = [0.005, 2];
  const lx = (e: number) => lp.l + (e / epochs) * (LW - lp.l - lp.r);
  const ly = (v: number) => LH - lp.b - ((Math.log10(Math.min(hi, Math.max(lo, v))) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * (LH - lp.t - lp.b);
  const line = (vals: number[]) => vals.map((v, e) => `${e ? "L" : "M"}${lx(e).toFixed(1)} ${ly(v).toFixed(1)}`).join(" ");

  const verdict = early
    ? {
        tone: "good" as const,
        title: `Early stopping kept epoch ${run.bestEpoch}`,
        text: `Validation loss stopped improving, so training ${run.stoppedAt < epochs ? `stopped at epoch ${run.stoppedAt} (200 epochs with no new best)` : `ran to epoch ${epochs}`} and the weights from epoch ${run.bestEpoch} were restored.`,
      }
    : overfit
      ? {
          tone: "bad" as const,
          title: "Overfitting: the curves have split",
          text: `Validation loss was lowest at epoch ${run.bestEpoch} (${f3(run.bestVal)}) and has risen to ${f3(finalVal)}, while training loss kept falling to ${f3(keptTrain)}. The network is fitting the noise in 15 points.`,
        }
      : underfit
        ? { tone: "warn" as const, title: "Underfitting", text: `Training loss is still ${f3(keptTrain)}: the regularisation is so strong that the network cannot follow the curve.` }
        : { tone: "good" as const, title: "Curves stay together", text: `Validation loss ends at ${f3(finalVal)}, close to its best (${f3(run.bestVal)}). The noise alone gives a loss of about 0.06.` };

  return (
    <section aria-labelledby="rg-overfit" className="space-y-5">
      <h3 id="rg-overfit" className="font-semibold">
        1. Reining in an over-sized network
      </h3>
      <p className="text-sm text-fg-muted">
        A network with 64 tanh units (193 parameters) learns from 15 noisy points with full-batch AdamW, learning rate 0.01. Another 60 points are held out for
        validation. Everything is computed in your browser.
      </p>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <div className="grid gap-5 @2xl:grid-cols-3">
          <StepSlider label="Weight decay λ" values={DECAYS} index={wdi} onChange={setWdi} />
          <StepSlider label="Dropout p (hidden layer)" values={DROPOUTS} index={dpi} onChange={setDpi} />
          <StepSlider label="Epochs" values={EPOCHS} index={ei} onChange={setEi} />
        </div>
        <Checkbox checked={early} onChange={setEarly} label="Early stopping" help="Stop after 200 epochs without a new best validation loss, and keep the best weights." />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-2">
        <ChartFrame
          label="Chart: the 15 training points, the validation points and the fitted curve"
          legend={
            <>
              <LegendItem swatch={<circle cx="10" cy="7" r="4.5" fill="var(--dg-ink)" />}>training point</LegendItem>
              <LegendItem swatch={<circle cx="10" cy="7" r="3" fill="none" stroke="var(--color-fg-faint)" strokeWidth="1.25" />}>validation point</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-highlight)" strokeWidth="2.5" />}>network</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--dg-ink)" strokeWidth="1.5" strokeDasharray="3 3" />}>curve the data came from</LegendItem>
            </>
          }
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Fitted curve after ${run.stoppedAt} epochs; validation loss ${f3(keptVal)}.`}>
            {[-2, -1, 0, 1, 2].map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="dg-grid" />
                <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="dg-label">
                  {t}
                </text>
              </g>
            ))}
            {ticks(-1, 1, 0.5).map((t) => (
              <text key={t} x={sx(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                {t}
              </text>
            ))}
            {data.val.X.map(([x], i) => (
              <circle key={`v${i}`} cx={sx(x)} cy={sy(data.val.Y[i][0])} r={3} fill="none" stroke="var(--color-fg-faint)" strokeWidth={1.25} />
            ))}
            <path d={real} fill="none" stroke="var(--dg-ink)" strokeWidth={1.5} strokeDasharray="3 3" />
            <path d={fit} fill="none" stroke="var(--color-highlight)" strokeWidth={2.5} />
            {data.train.X.map(([x], i) => (
              <circle key={`t${i}`} cx={sx(x)} cy={sy(data.train.Y[i][0])} r={4.5} fill="var(--dg-ink)" />
            ))}
          </svg>
        </ChartFrame>
        <ChartFrame
          label="Chart: training and validation loss by epoch, logarithmic scale"
          legend={
            <>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--dg-ink)" strokeWidth="2" />}>training loss</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-highlight)" strokeWidth="2.5" strokeDasharray="6 4" />}>validation loss</LegendItem>
              <LegendItem swatch={<line x1="10" y1="0" x2="10" y2="14" stroke="var(--color-success)" strokeWidth="2" />}>best validation epoch</LegendItem>
            </>
          }
        >
          <svg viewBox={`0 0 ${LW} ${LH}`} className="h-auto w-full" role="img" aria-label={`Loss curves over ${run.stoppedAt} epochs; best validation loss ${f3(run.bestVal)} at epoch ${run.bestEpoch}.`}>
            <LogAxis x0={lp.l} x1={LW - lp.r} y={ly} lo={lo} hi={hi} values={[0.01, 0.03, 0.1, 0.3, 1]} />
            {ticks(0, epochs, epochs / 4).map((t) => (
              <text key={t} x={lx(t)} y={LH - lp.b + 18} textAnchor="middle" className="dg-label">
                {t}
              </text>
            ))}
            <text x={LW - lp.r} y={LH - 4} textAnchor="end" className="dg-label">
              epoch
            </text>
            <line x1={lx(run.bestEpoch)} x2={lx(run.bestEpoch)} y1={lp.t} y2={LH - lp.b} stroke="var(--color-success)" strokeWidth={2} />
            <path d={line(run.train)} fill="none" stroke="var(--dg-ink)" strokeWidth={2} />
            <path d={line(run.val)} fill="none" stroke="var(--color-highlight)" strokeWidth={2.5} strokeDasharray="6 4" />
          </svg>
        </ChartFrame>
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Stats
          columns={2}
          items={[
            ["training loss", f3(keptTrain)],
            ["validation loss", f3(keptVal)],
            ["best validation (epoch)", `${f3(run.bestVal)} (${run.bestEpoch})`],
            ["sum of squared weights", run.weightNorm.toFixed(1)],
          ]}
        />
        <Verdict tone={verdict.tone} title={verdict.title}>
          {verdict.text}
        </Verdict>
      </div>
      <p className="text-sm text-fg-faint">
        Losses are mean squared errors, measured without dropout. The points are invented, drawn around y = sin(2.5x) from a fixed seed, so the same settings
        always give the same result.
      </p>
    </section>
  );
}

const BUGS: { id: Bug; label: string; title: string; text: string }[] = [
  {
    id: "none",
    label: "Correct code",
    title: "Passes: the loss falls by orders of magnitude",
    text: "A network this size can memorise 8 points. Falling steadily towards zero is the sign that the model, the loss, the backward pass and the optimizer are wired together correctly.",
  },
  {
    id: "no-zero-grad",
    label: "Forgot zero_grad()",
    title: "Fails: the loss jumps around and never settles",
    text: "PyTorch adds each new gradient to the stored one. Without optimizer.zero_grad() every step uses the sum of all past gradients, so it keeps pushing in old directions.",
  },
  {
    id: "sign",
    label: "Gradient sign flipped",
    title: "Fails: the loss climbs until it explodes",
    text: "Stepping along +gradient is gradient ascent. Typical causes: w += lr * grad in a hand-written loop, or maximising a loss that should be minimised.",
  },
  {
    id: "no-activation",
    label: "Activation left out",
    title: "Fails: the loss stalls at the best straight line",
    text: "Without the ReLU the two layers collapse into one linear function, which cannot pass through 8 noisy points. The plateau is the best a line can do.",
  },
  {
    id: "dead",
    label: "Every ReLU starts off",
    title: "Fails: the loss does not move at all",
    text: "Every hidden unit outputs 0 for every input (here, biases set to −5), so every gradient into the hidden layer is 0. Only the output bias learns, and only a little.",
  },
];

function SanityPanel() {
  const [bug, setBug] = useState<Bug>("no-zero-grad");
  const runs = useMemo(() => Object.fromEntries(BUGS.map((b) => [b.id, overfitOneBatch(b.id)])) as Record<Bug, ReturnType<typeof overfitOneBatch>>, []);
  const run = runs[bug];
  const ref = runs.none;
  const info = BUGS.find((b) => b.id === bug)!;
  const W = 560;
  const H = 240;
  const pad = { l: 52, r: 16, t: 20, b: 34 };
  const [lo, hi] = [1e-3, 1e4];
  const lx = (t: number) => pad.l + (t / SANITY_STEPS) * (W - pad.l - pad.r);
  const ly = (v: number) => H - pad.b - ((Math.log10(Math.min(hi, Math.max(lo, v))) + 3) / 7) * (H - pad.t - pad.b);
  const line = (vals: number[]) => vals.map((v, t) => `${t ? "L" : "M"}${lx(t).toFixed(1)} ${ly(v).toFixed(1)}`).join(" ");
  const start = run.losses[0];
  const end = run.losses[run.losses.length - 1];

  return (
    <section aria-labelledby="rg-sanity" className="space-y-5">
      <h3 id="rg-sanity" className="font-semibold">
        2. Overfit one batch before anything else
      </h3>
      <p className="text-sm text-fg-muted">
        Before a long training run, train on a single batch of 8 examples and check the loss heads to zero. Here a network with 64 ReLU units gets 500 Adam
        steps on one batch, first correctly and then with a common bug.
      </p>
      <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented legend="Training code" value={bug} onChange={setBug} options={BUGS.map((b) => [b.id, b.label] as const)} />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: loss on the one batch at every step, logarithmic scale"
          legend={
            <>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-highlight)" strokeWidth="2.5" />}>{info.label}</LegendItem>
              {bug !== "none" ? <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-success)" strokeWidth="2" strokeDasharray="2 3" />}>correct code, for comparison</LegendItem> : null}
            </>
          }
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${info.label}: loss from ${f3(start)} to ${run.diverged ? "divergence" : f3(end)} over ${run.losses.length - 1} steps.`}>
            {[-3, -2, -1, 0, 1, 2, 3, 4].map((e) => (
              <g key={e}>
                <line x1={pad.l} x2={W - pad.r} y1={ly(10 ** e)} y2={ly(10 ** e)} className="dg-grid" />
                <text x={pad.l - 8} y={ly(10 ** e) + 4} textAnchor="end" className="dg-label">
                  {e === 0 ? "1" : `1e${e}`}
                </text>
              </g>
            ))}
            {ticks(0, SANITY_STEPS, 100).map((t) => (
              <text key={t} x={lx(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                {t}
              </text>
            ))}
            <text x={W - pad.r} y={H - 4} textAnchor="end" className="dg-label">
              step
            </text>
            {bug !== "none" ? <path d={line(ref.losses)} fill="none" stroke="var(--color-success)" strokeWidth={2} strokeDasharray="2 3" /> : null}
            <path d={line(run.losses)} fill="none" stroke="var(--color-highlight)" strokeWidth={2.5} />
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            columns={2}
            items={[
              ["loss at the start", f3(start)],
              [run.diverged ? "diverged at step" : `after ${SANITY_STEPS} steps`, run.diverged ? String(run.losses.length - 1) : f3(end)],
            ]}
          />
          <Verdict tone={bug === "none" ? "good" : "bad"} title={info.title}>
            {info.text}
          </Verdict>
        </div>
      </div>
      <p className="text-sm text-fg-faint">
        The bugs are simulated faithfully: the same network and data, with the gradient changed exactly as the bug would change it. Passing this check does not
        prove the data pipeline is right — a network can memorise 8 wrongly labelled examples just as well.
      </p>
    </section>
  );
}

export function RegularizationLab() {
  return (
    <div className="@container space-y-10">
      <OverfitPanel />
      <SanityPanel />
    </div>
  );
}
