"use client";

import { useId, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { screeningScores } from "@/content/datasets/screening-scores";
import { cx } from "@/lib/cx";
import { averagePrecision, confusionAt, prCurve, rates, rocAuc, rocCurve } from "@/lib/metrics";

/*
 * Move a decision threshold over the scores of a simulated screening model and
 * watch every metric respond. All metrics are computed in the browser.
 */

const { positive, negative } = screeningScores;
const total = positive.length + negative.length;
const prevalence = positive.length / total;
const roc = rocCurve(positive, negative);
const pr = prCurve(positive, negative);
const auc = rocAuc(positive, negative);
const ap = averagePrecision(positive, negative);

const thresholds = Array.from({ length: 100 }, (_, i) => i + 1);
const byThreshold = thresholds.map((t) => ({ t, ...rates(confusionAt(positive, negative, t)) }));
const bestAccuracy = byThreshold.reduce((best, r) => (r.accuracy > best.accuracy ? r : best));
const bestF1 = byThreshold.reduce((best, r) => (r.f1 > best.f1 ? r : best));
const recall90 = [...byThreshold].reverse().find((r) => r.recall >= 0.9)!;

const pct = (v: number | null) => (v === null ? "undefined" : `${(v * 100).toFixed(1)}%`);

/** Deterministic vertical jitter so overlapping scores stay visible. */
const jitter = (i: number) => ((i * 37) % 11) / 10 - 0.5;

function ScoreStrip({ threshold }: { threshold: number }) {
  const W = 620;
  const H = 170;
  const pad = { l: 128, r: 14, t: 14, b: 30 };
  const sx = (v: number) => pad.l + (v / 100) * (W - pad.l - pad.r);
  const rowY = { pos: 52, neg: 112 };
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Scores of 20 positive and 180 negative cases. Cases scoring ${(threshold / 100).toFixed(2)} or more are predicted positive.`}
    >
      <rect x={sx(threshold)} y={pad.t} width={sx(100) - sx(threshold)} height={H - pad.t - pad.b} fill="var(--color-mist)" />
      <text x={sx(100) - 6} y={pad.t + 14} textAnchor="end" className="dg-label">
        predicted positive
      </text>
      <text x={pad.l + 6} y={pad.t + 14} className="dg-label">
        predicted negative
      </text>
      <text x={pad.l - 10} y={rowY.pos + 4} textAnchor="end" className="dg-label-strong">
        positive (20)
      </text>
      <text x={pad.l - 10} y={rowY.neg + 4} textAnchor="end" className="dg-label-strong">
        negative (180)
      </text>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <text key={t} x={sx(t * 100)} y={H - 10} textAnchor="middle" className="dg-label">
          {t}
        </text>
      ))}
      {positive.map((s, i) => (
        <circle key={`p${i}`} cx={sx(s)} cy={rowY.pos + jitter(i) * 26} r={4.5} fill="var(--dg-ink)" />
      ))}
      {negative.map((s, i) => (
        <circle key={`n${i}`} cx={sx(s)} cy={rowY.neg + jitter(i) * 30} r={3.5} fill="none" stroke="var(--color-fg-muted)" strokeWidth={1.25} />
      ))}
      <line x1={sx(threshold)} x2={sx(threshold)} y1={pad.t} y2={H - pad.b} stroke="var(--dg-hl)" strokeWidth={2.5} />
    </svg>
  );
}

function Curve({
  kind,
  current,
}: {
  kind: "roc" | "pr";
  current: { x: number; y: number | null };
}) {
  const S = 240;
  const pad = 48;
  const sx = (v: number) => pad + v * (S - pad - 10);
  const sy = (v: number) => S - pad - v * (S - pad - 10);
  const pts = kind === "roc" ? roc.map((p) => ({ x: p.fpr, y: p.tpr })) : pr.map((p) => ({ x: p.recall, y: p.precision }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      className="h-auto w-full"
      role="img"
      aria-label={
        kind === "roc"
          ? `ROC curve, area ${auc.toFixed(3)}. Current point: false positive rate ${current.x.toFixed(2)}, true positive rate ${current.y?.toFixed(2)}.`
          : `Precision–recall curve, average precision ${ap.toFixed(3)}. Current point: recall ${current.x.toFixed(2)}, precision ${current.y === null ? "undefined" : current.y.toFixed(2)}.`
      }
    >
      <rect x={sx(0)} y={sy(1)} width={sx(1) - sx(0)} height={sy(0) - sy(1)} fill="none" stroke="var(--color-line)" />
      {kind === "roc" ? (
        <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke="var(--color-fg-faint)" strokeDasharray="3 4" />
      ) : (
        <line x1={sx(0)} y1={sy(prevalence)} x2={sx(1)} y2={sy(prevalence)} stroke="var(--color-fg-faint)" strokeDasharray="3 4" />
      )}
      <path d={path} fill="none" stroke="var(--dg-hl)" strokeWidth={2.25} />
      {current.y !== null ? <circle cx={sx(current.x)} cy={sy(current.y)} r={6} fill="var(--color-highlight)" stroke="var(--color-surface)" strokeWidth={2} /> : null}
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <text x={sx(t)} y={S - pad + 16} textAnchor="middle" className="dg-label">
            {t}
          </text>
          <text x={pad - 6} y={sy(t) + 4} textAnchor="end" className="dg-label">
            {t}
          </text>
        </g>
      ))}
      <text x={sx(0.5)} y={S - 4} textAnchor="middle" className="dg-label">
        {kind === "roc" ? "false positive rate" : "recall"}
      </text>
      <text x={13} y={sy(0.5)} textAnchor="middle" className="dg-label" transform={`rotate(-90 13 ${sy(0.5)})`}>
        {kind === "roc" ? "true positive rate (recall)" : "precision"}
      </text>
    </svg>
  );
}

export function ThresholdLab() {
  const id = useId();
  const [threshold, setThreshold] = useState(50);
  const c = confusionAt(positive, negative, threshold);
  const r = rates(c);

  const presets = [
    { label: "Highest accuracy", t: bestAccuracy.t },
    { label: "Highest F1", t: bestF1.t },
    { label: "Catch 90% of positives", t: recall90.t },
  ];

  const metrics: Array<[string, string, string]> = [
    ["Accuracy", pct(r.accuracy), "(TP + TN) / all — share of all cases called correctly"],
    ["Precision", pct(r.precision), "TP / (TP + FP) — of those flagged, how many are positive"],
    ["Recall (sensitivity)", pct(r.recall), "TP / (TP + FN) — of the positives, how many are flagged"],
    ["Specificity", pct(r.specificity), "TN / (TN + FP) — of the negatives, how many are cleared"],
    ["F1 score", r.f1.toFixed(3), "Harmonic mean of precision and recall"],
  ];

  return (
    <div className="@container space-y-6">
      <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
        <div className="flex items-baseline justify-between">
          <label htmlFor={id} className="font-semibold">
            Decision threshold
          </label>
          <output htmlFor={id} className="font-mono tabular-nums">
            {(threshold / 100).toFixed(2)}
          </output>
        </div>
        <input
          id={id}
          type="range"
          min={1}
          max={100}
          step={1}
          value={threshold}
          aria-valuetext={(threshold / 100).toFixed(2)}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--color-primary)]"
        />
        <p className="mt-1 text-sm text-fg-muted">A case is predicted positive when its score is at least the threshold.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              aria-pressed={threshold === p.t}
              onClick={() => setThreshold(p.t)}
              className={buttonStyles("secondary", cx("px-3 py-1.5 text-sm", threshold === p.t && "bg-mist"))}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <figure className="rounded-panel border border-line bg-sunken p-3 sm:p-4">
        <div className="diagram-scroll" tabIndex={0} role="region" aria-label="Chart: scores by class">
          <ScoreStrip threshold={threshold} />
        </div>
        <figcaption className="mt-2 text-sm text-fg-muted">
          Each dot is one case. Filled: actually positive. Hollow: actually negative. Only 10% of cases are positive.
        </figcaption>
      </figure>

      <div className="grid gap-6 @4xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 space-y-4">
          <div className="overflow-x-auto rounded-panel border border-line bg-surface" tabIndex={0} role="region" aria-label="Confusion matrix">
            <table className="w-full min-w-[20rem] border-collapse text-center text-sm">
              <caption className="px-4 pt-3 text-left font-semibold">Confusion matrix</caption>
              <thead>
                <tr>
                  <td />
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Predicted positive
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Predicted negative
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="px-3 py-2 text-left font-semibold">
                    Actually positive
                  </th>
                  <td className="border border-line bg-mist px-3 py-3">
                    <span className="block font-mono text-2xl tabular-nums">{c.tp}</span>
                    <span className="text-xs text-fg-muted">true positives</span>
                  </td>
                  <td className="border border-line px-3 py-3">
                    <span className="block font-mono text-2xl tabular-nums text-danger">{c.fn}</span>
                    <span className="text-xs text-fg-muted">false negatives (missed)</span>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="px-3 py-2 text-left font-semibold">
                    Actually negative
                  </th>
                  <td className="border border-line px-3 py-3">
                    <span className="block font-mono text-2xl tabular-nums text-highlight-text">{c.fp}</span>
                    <span className="text-xs text-fg-muted">false positives (false alarms)</span>
                  </td>
                  <td className="border border-line bg-mist px-3 py-3">
                    <span className="block font-mono text-2xl tabular-nums">{c.tn}</span>
                    <span className="text-xs text-fg-muted">true negatives</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="rounded-panel border border-dashed border-line-strong p-4 text-sm text-fg-muted">
            <strong className="font-semibold text-fg">Baseline — always predict negative:</strong> accuracy 90.0%, recall 0%,
            precision undefined. It never finds a single positive case.
          </p>
        </div>

        <div className="min-w-0 overflow-x-auto rounded-panel border border-line bg-surface" tabIndex={0} role="region" aria-label="Metrics at this threshold">
          <table className="w-full min-w-[24rem] text-left text-sm">
            <caption className="px-4 pt-3 text-left font-semibold">Metrics at this threshold</caption>
            <tbody>
              {metrics.map(([name, value, def]) => (
                <tr key={name} className="border-t border-line first:border-t-0">
                  <th scope="row" className="px-4 py-2.5 font-semibold">
                    {name}
                  </th>
                  <td className="px-4 py-2.5 font-mono text-base tabular-nums">{value}</td>
                  <td className="px-4 py-2.5 text-fg-muted">{def}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p aria-live="polite" className="border-t border-line px-4 py-3 text-sm">
            {r.accuracy > 0.9
              ? `Accuracy beats the always-negative baseline here, yet ${c.fn} of 20 positives are missed.`
              : `Accuracy is ${r.accuracy === 0.9 ? "equal to" : "below"} the always-negative baseline, yet this threshold finds ${c.tp} of 20 positives.`}
          </p>
        </div>
      </div>

      <div className="grid gap-4 @xl:grid-cols-2">
        <figure className="rounded-panel border border-line bg-sunken p-3">
          <Curve kind="roc" current={{ x: r.falsePositiveRate, y: r.recall }} />
          <figcaption className="mt-1 text-sm text-fg-muted">
            ROC curve. Area under it (ROC-AUC): <strong className="font-mono text-fg">{auc.toFixed(3)}</strong>. Diagonal: random guessing.
          </figcaption>
        </figure>
        <figure className="rounded-panel border border-line bg-sunken p-3">
          <Curve kind="pr" current={{ x: r.recall, y: r.precision }} />
          <figcaption className="mt-1 text-sm text-fg-muted">
            Precision–recall curve. Average precision: <strong className="font-mono text-fg">{ap.toFixed(3)}</strong>. Dashed line:
            random guessing (precision = 10%).
          </figcaption>
        </figure>
      </div>

      <p className="text-sm text-fg-faint">
        The scores come from a simulated screening model, not a real one. Every count and metric is computed in your browser from those
        200 scores; ROC-AUC and average precision summarise all thresholds at once, so they don’t change as you move the slider.
      </p>
    </div>
  );
}
