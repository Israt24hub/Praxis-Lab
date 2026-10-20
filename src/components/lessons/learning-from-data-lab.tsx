"use client";

import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { studyHours } from "@/content/datasets/study-hours";
import { cx } from "@/lib/cx";
import {
  gdStep,
  meanSquaredError,
  scalingOf,
  standardise,
  toOriginalUnits,
  type GdState,
  type Point,
} from "@/lib/linear-regression";

/*
 * Real gradient descent on the 12 training rows of the study-hours dataset,
 * computed in the browser. Nothing here is pre-recorded.
 */

const train: Point[] = studyHours.filter((r) => r.split === "train").map((r) => ({ x: r.hours, y: r.score }));
const test: Point[] = studyHours.filter((r) => r.split === "test").map((r) => ({ x: r.hours, y: r.score }));
const trainMean = train.reduce((s, p) => s + p.y, 0) / train.length;
const baselineTest = meanSquaredError(0, trainMean, test);
const scaling = scalingOf(train);
const scaledTrain = standardise(train, scaling);

const learningRates = [0.001, 0.003, 0.01, 0.03, 0.05, 0.1, 0.3, 0.5];
const MAX_EPOCHS = 3000;
const DIVERGED = 1e7;

type Mode = "hand" | "gd";
type Status = "ready" | "running" | "paused" | "converged" | "diverged" | "limit";
interface HistoryPoint {
  epoch: number;
  train: number;
  test: number;
}

const fmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toFixed(d).replace("-", "−") : "—");

/* ---------- Charts ---------- */

const SX = { min: 0, max: 12 };
const SY = { min: 20, max: 110 };

function FitChart({ w, b, hours, showResiduals }: { w: number; b: number; hours: number; showResiduals: boolean }) {
  const W = 560;
  const H = 340;
  const pad = { l: 46, r: 16, t: 16, b: 40 };
  const x = (v: number) => pad.l + ((v - SX.min) / (SX.max - SX.min)) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - ((v - SY.min) / (SY.max - SY.min)) * (H - pad.t - pad.b);
  const clampY = (v: number) => Math.max(SY.min, Math.min(SY.max, v));
  const pred = w * hours + b;
  const xTicks = [0, 2, 4, 6, 8, 10, 12];
  const yTicks = [20, 40, 60, 80, 100];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Scatter plot of exam score against hours studied, with the current model line. Prediction for ${fmt(hours, 1)} hours: ${fmt(pred, 1)} points.`}
    >
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="dg-grid" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="dg-label">
            {t}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <text key={`x${t}`} x={x(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
          {t}
        </text>
      ))}
      <text x={W - pad.r} y={H - 4} textAnchor="end" className="dg-label">
        hours studied (feature)
      </text>
      <text x={pad.l} y={pad.t - 4} className="dg-label">
        exam score (target)
      </text>
      <line x1={pad.l} x2={W - pad.r} y1={y(100)} y2={y(100)} stroke="var(--color-highlight)" strokeDasharray="6 4" />
      <text x={W - pad.r} y={y(100) - 6} textAnchor="end" className="dg-label">
        maximum possible score
      </text>

      {showResiduals
        ? train.map((p) => (
            <line
              key={`r${p.x}`}
              x1={x(p.x)}
              x2={x(p.x)}
              y1={y(p.y)}
              y2={y(clampY(w * p.x + b))}
              stroke="var(--color-fg-faint)"
              strokeDasharray="3 3"
            />
          ))
        : null}

      <clipPath id="fit-clip">
        <rect x={pad.l} y={pad.t} width={W - pad.l - pad.r} height={H - pad.t - pad.b} />
      </clipPath>
      <line
        x1={x(SX.min)}
        y1={y(w * SX.min + b)}
        x2={x(SX.max)}
        y2={y(w * SX.max + b)}
        stroke="var(--dg-hl)"
        strokeWidth={2.5}
        clipPath="url(#fit-clip)"
      />

      {train.map((p) => (
        <circle key={`t${p.x}`} cx={x(p.x)} cy={y(p.y)} r={5.5} fill="var(--dg-ink)" />
      ))}
      {test.map((p) => (
        <rect
          key={`s${p.x}`}
          x={x(p.x) - 6}
          y={y(p.y) - 6}
          width={12}
          height={12}
          transform={`rotate(45 ${x(p.x)} ${y(p.y)})`}
          fill="var(--color-surface)"
          stroke="var(--color-highlight)"
          strokeWidth={2.5}
        />
      ))}

      <line x1={x(hours)} x2={x(hours)} y1={pad.t} y2={H - pad.b} stroke="var(--color-line-strong)" strokeDasharray="2 4" />
      <circle cx={x(hours)} cy={y(clampY(pred))} r={7} fill="var(--color-surface)" stroke="var(--dg-hl)" strokeWidth={3} />
    </svg>
  );
}

function LossChart({ history }: { history: HistoryPoint[] }) {
  const W = 560;
  const H = 220;
  const pad = { l: 52, r: 16, t: 14, b: 36 };
  const maxEpoch = Math.max(10, history.at(-1)?.epoch ?? 0);
  const lo = 0; // log10(1)
  const hi = 4; // log10(10 000)
  const x = (e: number) => pad.l + (e / maxEpoch) * (W - pad.l - pad.r);
  const y = (v: number) => {
    const l = Math.log10(Math.max(1, Math.min(10 ** hi, v)));
    return H - pad.b - ((l - lo) / (hi - lo)) * (H - pad.t - pad.b);
  };
  // Downsample long histories so the path stays light.
  const step = Math.max(1, Math.floor(history.length / 300));
  const sample = history.filter((_, i) => i % step === 0 || i === history.length - 1);
  const path = (key: "train" | "test") =>
    sample.map((h, i) => `${i === 0 ? "M" : "L"}${x(h.epoch).toFixed(1)} ${y(h[key]).toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={
        history.length
          ? `Loss over ${history.at(-1)?.epoch} epochs on a logarithmic scale. Latest training MSE ${fmt(history.at(-1)!.train)}, test MSE ${fmt(history.at(-1)!.test)}.`
          : "Loss chart, empty until training starts."
      }
    >
      {[1, 10, 100, 1000, 10000].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="dg-grid" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="dg-label">
            {t.toLocaleString("en-US")}
          </text>
        </g>
      ))}
      <text x={pad.l} y={H - 8} className="dg-label">
        0
      </text>
      <text x={W - pad.r} y={H - 8} textAnchor="end" className="dg-label">
        epoch {maxEpoch}
      </text>
      <text x={pad.l + 4} y={pad.t + 2} className="dg-label">
        MSE (log scale)
      </text>

      <line x1={pad.l} x2={W - pad.r} y1={y(baselineTest)} y2={y(baselineTest)} stroke="var(--color-fg-faint)" strokeDasharray="1 4" strokeWidth={2} />
      <text x={W - pad.r} y={y(baselineTest) - 6} textAnchor="end" className="dg-label">
        baseline test MSE {fmt(baselineTest, 1)}
      </text>

      {history.length > 1 ? (
        <>
          <path d={path("train")} fill="none" stroke="var(--dg-hl)" strokeWidth={2.5} />
          <path d={path("test")} fill="none" stroke="var(--color-highlight)" strokeWidth={2.5} strokeDasharray="7 4" />
        </>
      ) : (
        <text x={W / 2} y={H / 2} textAnchor="middle" className="dg-label">
          Press Step or Run to start training
        </text>
      )}
    </svg>
  );
}

/* ---------- Lab ---------- */

export function LearningFromDataLab() {
  const ids = { lr: useId(), w: useId(), b: useId(), hours: useId(), scale: useId() };
  const [mode, setMode] = useState<Mode>("gd");
  const [hand, setHand] = useState({ w: 3, b: 50 });
  const [lrIndex, setLrIndex] = useState(3);
  const [scaled, setScaled] = useState(false);
  const [state, setState] = useState<GdState>({ w: 0, b: 0, epoch: 0 });
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [hours, setHours] = useState(5);
  const frame = useRef<number | null>(null);

  const lr = learningRates[lrIndex];
  const points = scaled ? scaledTrain : train;

  const model = useMemo(() => {
    if (mode === "hand") return hand;
    return toOriginalUnits(state.w, state.b, scaled ? scaling : null);
  }, [mode, hand, state, scaled]);

  const trainMse = meanSquaredError(model.w, model.b, train);
  const testMse = meanSquaredError(model.w, model.b, test);

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  const reset = useCallback(() => {
    stop();
    setState({ w: 0, b: 0, epoch: 0 });
    setHistory([]);
    setStatus("ready");
  }, [stop]);

  /** Runs `count` epochs from `from`, returning the new state, new history rows and final status. */
  const runEpochs = useCallback(
    (from: GdState, count: number) => {
      let s = from;
      const rows: HistoryPoint[] = [];
      let result: Status | null = null;
      for (let i = 0; i < count; i++) {
        const next = gdStep(s, points, lr);
        s = { w: next.w, b: next.b, epoch: next.epoch };
        const original = toOriginalUnits(s.w, s.b, scaled ? scaling : null);
        const trainLoss = meanSquaredError(original.w, original.b, train);
        rows.push({ epoch: s.epoch, train: trainLoss, test: meanSquaredError(original.w, original.b, test) });
        if (!Number.isFinite(trainLoss) || trainLoss > DIVERGED) {
          result = "diverged";
          break;
        }
        if (next.gradNorm < 1e-3) {
          result = "converged";
          break;
        }
        if (s.epoch >= MAX_EPOCHS) {
          result = "limit";
          break;
        }
      }
      return { s, rows, result };
    },
    [points, lr, scaled],
  );

  const stepOnce = () => {
    if (status === "diverged" || status === "converged" || status === "limit") return;
    const { s, rows, result } = runEpochs(state, 1);
    setState(s);
    setHistory((h) => [...h, ...rows]);
    setStatus(result ?? "paused");
  };

  const run = () => {
    if (status === "running") {
      stop();
      setStatus("paused");
      return;
    }
    if (status === "diverged" || status === "converged" || status === "limit") return;
    setStatus("running");
    let current = state;
    const perFrame = scaled ? 1 : 8;
    const tick = () => {
      const { s, rows, result } = runEpochs(current, perFrame);
      current = s;
      setState(s);
      setHistory((h) => [...h, ...rows]);
      if (result) {
        setStatus(result);
        frame.current = null;
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  useEffect(() => stop, [stop]);

  const statusText: Record<Status, string> = {
    ready: "Ready. Parameters start at w = 0, b = 0.",
    running: "Training…",
    paused: `Paused after ${state.epoch} epoch${state.epoch === 1 ? "" : "s"}.`,
    converged: `Converged after ${state.epoch} epochs: the gradient is almost zero, so further steps barely change w and b.`,
    diverged: `Diverged after ${state.epoch} epochs: each step overshot the minimum by more than the last. Lower the learning rate${scaled ? "" : " or standardize the feature"}, then reset.`,
    limit: `Stopped at ${MAX_EPOCHS} epochs without fully converging. Try a larger learning rate${scaled ? "" : " or standardize the feature"}.`,
  };

  const busy = status === "running";

  return (
    <div className="@container space-y-6">
      <fieldset className="flex flex-wrap gap-2" aria-describedby={`${ids.lr}-mode-help`}>
        <legend className="mb-2 w-full text-sm font-semibold">How should w and b be set?</legend>
        {(
          [
            ["hand", "Fit by hand"],
            ["gd", "Train with gradient descent"],
          ] as const
        ).map(([value, label]) => (
          <label
            key={value}
            className={cx(
              "cursor-pointer rounded-control border px-4 py-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
              mode === value ? "border-primary bg-mist font-semibold text-fg" : "border-line-strong text-fg-muted hover:text-fg",
            )}
          >
            <input
              type="radio"
              name={`${ids.lr}-mode`}
              value={value}
              checked={mode === value}
              onChange={() => {
                stop();
                if (status === "running") setStatus("paused");
                setMode(value);
              }}
              className="sr-only"
            />
            {label}
          </label>
        ))}
        <p id={`${ids.lr}-mode-help`} className="sr-only">
          Fit by hand lets you move the parameters with sliders. Gradient descent adjusts them automatically.
        </p>
      </fieldset>

      <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Left: chart + prediction */}
        <div className="min-w-0 space-y-4">
          <figure className="mx-auto w-full max-w-[42rem] rounded-panel border border-line bg-sunken p-3 sm:p-4">
            <div className="diagram-scroll" tabIndex={0} role="region" aria-label="Chart: model fit">
              <FitChart w={model.w} b={model.b} hours={hours} showResiduals />
            </div>
            <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-fg-muted">
              <span className="inline-flex items-center gap-2">
                <svg aria-hidden width="12" height="12">
                  <circle cx="6" cy="6" r="5" fill="var(--dg-ink)" />
                </svg>
                training student (12)
              </span>
              <span className="inline-flex items-center gap-2">
                <svg aria-hidden width="14" height="14">
                  <rect x="3" y="3" width="8" height="8" transform="rotate(45 7 7)" fill="none" stroke="var(--color-highlight)" strokeWidth="2" />
                </svg>
                held-out test student (3)
              </span>
              <span className="inline-flex items-center gap-2">
                <svg aria-hidden width="18" height="10">
                  <line x1="0" y1="5" x2="18" y2="5" stroke="var(--color-fg-faint)" strokeDasharray="3 3" />
                </svg>
                error on a training student
              </span>
            </figcaption>
          </figure>

          <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor={ids.hours} className="font-semibold">
                Inference: a new student studies
              </label>
              <output htmlFor={ids.hours} className="font-mono tabular-nums">
                {fmt(hours, 1)} h
              </output>
            </div>
            <input
              id={ids.hours}
              type="range"
              min={0}
              max={12}
              step={0.5}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
            <p className="mt-2 font-mono text-[0.95rem]">
              ŷ = {fmt(model.w)} × {fmt(hours, 1)} + {fmt(model.b)} = <strong className="text-link">{fmt(model.w * hours + model.b, 1)}</strong>
            </p>
            {hours > 9 ? (
              <p className="mt-2 text-sm text-highlight-text">
                No training student studied more than 9 hours, so this prediction is an extrapolation.
                {model.w * hours + model.b > 100 ? " It is above the maximum possible score." : ""}
              </p>
            ) : hours < 1 ? (
              <p className="mt-2 text-sm text-highlight-text">Below the range of the training data, so treat this prediction with caution.</p>
            ) : null}
          </div>
        </div>

        {/* Right: controls + loss */}
        <div className="min-w-0 space-y-4">
          {mode === "hand" ? (
            <div className="space-y-4 rounded-panel border border-line bg-surface p-4 sm:p-5">
              <p className="font-semibold">Move the line yourself</p>
              {(
                [
                  ["w", "weight (slope)", 0, 12, 0.1],
                  ["b", "bias (intercept)", 0, 70, 0.5],
                ] as const
              ).map(([key, label, min, max, step]) => (
                <div key={key}>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor={ids[key]} className="text-sm">
                      <span className="font-semibold">{key}</span> <span className="text-fg-muted">{label}</span>
                    </label>
                    <output htmlFor={ids[key]} className="font-mono text-sm tabular-nums">
                      {fmt(hand[key], 1)}
                    </output>
                  </div>
                  <input
                    id={ids[key]}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={hand[key]}
                    onChange={(e) => setHand((h) => ({ ...h, [key]: Number(e.target.value) }))}
                    className="mt-2 w-full accent-[var(--color-primary)]"
                  />
                </div>
              ))}
              <p className="text-sm text-fg-muted">The dashed lines are the errors. Make them short overall — the training MSE below is your score.</p>
            </div>
          ) : (
            <div className="space-y-4 rounded-panel border border-line bg-surface p-4 sm:p-5">
              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor={ids.lr} className="text-sm font-semibold">
                    Learning rate η
                  </label>
                  <output htmlFor={ids.lr} className="font-mono text-sm tabular-nums">
                    {lr}
                  </output>
                </div>
                <input
                  id={ids.lr}
                  type="range"
                  min={0}
                  max={learningRates.length - 1}
                  step={1}
                  value={lrIndex}
                  disabled={busy}
                  aria-valuetext={String(lr)}
                  onChange={(e) => setLrIndex(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--color-primary)]"
                />
              </div>
              <label htmlFor={ids.scale} className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  id={ids.scale}
                  type="checkbox"
                  checked={scaled}
                  disabled={busy}
                  onChange={(e) => {
                    setScaled(e.target.checked);
                    reset();
                  }}
                  className="mt-0.5 size-4 accent-[var(--color-primary)]"
                />
                <span>
                  <span className="font-semibold">Standardize hours</span>
                  <span className="block text-fg-muted">
                    Train on (hours − {fmt(scaling.mean, 2)}) ÷ {fmt(scaling.std, 2)}. Results are converted back to hours for display. Changing this resets training.
                  </span>
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={stepOnce} disabled={busy} className={buttonStyles("secondary", "px-3 py-2")}>
                  <StepForward aria-hidden className="size-4" />
                  Step
                </button>
                <button type="button" onClick={run} className={buttonStyles("primary", "px-4 py-2")}>
                  {busy ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
                  {busy ? "Pause" : "Run"}
                </button>
                <button type="button" onClick={reset} className={buttonStyles("secondary", "px-3 py-2")}>
                  <RotateCcw aria-hidden className="size-4" />
                  Reset
                </button>
              </div>
              <p role="status" className={cx("text-sm", status === "diverged" ? "text-danger" : "text-fg-muted")}>
                {statusText[status]}
              </p>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line text-sm sm:grid-cols-3">
            {[
              ["w", fmt(model.w)],
              ["b", fmt(model.b)],
              ["epoch", mode === "gd" ? String(state.epoch) : "—"],
              ["training MSE", fmt(trainMse)],
              ["test MSE", fmt(testMse)],
              ["baseline test MSE", fmt(baselineTest)],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface px-3 py-2.5">
                <dt className="text-fg-muted">{k}</dt>
                <dd className="font-mono text-base tabular-nums text-fg">{v}</dd>
              </div>
            ))}
          </dl>

          {mode === "gd" ? (
            <figure className="mx-auto w-full max-w-[42rem] rounded-panel border border-line bg-sunken p-3 sm:p-4">
              <div className="diagram-scroll" tabIndex={0} role="region" aria-label="Chart: loss over training">
                <LossChart history={history} />
              </div>
              <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-fg-muted">
                <span className="inline-flex items-center gap-2">
                  <svg aria-hidden width="20" height="10">
                    <line x1="0" y1="5" x2="20" y2="5" stroke="var(--dg-hl)" strokeWidth="2.5" />
                  </svg>
                  training MSE
                </span>
                <span className="inline-flex items-center gap-2">
                  <svg aria-hidden width="20" height="10">
                    <line x1="0" y1="5" x2="20" y2="5" stroke="var(--color-highlight)" strokeWidth="2.5" strokeDasharray="7 4" />
                  </svg>
                  test MSE
                </span>
              </figcaption>
            </figure>
          ) : null}
        </div>
      </div>

      <details className="rounded-panel border border-line bg-surface">
        <summary className="cursor-pointer px-4 py-3 font-semibold sm:px-5">The data, with the current model’s predictions and errors</summary>
        <div className="overflow-x-auto border-t border-line" tabIndex={0} role="region" aria-label="Dataset with predictions">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="bg-sunken">
              <tr>
                <th scope="col" className="px-4 py-2">Student</th>
                <th scope="col" className="px-4 py-2">Hours (feature)</th>
                <th scope="col" className="px-4 py-2">Score (target)</th>
                <th scope="col" className="px-4 py-2">Prediction ŷ</th>
                <th scope="col" className="px-4 py-2">Error ŷ − y</th>
                <th scope="col" className="px-4 py-2">Set</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {studyHours.map((r) => {
                const p = model.w * r.hours + model.b;
                return (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-4 py-1.5">{r.id}</td>
                    <td className="px-4 py-1.5">{r.hours}</td>
                    <td className="px-4 py-1.5">{r.score}</td>
                    <td className="px-4 py-1.5">{fmt(p, 1)}</td>
                    <td className="px-4 py-1.5">{fmt(p - r.score, 1)}</td>
                    <td className="px-4 py-1.5 font-sans">{r.split === "train" ? "training" : "test (held out)"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>

      <p className="text-sm text-fg-faint">
        Real gradient descent on the 12 training rows, computed in your browser. The dataset is invented for teaching. The baseline
        always predicts the training mean, {fmt(trainMean)}.
      </p>
    </div>
  );
}
