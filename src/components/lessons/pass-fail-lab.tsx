"use client";

import { useId, useState } from "react";

import { extraStudent, passFail } from "@/content/datasets/pass-fail";
import { accuracy, fitLine, fitLogistic, logLoss, sigmoid } from "@/lib/classification";
import { cx } from "@/lib/cx";

/*
 * Logistic regression and a least-squares line, both fitted in the browser to
 * 0/1 pass labels. Logistic regression uses Newton's method (exact here).
 */

const fmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toFixed(d).replace("-", "−") : "—");
const logit = (p: number) => Math.log(p / (1 - p));

interface Pt {
  x: number;
  y: 0 | 1;
}

function Chart({
  points,
  logistic,
  line,
  showLogistic,
  showLine,
  threshold,
  query,
  xMax,
}: {
  points: Pt[];
  logistic: { w: number; b: number };
  line: { w: number; b: number };
  showLogistic: boolean;
  showLine: boolean;
  threshold: number;
  query: number;
  xMax: number;
}) {
  const W = 600;
  const H = 340;
  const pad = { l: 52, r: 18, t: 18, b: 42 };
  const yMin = -0.3;
  const yMax = 1.35;
  const sx = (v: number) => pad.l + (v / xMax) * (W - pad.l - pad.r);
  const sy = (v: number) => H - pad.b - ((v - yMin) / (yMax - yMin)) * (H - pad.t - pad.b);
  const curve = Array.from({ length: 241 }, (_, i) => (i / 240) * xMax)
    .map((v, i) => `${i === 0 ? "M" : "L"}${sx(v).toFixed(1)} ${sy(sigmoid(logistic.w * v + logistic.b)).toFixed(1)}`)
    .join(" ");
  const boundary = (logit(threshold) - logistic.b) / logistic.w;
  const lineBoundary = (0.5 - line.b) / line.w;
  const xTicks = xMax > 12 ? [0, 5, 10, 15, 20, 25] : [0, 2, 4, 6, 8, 10];

  // Stack repeated points (same hours and label) so each student is visible.
  const seen = new Map<string, number>();
  const placed = points.map((p) => {
    const key = `${p.x}-${p.y}`;
    const k = seen.get(key) ?? 0;
    seen.set(key, k + 1);
    return { ...p, dy: (p.y === 1 ? -1 : 1) * k * 0.1 };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Students plotted by hours studied, at 1 if they passed and 0 if they failed. Logistic regression predicts a pass from ${fmt(boundary)} hours at threshold ${threshold}. The straight line crosses 0.5 at ${fmt(lineBoundary)} hours.`}
    >
      <defs>
        <clipPath id="pf-clip">
          <rect x={pad.l} y={pad.t} width={W - pad.l - pad.r} height={H - pad.t - pad.b} />
        </clipPath>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="dg-grid" />
          <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="dg-label">
            {t}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <text key={t} x={sx(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
          {t}
        </text>
      ))}
      <text x={W - pad.r} y={H - 6} textAnchor="end" className="dg-label">
        hours studied
      </text>
      <text x={pad.l + 4} y={pad.t + 2} className="dg-label">
        outcome (1 = passed, 0 = failed) and predicted probability
      </text>

      {showLogistic ? (
        <g>
          <line x1={pad.l} x2={W - pad.r} y1={sy(threshold)} y2={sy(threshold)} stroke="var(--dg-hl)" strokeDasharray="2 4" />
          {boundary > 0 && boundary < xMax ? (
            <line x1={sx(boundary)} x2={sx(boundary)} y1={pad.t} y2={H - pad.b} stroke="var(--dg-hl)" strokeDasharray="6 4" />
          ) : null}
          <path d={curve} fill="none" stroke="var(--dg-hl)" strokeWidth={2.5} clipPath="url(#pf-clip)" />
        </g>
      ) : null}
      {showLine ? (
        <g>
          <line
            x1={sx(0)}
            y1={sy(line.b)}
            x2={sx(xMax)}
            y2={sy(line.w * xMax + line.b)}
            stroke="var(--color-highlight)"
            strokeWidth={2.5}
            strokeDasharray="8 5"
            clipPath="url(#pf-clip)"
          />
          {lineBoundary > 0 && lineBoundary < xMax ? (
            <line x1={sx(lineBoundary)} x2={sx(lineBoundary)} y1={pad.t} y2={H - pad.b} stroke="var(--color-highlight)" strokeDasharray="2 3" />
          ) : null}
        </g>
      ) : null}

      {placed.map((p, i) => {
        const predicted = sigmoid(logistic.w * p.x + logistic.b) >= threshold ? 1 : 0;
        const wrong = showLogistic && predicted !== p.y;
        const cx_ = sx(p.x);
        const cy = sy(p.y + p.dy);
        return (
          <g key={i}>
            <circle cx={cx_} cy={cy} r={6} fill={p.y === 1 ? "var(--dg-ink)" : "var(--color-surface)"} stroke="var(--dg-ink)" strokeWidth={2} />
            {wrong ? (
              <path d={`M${cx_ - 10} ${cy - 10} L${cx_ + 10} ${cy + 10} M${cx_ + 10} ${cy - 10} L${cx_ - 10} ${cy + 10}`} stroke="var(--color-danger)" strokeWidth={2} />
            ) : null}
          </g>
        );
      })}

      <line x1={sx(query)} x2={sx(query)} y1={pad.t} y2={H - pad.b} stroke="var(--color-line-strong)" strokeDasharray="1 4" />
    </svg>
  );
}

export function PassFailLab() {
  const ids = { thr: useId(), q: useId(), extra: useId(), lg: useId(), ln: useId() };
  const [withExtra, setWithExtra] = useState(false);
  const [threshold, setThreshold] = useState(0.5);
  const [query, setQuery] = useState(4);
  const [showLogistic, setShowLogistic] = useState(true);
  const [showLine, setShowLine] = useState(true);

  const base: Pt[] = passFail.map((r) => ({ x: r.hours, y: r.passed }));
  const points: Pt[] = withExtra ? [...base, { x: extraStudent.hours, y: extraStudent.passed }] : base;
  const logistic = fitLogistic(points);
  const line = fitLine(points);
  const xMax = withExtra ? 26 : 10;
  const q = Math.min(query, xMax);

  const boundary = (logit(threshold) - logistic.b) / logistic.w;
  const lineBoundary = (0.5 - line.b) / line.w;
  const predictLogistic = (x: number) => (sigmoid(logistic.w * x + logistic.b) >= threshold ? 1 : 0) as 0 | 1;
  const predictLine = (x: number) => (line.w * x + line.b >= 0.5 ? 1 : 0) as 0 | 1;
  const pq = sigmoid(logistic.w * q + logistic.b);
  const lq = line.w * q + line.b;
  const predictedPass = points.filter((p) => predictLogistic(p.x) === 1).length;

  return (
    <div className="@container space-y-6">
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <label htmlFor={ids.lg} className="flex cursor-pointer items-center gap-2 text-sm">
          <input id={ids.lg} type="checkbox" checked={showLogistic} onChange={(e) => setShowLogistic(e.target.checked)} className="size-4 accent-[var(--color-primary)]" />
          <svg aria-hidden width="22" height="10">
            <line x1="0" y1="5" x2="22" y2="5" stroke="var(--dg-hl)" strokeWidth="2.5" />
          </svg>
          Logistic regression
        </label>
        <label htmlFor={ids.ln} className="flex cursor-pointer items-center gap-2 text-sm">
          <input id={ids.ln} type="checkbox" checked={showLine} onChange={(e) => setShowLine(e.target.checked)} className="size-4 accent-[var(--color-primary)]" />
          <svg aria-hidden width="22" height="10">
            <line x1="0" y1="5" x2="22" y2="5" stroke="var(--color-highlight)" strokeWidth="2.5" strokeDasharray="8 5" />
          </svg>
          Straight line fitted to the 0/1 labels
        </label>
        <label htmlFor={ids.extra} className="flex cursor-pointer items-center gap-2 text-sm">
          <input id={ids.extra} type="checkbox" checked={withExtra} onChange={(e) => setWithExtra(e.target.checked)} className="size-4 accent-[var(--color-primary)]" />
          Add a student who studied 25 hours and passed
        </label>
      </div>

      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <figure className="min-w-0 rounded-panel border border-line bg-sunken p-3 sm:p-4">
          <div className="diagram-scroll" tabIndex={0} role="region" aria-label="Chart: pass or fail against hours studied">
            <Chart
              points={points}
              logistic={logistic}
              line={line}
              showLogistic={showLogistic}
              showLine={showLine}
              threshold={threshold}
              query={q}
              xMax={xMax}
            />
          </div>
          <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-fg-muted">
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden width="12" height="12">
                <circle cx="6" cy="6" r="5" fill="var(--dg-ink)" />
              </svg>
              passed
            </span>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden width="12" height="12">
                <circle cx="6" cy="6" r="5" fill="none" stroke="var(--dg-ink)" strokeWidth="2" />
              </svg>
              failed
            </span>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden width="14" height="14">
                <path d="M2 2 L12 12 M12 2 L2 12" stroke="var(--color-danger)" strokeWidth="2" />
              </svg>
              misclassified by logistic regression
            </span>
            <span>Vertical dashed lines: where each model switches from “fail” to “pass”.</span>
          </figcaption>
        </figure>

        <div className="min-w-0 space-y-4">
          <div className="space-y-4 rounded-panel border border-line bg-surface p-4 sm:p-5">
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor={ids.thr} className="text-sm font-semibold">
                  Decision threshold (logistic)
                </label>
                <output htmlFor={ids.thr} className="font-mono text-sm tabular-nums">
                  {threshold.toFixed(2)}
                </output>
              </div>
              <input
                id={ids.thr}
                type="range"
                min={0.05}
                max={0.95}
                step={0.05}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--color-primary)]"
              />
              <p className="mt-1 text-sm text-fg-muted">Predict “pass” when P(pass) ≥ threshold.</p>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor={ids.q} className="text-sm font-semibold">
                  A new student studies
                </label>
                <output htmlFor={ids.q} className="font-mono text-sm tabular-nums">
                  {q.toFixed(1)} h
                </output>
              </div>
              <input
                id={ids.q}
                type="range"
                min={0}
                max={xMax}
                step={0.5}
                value={q}
                onChange={(e) => setQuery(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--color-primary)]"
              />
              <dl className="mt-2 space-y-1 font-mono text-[0.95rem]">
                <div>
                  <dt className="inline text-fg-muted">logistic: </dt>
                  <dd className="inline">
                    P(pass) = <strong className="text-link">{pq.toFixed(3)}</strong> → {pq >= threshold ? "pass" : "fail"}
                  </dd>
                </div>
                <div>
                  <dt className="inline text-fg-muted">line: </dt>
                  <dd className="inline">
                    output = <strong className="text-highlight-text">{fmt(lq, 3)}</strong> → {lq >= 0.5 ? "pass" : "fail"}
                  </dd>
                </div>
              </dl>
              {lq > 1 || lq < 0 ? (
                <p className="mt-2 text-sm text-highlight-text">
                  The line’s output is {lq > 1 ? "above 1" : "below 0"}, so it can’t be read as a probability.
                </p>
              ) : null}
            </div>
          </div>

          <div className="relative overflow-x-auto rounded-panel border border-line bg-surface" tabIndex={0} role="region" aria-label="Fitted models compared">
            <table className="w-full min-w-[22rem] text-left text-sm">
              <caption className="px-4 pt-3 text-left font-semibold">Fitted to {points.length} students</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-2">
                    <span className="sr-only">Measure</span>
                  </th>
                  <th scope="col" className="px-4 py-2">Logistic</th>
                  <th scope="col" className="px-4 py-2">Line</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                <tr className="border-t border-line">
                  <th scope="row" className="px-4 py-1.5 font-sans font-normal text-fg-muted">w, b</th>
                  <td className="px-4 py-1.5">
                    {fmt(logistic.w)}, {fmt(logistic.b)}
                  </td>
                  <td className="px-4 py-1.5">
                    {fmt(line.w, 3)}, {fmt(line.b, 3)}
                  </td>
                </tr>
                <tr className="border-t border-line">
                  <th scope="row" className="px-4 py-1.5 font-sans font-normal text-fg-muted">switches to pass at</th>
                  <td className="px-4 py-1.5">{fmt(boundary)} h</td>
                  <td className="px-4 py-1.5">{fmt(lineBoundary)} h</td>
                </tr>
                <tr className="border-t border-line">
                  <th scope="row" className="px-4 py-1.5 font-sans font-normal text-fg-muted">accuracy, original 20</th>
                  <td className="px-4 py-1.5">{Math.round(accuracy(predictLogistic, base) * 100)}%</td>
                  <td className="px-4 py-1.5">{Math.round(accuracy(predictLine, base) * 100)}%</td>
                </tr>
                <tr className="border-t border-line">
                  <th scope="row" className="px-4 py-1.5 font-sans font-normal text-fg-muted">log loss</th>
                  <td className="px-4 py-1.5">{logLoss(logistic.w, logistic.b, points).toFixed(3)}</td>
                  <td className="px-4 py-1.5 font-sans text-fg-faint">not defined</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p aria-live="polite" className={cx("text-sm", withExtra ? "text-fg" : "text-fg-muted")}>
            {withExtra
              ? `With the 25-hour student, the line flattens and now switches to “pass” at ${fmt(lineBoundary)} hours instead of 3.75, misclassifying more of the original students. Logistic regression barely moves.`
              : `Logistic regression predicts “pass” for ${predictedPass} of ${points.length} students at this threshold.`}
          </p>
        </div>
      </div>

      <p className="text-sm text-fg-faint">
        Both models are fitted in your browser: logistic regression by Newton’s method (no regularisation), the line by least squares.
        The 20 students are invented for teaching.
      </p>
    </div>
  );
}
