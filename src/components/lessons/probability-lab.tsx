"use client";

import { Shuffle } from "lucide-react";
import { useMemo, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { accuracySE, mean, screening, sd, simulateAccuracy, within } from "@/lib/probability";

import { ChartFrame, LegendItem, Stats, StepSlider, Verdict, pct } from "./lab-ui";

/*
 * Two panels, computed in the browser. 1: a screening test on 1,000 people —
 * how likely a positive result is to be right depends on how common the condition
 * is. 2: measure a model with true accuracy p on n test examples, 1,000 times
 * over, and see how much the measured accuracy varies.
 */

const PREVALENCE = [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5];
const RATES = [0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 0.99, 0.999];
const fmtRate = (v: number) => `${+(v * 100).toFixed(1)}%`;
const fmtCount = (v: number) => (Number.isInteger(Math.round(v * 10) / 10) ? String(Math.round(v)) : v.toFixed(1));

function ScreeningPanel() {
  const [pi, setPi] = useState(PREVALENCE.indexOf(0.02));
  const [si, setSi] = useState(RATES.indexOf(0.9));
  const [ci, setCi] = useState(RATES.indexOf(0.95));
  const prevalence = PREVALENCE[pi];
  const sens = RATES[si];
  const spec = RATES[ci];
  const r = screening(prevalence, sens, spec, 1000);

  // 1,000 squares, 50 per row: true positives, false negatives, false positives, true negatives.
  const counts = [Math.round(r.tp), Math.round(r.fn), Math.round(r.fp)];
  const kinds = Array.from({ length: 1000 }, (_, i) => (i < counts[0] ? "tp" : i < counts[0] + counts[1] ? "fn" : i < counts[0] + counts[1] + counts[2] ? "fp" : "tn"));
  const cell = 10;
  const per = 50;

  const fill = { tp: "var(--color-success)", fn: "var(--color-surface)", fp: "var(--color-highlight)", tn: "var(--color-line)" } as const;
  const stroke = { tp: "var(--color-success)", fn: "var(--color-success)", fp: "var(--color-highlight)", tn: "var(--color-line)" } as const;

  return (
    <section aria-labelledby="pr-screen" className="space-y-5">
      <h3 id="pr-screen" className="font-semibold">
        1. A positive test result: how likely is it right?
      </h3>
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @2xl:grid-cols-3">
        <StepSlider
          label="How common the condition is (prevalence)"
          values={PREVALENCE}
          index={pi}
          onChange={setPi}
          format={fmtRate}
          help="P(condition), before any test."
        />
        <StepSlider label="Sensitivity" values={RATES} index={si} onChange={setSi} format={fmtRate} help="P(positive | condition)." />
        <StepSlider label="Specificity" values={RATES} index={ci} onChange={setCi} format={fmtRate} help="P(negative | no condition)." />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: 1,000 people, by condition and test result"
          legend={
            <>
              <LegendItem swatch={<rect x="5" y="2" width="10" height="10" fill="var(--color-success)" />}>has it, tests positive ({fmtCount(r.tp)})</LegendItem>
              <LegendItem swatch={<rect x="5" y="2" width="10" height="10" fill="var(--color-surface)" stroke="var(--color-success)" strokeWidth="1.5" />}>
                has it, tests negative ({fmtCount(r.fn)})
              </LegendItem>
              <LegendItem swatch={<rect x="5" y="2" width="10" height="10" fill="var(--color-highlight)" />}>doesn’t, tests positive ({fmtCount(r.fp)})</LegendItem>
              <LegendItem swatch={<rect x="5" y="2" width="10" height="10" fill="var(--color-line)" />}>doesn’t, tests negative ({fmtCount(r.tn)})</LegendItem>
            </>
          }
        >
          <svg
            viewBox={`0 0 ${per * cell + 4} ${(1000 / per) * cell + 4}`}
            className="h-auto w-full"
            role="img"
            aria-label={`Of 1,000 people, ${fmtCount(r.tp)} have the condition and test positive, ${fmtCount(r.fp)} do not have it but test positive.`}
          >
            {kinds.map((k, i) => (
              <rect
                key={i}
                x={2 + (i % per) * cell + 1}
                y={2 + Math.floor(i / per) * cell + 1}
                width={cell - 2}
                height={cell - 2}
                rx={1.5}
                fill={fill[k]}
                stroke={stroke[k]}
                strokeWidth={k === "fn" ? 1.5 : 0}
              />
            ))}
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              ["people testing positive", fmtCount(r.positives)],
              ["of those, really have it", fmtCount(r.tp)],
              ["P(condition | positive)", pct(r.ppv)],
            ]}
          />
          <div className="rounded-panel border border-line bg-surface p-4 text-sm">
            <p className="font-semibold">Bayes’ rule, with the counts</p>
            <p className="math mt-2">
              P(condition | positive) = true positives ÷ all positives = {fmtCount(r.tp)} ÷ ({fmtCount(r.tp)} + {fmtCount(r.fp)}) = {pct(r.ppv)}
            </p>
            <p className="math mt-1 text-fg-muted">
              P(no condition | negative) = {fmtCount(r.tn)} ÷ ({fmtCount(r.tn)} + {fmtCount(r.fn)}) = {pct(r.npv)}
            </p>
          </div>
          <Verdict tone={r.ppv < 0.5 ? "warn" : "neutral"} title={r.ppv < 0.5 ? "Most positive results are false alarms" : "A positive result is more likely right than wrong"}>
            {r.ppv < 0.5
              ? `The test is ${fmtRate(sens)} sensitive and ${fmtRate(spec)} specific, yet only ${pct(r.ppv)} of positives are real: the condition is so rare that the few mistakes among the ${fmtCount(1000 - prevalence * 1000)} healthy people outnumber the real cases.`
              : `With prevalence ${fmtRate(prevalence)}, real cases outnumber the false alarms. The same test can be useful in one group and misleading in another.`}
          </Verdict>
        </div>
      </div>
    </section>
  );
}

const TRUE_P = [0.6, 0.7, 0.8, 0.9];
const SIZES = [20, 50, 100, 200, 500, 1000];
const REPS = 1000;

function SamplingPanel() {
  const [p, setP] = useState(2);
  const [n, setN] = useState(3);
  const [seed, setSeed] = useState(1);
  const truth = TRUE_P[p];
  const size = SIZES[n];
  const scores = useMemo(() => simulateAccuracy(truth, size, REPS, seed), [truth, size, seed]);
  const se = accuracySE(truth, size);
  const inside = within(scores, truth, 2 * se);

  const lo = 0.4;
  const hi = 1;
  const binW = 0.01;
  const bins = Array.from({ length: Math.round((hi - lo) / binW) }, () => 0);
  for (const s of scores) bins[Math.max(0, Math.min(bins.length - 1, Math.floor((s - lo) / binW + 1e-9)))]++;
  const maxBin = Math.max(...bins, 1);
  const W = 560;
  const H = 230;
  const pad = { l: 16, r: 16, t: 24, b: 40 };
  const bx = (v: number) => pad.l + ((v - lo) / (hi - lo)) * (W - pad.l - pad.r);
  const bh = (c: number) => (c / maxBin) * (H - pad.t - pad.b);

  return (
    <section aria-labelledby="pr-sample" className="space-y-5">
      <h3 id="pr-sample" className="font-semibold">
        2. How much does a test score wobble?
      </h3>
      <p className="text-sm text-fg-muted">
        A model that is right {pct(truth, 0)} of the time is tested on {size.toLocaleString("en-US")} new examples, {REPS.toLocaleString("en-US")} separate
        times. Each bar counts how often each measured accuracy came up.
      </p>
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @2xl:grid-cols-[1fr_1fr_auto] @2xl:items-end">
        <StepSlider label="True accuracy" values={TRUE_P} index={p} onChange={setP} format={(v) => pct(v, 0)} />
        <StepSlider label="Test set size n" values={SIZES} index={n} onChange={setN} format={(v) => v.toLocaleString("en-US")} />
        <button type="button" onClick={() => setSeed(seed + 1)} className={buttonStyles("secondary", "px-3 py-2")}>
          <Shuffle aria-hidden className="size-4" />
          Simulate again
        </button>
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: measured accuracy in 1,000 repeated tests"
          focus={[bx(Math.max(lo, truth - 2 * se)) / W, bx(Math.min(hi, truth + 2 * se)) / W]}
          legend={
            <>
              <LegendItem swatch={<rect x="3" y="2" width="14" height="10" fill="var(--dg-hl)" fillOpacity="0.55" />}>tests with that score</LegendItem>
              <LegendItem swatch={<line x1="10" y1="0" x2="10" y2="14" stroke="var(--dg-ink)" strokeWidth="2" strokeDasharray="3 3" />}>true accuracy</LegendItem>
              <LegendItem swatch={<rect x="1" y="3" width="18" height="8" fill="var(--color-success)" fillOpacity="0.2" />}>within ±2 standard errors</LegendItem>
            </>
          }
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Histogram of 1,000 measured accuracies around ${pct(truth, 0)}; ${pct(inside)} fall within two standard errors.`}>
            <rect x={bx(truth - 2 * se)} y={pad.t} width={bx(truth + 2 * se) - bx(truth - 2 * se)} height={H - pad.t - pad.b} fill="var(--color-success)" fillOpacity={0.15} />
            {[0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((t) => (
              <text key={t} x={bx(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                {Math.round(t * 100)}%
              </text>
            ))}
            <text x={W - pad.r} y={H - 4} textAnchor="end" className="dg-label">
              measured accuracy
            </text>
            <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} className="dg-line" />
            {bins.map((c, i) =>
              c > 0 ? (
                <rect key={i} x={bx(lo + i * binW) + 0.5} y={H - pad.b - bh(c)} width={bx(lo + (i + 1) * binW) - bx(lo + i * binW) - 1} height={bh(c)} fill="var(--dg-hl)" fillOpacity={0.55} />
              ) : null,
            )}
            <line x1={bx(truth)} x2={bx(truth)} y1={pad.t - 6} y2={H - pad.b} stroke="var(--dg-ink)" strokeWidth={2} strokeDasharray="3 3" />
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              ["standard error", `${(se * 100).toFixed(1)} points`],
              ["spread seen (SD)", `${(sd(scores) * 100).toFixed(1)} points`],
              ["within ±2 SE", pct(inside)],
              ["lowest score seen", pct(Math.min(...scores))],
              ["highest score seen", pct(Math.max(...scores))],
              ["average score", pct(mean(scores))],
            ]}
          />
          <Verdict tone={size < 200 ? "warn" : "neutral"} title={`±${(2 * se * 100).toFixed(1)} points is ordinary chance at n = ${size.toLocaleString("en-US")}`}>
            Standard error = √(p(1 − p) / n) = √({truth} × {+(1 - truth).toFixed(2)} / {size}) = {se.toFixed(4)}. About 95% of tests land within two standard errors of the
            truth. Two models that differ by less than that on one test set may not differ at all. Four times the data halves the wobble.
          </Verdict>
        </div>
      </div>
    </section>
  );
}

export function ProbabilityLab() {
  return (
    <div className="@container space-y-10">
      <ScreeningPanel />
      <SamplingPanel />
      <p className="text-sm text-fg-faint">
        Panel 1 is exact arithmetic on 1,000 people. Panel 2 is a simulation with a fixed random seed, so the same settings give the same chart; “Simulate
        again” draws new test sets.
      </p>
    </div>
  );
}
