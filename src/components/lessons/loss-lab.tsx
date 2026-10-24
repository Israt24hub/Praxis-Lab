"use client";

import { useState } from "react";

import { binaryScores, deliveryTimes, mean, meanAbsolute, meanSquared, median, softmaxScores } from "@/lib/losses";

import { ChartFrame, LegendItem, Segmented, Stats, StepSlider, Verdict, ticks } from "./lab-ui";

/*
 * Three panels for "Loss functions": cross-entropy against squared error for a yes/no
 * prediction (values and gradients), softmax cross-entropy for three classes, and how
 * one outlier moves the best constant prediction under squared and absolute error.
 */

const PROBS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.98, 0.99];
const f4 = (v: number) => (Object.is(Math.round(v * 1e4) / 1e4, -0) ? 0 : v).toFixed(4).replace("-", "−");

function BinaryPanel() {
  const [label, setLabel] = useState<"1" | "0">("1");
  const [pi, setPi] = useState(PROBS.indexOf(0.1));
  const y = Number(label) as 0 | 1;
  const p = PROBS[pi];
  const s = binaryScores(y, p);
  const W = 560;
  const H = 280;
  const pad = { l: 40, r: 16, t: 16, b: 38 };
  const yMax = 5;
  const sx = (v: number) => pad.l + v * (W - pad.l - pad.r);
  const sy = (v: number) => H - pad.b - (Math.min(v, yMax + 0.5) / yMax) * (H - pad.t - pad.b);
  const xs = Array.from({ length: 199 }, (_, i) => 0.005 + i * 0.005);
  const line = (f: (q: number) => number) => xs.map((q, i) => `${i ? "L" : "M"}${sx(q).toFixed(1)} ${sy(f(q)).toFixed(1)}`).join(" ");
  const wrong = Math.abs(p - y) >= 0.5;
  const ratio = Math.abs(s.bceGrad / s.sqGrad);

  return (
    <section aria-labelledby="ls-binary" className="space-y-5">
      <h3 id="ls-binary" className="font-semibold">
        1. Scoring one yes/no prediction
      </h3>
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @2xl:grid-cols-[auto_minmax(0,1fr)] @2xl:items-end">
        <Segmented legend="True label y" value={label} onChange={setLabel} options={[["1", "1 (yes)"], ["0", "0 (no)"]]} />
        <StepSlider label="Predicted probability p of “yes”" values={PROBS} index={pi} onChange={setPi} help="p = σ(z), the sigmoid of the network’s output z." />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: cross-entropy and squared error against the predicted probability"
          focus={sx(p) / W}
          legend={
            <>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--dg-hl)" strokeWidth="2.5" />}>cross-entropy</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-highlight)" strokeWidth="2.5" strokeDasharray="6 4" />}>squared error</LegendItem>
            </>
          }
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Loss for true label ${y} as p goes from 0 to 1; at p = ${p}, cross-entropy is ${s.bce.toFixed(3)} and squared error ${s.sq.toFixed(3)}.`}>
            {[0, 1, 2, 3, 4, 5].map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="dg-grid" />
                <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="dg-label">
                  {t}
                </text>
              </g>
            ))}
            {ticks(0, 1, 0.25).map((t) => (
              <text key={t} x={sx(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                {t}
              </text>
            ))}
            <text x={W - pad.r} y={H - 4} textAnchor="end" className="dg-label">
              predicted p
            </text>
            <defs>
              <clipPath id="ls-clip">
                <rect x={pad.l} y={pad.t} width={W - pad.l - pad.r} height={H - pad.t - pad.b} />
              </clipPath>
            </defs>
            <g clipPath="url(#ls-clip)">
              <path d={line((q) => -(y * Math.log(q) + (1 - y) * Math.log(1 - q)))} fill="none" stroke="var(--dg-hl)" strokeWidth={2.5} />
              <path d={line((q) => (q - y) ** 2)} fill="none" stroke="var(--color-highlight)" strokeWidth={2.5} strokeDasharray="6 4" />
            </g>
            <line x1={sx(p)} x2={sx(p)} y1={pad.t} y2={H - pad.b} stroke="var(--dg-ink)" strokeDasharray="3 3" />
            {s.bce <= yMax ? <circle cx={sx(p)} cy={sy(s.bce)} r={5} fill="var(--dg-hl)" stroke="var(--color-surface)" strokeWidth={1.5} /> : null}
            <circle cx={sx(p)} cy={sy(s.sq)} r={5} fill="var(--color-highlight)" stroke="var(--color-surface)" strokeWidth={1.5} />
            <line x1={sx(y)} x2={sx(y)} y1={H - pad.b} y2={H - pad.b - 8} stroke="var(--dg-ink)" strokeWidth={3} />
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            columns={2}
            items={[
              ["cross-entropy", f4(s.bce)],
              ["squared error", f4(s.sq)],
              ["cross-entropy gradient ∂/∂z", f4(s.bceGrad)],
              ["squared-error gradient ∂/∂z", f4(s.sqGrad)],
            ]}
          />
          <Verdict tone={wrong && p !== 0.5 ? "warn" : "neutral"} title={wrong && p !== 0.5 ? "Confidently wrong" : p === 0.5 ? "Undecided" : "Right side of 0.5"}>
            {wrong && p !== 0.5
              ? `Cross-entropy punishes this heavily (${s.bce.toFixed(2)}) and its gradient is ${ratio.toFixed(1)}× larger than squared error’s. Through a sigmoid, squared error’s gradient shrinks exactly when the prediction is most wrong, so the network would learn slowly from its worst mistakes.`
              : p === 0.5
                ? "Cross-entropy is ln 2 ≈ 0.693, the loss of a coin flip. Both gradients point towards the true label."
                : `The prediction is on the right side. Both losses are small, and both keep pushing p towards ${y}: a loss rewards confidence even after accuracy stops changing.`}
          </Verdict>
          <p className="text-sm text-fg-muted">
            The gradients are with respect to z, the number the network actually outputs. Cross-entropy’s is simply p − y; squared error’s is 2(p − y)·p(1 − p).
          </p>
        </div>
      </div>
    </section>
  );
}

const LOGITS = ticks(-3, 3, 0.5);
const CLASSES = ["cat", "dog", "fox"];

function SoftmaxPanel() {
  const [z, setZ] = useState([2, 1, 0]);
  const [label, setLabel] = useState("0");
  const k = Number(label);
  const s = softmaxScores(z, k);
  const W = 420;
  const H = 220;
  const pad = { l: 40, r: 16, t: 20, b: 36 };
  const bw = (W - pad.l - pad.r) / 3;
  const sy = (v: number) => H - pad.b - v * (H - pad.t - pad.b);

  return (
    <section aria-labelledby="ls-softmax" className="space-y-5">
      <h3 id="ls-softmax" className="font-semibold">
        2. Three classes: softmax and cross-entropy
      </h3>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <div className="grid gap-5 @2xl:grid-cols-3">
          {z.map((v, i) => (
            <StepSlider
              key={i}
              label={`Logit for “${CLASSES[i]}”`}
              values={LOGITS}
              index={LOGITS.indexOf(v)}
              onChange={(j) => setZ(z.map((old, m) => (m === i ? LOGITS[j] : old)))}
              format={(x) => x.toFixed(1)}
            />
          ))}
        </div>
        <Segmented legend="True class" value={label} onChange={setLabel} options={CLASSES.map((c, i) => [String(i), c] as const)} />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ChartFrame label="Chart: softmax probabilities of the three classes">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-[460px]" role="img" aria-label={`Softmax probabilities: ${CLASSES.map((c, i) => `${c} ${s.p[i].toFixed(3)}`).join(", ")}.`}>
            {[0, 0.5, 1].map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="dg-grid" />
                <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="dg-label">
                  {t}
                </text>
              </g>
            ))}
            {s.p.map((v, i) => (
              <g key={i}>
                <rect
                  x={pad.l + i * bw + bw * 0.2}
                  y={sy(v)}
                  width={bw * 0.6}
                  height={sy(0) - sy(v)}
                  fill={i === k ? "var(--dg-hl)" : "var(--color-surface)"}
                  stroke="var(--dg-hl)"
                  strokeWidth={2}
                />
                <text x={pad.l + (i + 0.5) * bw} y={sy(v) - 6} textAnchor="middle" className="dg-label">
                  {v.toFixed(3)}
                </text>
                <text x={pad.l + (i + 0.5) * bw} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                  {CLASSES[i]}
                  {i === k ? " (true)" : ""}
                </text>
              </g>
            ))}
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            columns={2}
            items={[
              ["P(true class)", s.p[k].toFixed(4)],
              ["cross-entropy = −ln P", s.loss.toFixed(4)],
              ["prediction", s.correct ? "right" : "wrong"],
              ["gradient ∂/∂z", `(${s.grad.map((g) => f4(g)).join(", ")})`],
            ]}
          />
          <Verdict tone={s.correct ? "good" : "warn"} title={s.correct ? "The true class has the highest probability" : "Another class is ahead (or tied)"}>
            Softmax turns the logits into probabilities that add up to 1: p = e^z ÷ Σe^z. The loss only looks at the true class’s probability, but the
            gradient moves every logit: up for the true class by 1 − p, down for each other class by its own probability.
          </Verdict>
          <p className="text-sm text-fg-muted">Adding the same number to all three logits changes nothing: softmax only cares about their differences.</p>
        </div>
      </div>
    </section>
  );
}

const OUTLIERS = [25, 30, 40, 50, 60, 75, 90, 120];

function OutlierPanel() {
  const [oi, setOi] = useState(0);
  const o = OUTLIERS[oi];
  const xs = [...deliveryTimes, o];
  const m = mean(xs);
  const med = median(xs);
  const W = 560;
  const H = 150;
  const pad = { l: 24, r: 24 };
  const sx = (v: number) => pad.l + ((v - 15) / (125 - 15)) * (W - pad.l - pad.r);
  const yLine = 70;

  return (
    <section aria-labelledby="ls-outlier" className="space-y-5">
      <h3 id="ls-outlier" className="font-semibold">
        3. Regression: what one outlier does
      </h3>
      <p className="text-sm text-fg-muted">
        Eight delivery times in minutes (invented). If a model could only predict one number for all of them, squared error is lowest at their mean and absolute
        error at their median.
      </p>
      <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
        <StepSlider label="The eighth delivery took (minutes)" values={OUTLIERS} index={oi} onChange={setOi} />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: the eight delivery times with the mean and the median"
          focus={[sx(20) / W, sx(Math.max(o, m)) / W]}
          legend={
            <>
              <LegendItem swatch={<circle cx="10" cy="7" r="4.5" fill="var(--dg-ink)" />}>a delivery</LegendItem>
              <LegendItem swatch={<path d="M10 1 L16 12 L4 12 Z" fill="var(--color-highlight)" />}>mean (best for squared error)</LegendItem>
              <LegendItem swatch={<rect x="6" y="3" width="8" height="8" transform="rotate(45 10 7)" fill="var(--dg-hl)" />}>median (best for absolute error)</LegendItem>
            </>
          }
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Delivery times with the eighth at ${o} minutes: mean ${m.toFixed(1)}, median ${med}.`}>
            <line x1={pad.l} x2={W - pad.r} y1={yLine} y2={yLine} stroke="var(--color-line-strong)" />
            {ticks(20, 120, 10).map((t) => (
              <g key={t}>
                <line x1={sx(t)} x2={sx(t)} y1={yLine - 4} y2={yLine + 4} stroke="var(--color-line-strong)" />
                <text x={sx(t)} y={yLine + 22} textAnchor="middle" className="dg-label">
                  {t}
                </text>
              </g>
            ))}
            {xs.map((v, i) => {
              const stack = xs.slice(0, i).filter((u) => u === v).length;
              return <circle key={i} cx={sx(v)} cy={yLine - 10 - stack * 11} r={4.5} fill="var(--dg-ink)" />;
            })}
            <path d={`M${sx(m)} ${yLine + 32} l7 13 h-14 Z`} fill="var(--color-highlight)" />
            <rect x={sx(med) - 6} y={yLine + 34} width={12} height={12} transform={`rotate(45 ${sx(med)} ${yLine + 40})`} fill="var(--dg-hl)" />
            <text x={W - pad.r} y={H - 4} textAnchor="end" className="dg-label">
              minutes
            </text>
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            columns={2}
            items={[
              ["mean", m.toFixed(2)],
              ["median", String(med)],
              ["mean squared error at the mean", meanSquared(xs, m).toFixed(2)],
              ["mean absolute error at the median", meanAbsolute(xs, med).toFixed(2)],
            ]}
          />
          <Verdict tone={o >= 60 ? "warn" : "neutral"} title={o === 25 ? "No outlier" : `One delivery at ${o} minutes`}>
            {o === 25
              ? "Mean and median almost agree. Move the slider to make one delivery very late."
              : `The mean moved to ${m.toFixed(1)} minutes, later than seven of the eight deliveries; the median stayed at ${med}. Squaring makes one large error count more than many small ones.`}
          </Verdict>
        </div>
      </div>
    </section>
  );
}

export function LossLab() {
  return (
    <div className="@container space-y-10">
      <BinaryPanel />
      <SoftmaxPanel />
      <OutlierPanel />
    </div>
  );
}
