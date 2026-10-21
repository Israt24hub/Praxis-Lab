"use client";

import { useId, useState } from "react";

import { NOISE_SD, noisyWave, SMALL_TRAIN } from "@/content/datasets/noisy-wave";
import { cx } from "@/lib/cx";
import { evaluate, fitPolynomial, meanSquaredError, type PolyFit } from "@/lib/polyfit";

/*
 * Polynomial fits of degree 0–11, refitted in the browser whenever a control
 * changes. Validation error is shown for every degree, so the U-shape is visible.
 */

const MAX_DEGREE = 11;
const penalties = [0, 0.0001, 0.001, 0.01, 0.1, 1];
const noiseLevel = NOISE_SD * NOISE_SD;

const fmtErr = (v: number) => (v >= 1000 ? Math.round(v).toLocaleString("en-US") : v >= 10 ? v.toFixed(1) : v.toFixed(3));

function FitChart({
  fit,
  xs,
  ys,
  showTruth,
}: {
  fit: PolyFit;
  xs: number[];
  ys: number[];
  showTruth: boolean;
}) {
  const W = 560;
  const H = 340;
  const pad = { l: 44, r: 14, t: 14, b: 34 };
  const yLim = 2.2;
  const sx = (v: number) => pad.l + ((v + 1) / 2) * (W - pad.l - pad.r);
  const sy = (v: number) => H - pad.b - ((v + yLim) / (2 * yLim)) * (H - pad.t - pad.b);
  const clampY = (v: number) => Math.max(-yLim * 1.5, Math.min(yLim * 1.5, v));
  const path = (f: (x: number) => number) =>
    Array.from({ length: 401 }, (_, i) => -1 + (i / 400) * 2)
      .map((x, i) => `${i === 0 ? "M" : "L"}${sx(x).toFixed(1)} ${sy(clampY(f(x))).toFixed(1)}`)
      .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Degree ${fit.degree} polynomial fitted to ${xs.length} training points, with 30 validation points.`}
    >
      <defs>
        <clipPath id="of-clip">
          <rect x={pad.l} y={pad.t} width={W - pad.l - pad.r} height={H - pad.t - pad.b} />
        </clipPath>
      </defs>
      {[-2, -1, 0, 1, 2].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="dg-grid" />
          <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="dg-label">
            {t}
          </text>
        </g>
      ))}
      {[-1, -0.5, 0, 0.5, 1].map((t) => (
        <text key={t} x={sx(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
          {t}
        </text>
      ))}
      {showTruth ? (
        <path d={path((x) => Math.sin(Math.PI * x))} fill="none" stroke="var(--color-fg-faint)" strokeWidth={2} strokeDasharray="3 5" clipPath="url(#of-clip)" />
      ) : null}
      <path d={path((x) => evaluate(fit, x))} fill="none" stroke="var(--dg-hl)" strokeWidth={2.75} clipPath="url(#of-clip)" />
      {noisyWave.valX.map((x, i) => (
        <rect
          key={`v${i}`}
          x={sx(x) - 4.5}
          y={sy(noisyWave.valY[i]) - 4.5}
          width={9}
          height={9}
          transform={`rotate(45 ${sx(x)} ${sy(noisyWave.valY[i])})`}
          fill="var(--color-surface)"
          stroke="var(--color-highlight)"
          strokeWidth={2}
        />
      ))}
      {xs.map((x, i) => (
        <circle key={`t${i}`} cx={sx(x)} cy={sy(ys[i])} r={5} fill="var(--dg-ink)" />
      ))}
    </svg>
  );
}

function ErrorChart({ train, val, degree }: { train: number[]; val: number[]; degree: number }) {
  const W = 560;
  const H = 270;
  const pad = { l: 56, r: 14, t: 28, b: 36 };
  const lo = -3;
  const hi = 3;
  const sx = (d: number) => pad.l + (d / MAX_DEGREE) * (W - pad.l - pad.r);
  const sy = (v: number) => {
    const l = Math.log10(Math.max(10 ** lo, Math.min(10 ** hi, v)));
    return H - pad.b - ((l - lo) / (hi - lo)) * (H - pad.t - pad.b);
  };
  const line = (vals: number[]) => vals.map((v, d) => `${d === 0 ? "M" : "L"}${sx(d).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");
  const best = val.indexOf(Math.min(...val));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Training and validation error for degrees 0 to ${MAX_DEGREE}, on a logarithmic scale. Validation error is lowest at degree ${best}.`}
    >
      {[0.001, 0.01, 0.1, 1, 10, 100, 1000].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="dg-grid" />
          <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="dg-label">
            {t >= 1 ? t.toLocaleString("en-US") : t}
          </text>
        </g>
      ))}
      {Array.from({ length: MAX_DEGREE + 1 }, (_, d) => (
        <text key={d} x={sx(d)} y={H - pad.b + 18} textAnchor="middle" className="dg-label" style={d === degree ? { fontWeight: 700, fill: "var(--color-fg)" } : undefined}>
          {d}
        </text>
      ))}
      <text x={W - pad.r} y={H - 4} textAnchor="end" className="dg-label">
        polynomial degree
      </text>
      <text x={pad.l} y={14} className="dg-label">
        MSE (log scale; values above 1,000 are cut off)
      </text>
      <line x1={pad.l} x2={W - pad.r} y1={sy(noiseLevel)} y2={sy(noiseLevel)} stroke="var(--color-fg-faint)" strokeDasharray="1 4" strokeWidth={2} />
      <line x1={sx(degree)} x2={sx(degree)} y1={pad.t} y2={H - pad.b} stroke="var(--color-line-strong)" />
      <path d={line(train)} fill="none" stroke="var(--dg-ink)" strokeWidth={2.25} />
      <path d={line(val)} fill="none" stroke="var(--color-highlight)" strokeWidth={2.5} strokeDasharray="7 4" />
      {train.map((v, d) => (
        <circle key={`t${d}`} cx={sx(d)} cy={sy(v)} r={d === degree ? 5 : 3} fill="var(--dg-ink)" />
      ))}
      {val.map((v, d) => (
        <circle key={`v${d}`} cx={sx(d)} cy={sy(v)} r={d === degree ? 5.5 : 3.5} fill={d === best ? "var(--color-highlight)" : "var(--color-surface)"} stroke="var(--color-highlight)" strokeWidth={2} />
      ))}
    </svg>
  );
}

export function OverfittingLab() {
  const ids = { deg: useId(), pen: useId(), truth: useId(), size: useId() };
  const [degree, setDegree] = useState(1);
  const [penaltyIndex, setPenaltyIndex] = useState(0);
  const [moreData, setMoreData] = useState(false);
  const [showTruth, setShowTruth] = useState(false);

  const n = moreData ? noisyWave.trainX.length : SMALL_TRAIN;
  const xs = noisyWave.trainX.slice(0, n);
  const ys = noisyWave.trainY.slice(0, n);
  const penalty = penalties[penaltyIndex];

  const fits = Array.from({ length: MAX_DEGREE + 1 }, (_, d) => fitPolynomial(xs, ys, d, penalty));
  const trainErr = fits.map((f) => meanSquaredError(f, xs, ys));
  const valErr = fits.map((f) => meanSquaredError(f, noisyWave.valX, noisyWave.valY));
  const best = valErr.indexOf(Math.min(...valErr));
  const tr = trainErr[degree];
  const va = valErr[degree];

  let verdict: { label: string; text: string; tone: "good" | "under" | "over" };
  if (va <= valErr[best] * 1.2) {
    verdict = {
      label: degree === best ? "Best on validation" : "About as good as the best",
      text: `Validation error is within 20% of the lowest, at degree ${best}. This is the region to choose from — preferring the simpler curve.`,
      tone: "good",
    };
  } else if (degree > best && va <= valErr[best] * 2) {
    verdict = {
      label: "A little more complex than needed",
      text: `Validation error is ${Math.round((va / valErr[best] - 1) * 100)}% above the best, at degree ${best}. The extra flexibility is starting to fit noise; the simpler curve is the better choice.`,
      tone: "under",
    };
  } else if (degree < best) {
    verdict = {
      label: "Underfitting",
      text: "The curve is too simple to follow the pattern: training and validation error are both high.",
      tone: "under",
    };
  } else {
    const ratio = va / tr;
    verdict = {
      label: "Overfitting",
      text:
        tr < 1e-6
          ? `The curve passes through every training point (training error ≈ 0), but validation error is ${fmtErr(va)}: it has memorised the noise.`
          : `Validation error is ${ratio >= 100 ? Math.round(ratio).toLocaleString("en-US") : ratio.toFixed(1)} times the training error: the curve is following the noise in ${n} points.`,
      tone: "over",
    };
  }

  return (
    <div className="@container space-y-6">
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @2xl:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor={ids.deg} className="text-sm font-semibold">
              Polynomial degree (model complexity)
            </label>
            <output htmlFor={ids.deg} className="font-mono text-sm tabular-nums">
              {degree}
            </output>
          </div>
          <input
            id={ids.deg}
            type="range"
            min={0}
            max={MAX_DEGREE}
            step={1}
            value={degree}
            onChange={(e) => setDegree(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--color-primary)]"
          />
          <p className="mt-1 text-sm text-fg-muted">
            Degree d has d + 1 parameters. Degree 11 can pass through any 12 points.
          </p>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor={ids.pen} className="text-sm font-semibold">
              Penalty on large coefficients λ
            </label>
            <output htmlFor={ids.pen} className="font-mono text-sm tabular-nums">
              {penalty}
            </output>
          </div>
          <input
            id={ids.pen}
            type="range"
            min={0}
            max={penalties.length - 1}
            step={1}
            value={penaltyIndex}
            aria-valuetext={String(penalty)}
            onChange={(e) => setPenaltyIndex(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--color-primary)]"
          />
          <p className="mt-1 text-sm text-fg-muted">Regularisation: λ = 0 is plain least squares.</p>
        </div>
        <label htmlFor={ids.size} className="flex cursor-pointer items-start gap-3 text-sm">
          <input id={ids.size} type="checkbox" checked={moreData} onChange={(e) => setMoreData(e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-primary)]" />
          <span>
            <span className="font-semibold">Use 48 training points instead of 12</span>
            <span className="block text-fg-muted">Same source, four times as much data.</span>
          </span>
        </label>
        <label htmlFor={ids.truth} className="flex cursor-pointer items-start gap-3 text-sm">
          <input id={ids.truth} type="checkbox" checked={showTruth} onChange={(e) => setShowTruth(e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-primary)]" />
          <span>
            <span className="font-semibold">Show the curve the data came from</span>
            <span className="block text-fg-muted">y = sin(πx). In real projects you never get to see this.</span>
          </span>
        </label>
      </div>

      <div className="grid gap-6 @5xl:grid-cols-2">
        <figure className="min-w-0 rounded-panel border border-line bg-sunken p-3 sm:p-4">
          <div className="diagram-scroll" tabIndex={0} role="region" aria-label="Chart: fitted curve and data">
            <FitChart fit={fits[degree]} xs={xs} ys={ys} showTruth={showTruth} />
          </div>
          <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-fg-muted">
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden width="12" height="12">
                <circle cx="6" cy="6" r="5" fill="var(--dg-ink)" />
              </svg>
              training point ({n})
            </span>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden width="14" height="14">
                <rect x="3" y="3" width="8" height="8" transform="rotate(45 7 7)" fill="none" stroke="var(--color-highlight)" strokeWidth="2" />
              </svg>
              validation point (30)
            </span>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden width="20" height="10">
                <line x1="0" y1="5" x2="20" y2="5" stroke="var(--dg-hl)" strokeWidth="2.5" />
              </svg>
              fitted curve
            </span>
          </figcaption>
        </figure>

        <div className="min-w-0 space-y-4">
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-panel border border-line bg-line text-sm">
            {[
              ["training MSE", fmtErr(tr)],
              ["validation MSE", fmtErr(va)],
              ["best degree (validation)", String(best)],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface px-3 py-2.5">
                <dt className="text-fg-muted">{k}</dt>
                <dd className="font-mono text-base tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div
            aria-live="polite"
            className={cx(
              "rounded-panel border p-4",
              verdict.tone === "good" ? "border-success" : verdict.tone === "over" ? "border-danger" : "border-highlight",
            )}
          >
            <p className={cx("font-semibold", verdict.tone === "good" ? "text-success" : verdict.tone === "over" ? "text-danger" : "text-highlight-text")}>
              {verdict.label}
            </p>
            <p className="mt-1 text-sm text-fg-muted">{verdict.text}</p>
          </div>
          <figure className="rounded-panel border border-line bg-sunken p-3 sm:p-4">
            <div className="diagram-scroll" tabIndex={0} role="region" aria-label="Chart: error by degree">
              <ErrorChart train={trainErr} val={valErr} degree={degree} />
            </div>
            <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-fg-muted">
              <span className="inline-flex items-center gap-2">
                <svg aria-hidden width="20" height="10">
                  <line x1="0" y1="5" x2="20" y2="5" stroke="var(--dg-ink)" strokeWidth="2.25" />
                </svg>
                training error
              </span>
              <span className="inline-flex items-center gap-2">
                <svg aria-hidden width="20" height="10">
                  <line x1="0" y1="5" x2="20" y2="5" stroke="var(--color-highlight)" strokeWidth="2.5" strokeDasharray="7 4" />
                </svg>
                validation error (filled dot = lowest)
              </span>
              <span className="inline-flex items-center gap-2">
                <svg aria-hidden width="20" height="10">
                  <line x1="0" y1="5" x2="20" y2="5" stroke="var(--color-fg-faint)" strokeWidth="2" strokeDasharray="1 4" />
                </svg>
                noise level σ² = {noiseLevel.toFixed(2)}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>

      <p className="text-sm text-fg-faint">
        Every fit is computed in your browser by least squares. The data is simulated: y = sin(πx) plus random noise with standard
        deviation {NOISE_SD}, so the best achievable error on average is about {noiseLevel.toFixed(2)}.
      </p>
    </div>
  );
}
