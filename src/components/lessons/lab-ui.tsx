"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { cx } from "@/lib/cx";

/*
 * Small building blocks shared by the lesson labs, so controls and read-outs look
 * and behave the same everywhere.
 */

/** A row of mutually exclusive choices, drawn as buttons but built from radio inputs. */
export function Segmented<T extends string>({
  legend,
  value,
  options,
  onChange,
  hideLegend,
}: {
  legend: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
  hideLegend?: boolean;
}) {
  const name = useId();
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className={cx("mb-2 w-full text-sm font-semibold", hideLegend && "sr-only")}>{legend}</legend>
      {options.map(([v, label]) => (
        <label
          key={v}
          className={cx(
            "cursor-pointer rounded-control border px-3.5 py-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
            value === v ? "border-primary bg-mist font-semibold text-fg" : "border-line-strong text-fg-muted hover:text-fg",
          )}
        >
          <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} className="sr-only" />
          {label}
        </label>
      ))}
    </fieldset>
  );
}

/** A labelled range slider over a list of allowed values. */
export function StepSlider({
  label,
  values,
  index,
  onChange,
  format = String,
  help,
}: {
  label: string;
  values: readonly number[];
  index: number;
  onChange: (i: number) => void;
  format?: (v: number) => string;
  help?: ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-sm tabular-nums">
          {format(values[index])}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={values.length - 1}
        step={1}
        value={index}
        aria-valuetext={format(values[index])}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--color-primary)]"
      />
      {help ? <p className="mt-1 text-sm text-fg-muted">{help}</p> : null}
    </div>
  );
}

export function Checkbox({ checked, onChange, label, help }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-primary)]" />
      <span>
        <span className="font-semibold">{label}</span>
        {help ? <span className="block text-fg-muted">{help}</span> : null}
      </span>
    </label>
  );
}

/** Key figures in a grid of small cells. */
export function Stats({ items, columns = 3 }: { items: [string, ReactNode][]; columns?: 2 | 3 | 4 }) {
  return (
    <dl
      className={cx(
        "grid gap-px overflow-hidden rounded-panel border border-line bg-line text-sm",
        columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-2 @md:grid-cols-3" : "grid-cols-2 @lg:grid-cols-4",
      )}
    >
      {items.map(([k, v]) => (
        <div key={k} className="bg-surface px-3 py-2.5">
          <dt className="text-fg-muted">{k}</dt>
          <dd className="font-mono text-base tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A coloured message box that screen readers announce when it changes. */
export function Verdict({ tone, title, children }: { tone: "good" | "warn" | "bad" | "neutral"; title: string; children: ReactNode }) {
  return (
    <div
      aria-live="polite"
      className={cx(
        "rounded-panel border p-4",
        tone === "good" ? "border-success" : tone === "bad" ? "border-danger" : tone === "warn" ? "border-highlight" : "border-line-strong",
      )}
    >
      <p
        className={cx(
          "font-semibold",
          tone === "good" ? "text-success" : tone === "bad" ? "text-danger" : tone === "warn" ? "text-highlight-text" : "text-fg",
        )}
      >
        {title}
      </p>
      <div className="mt-1 text-sm text-fg-muted">{children}</div>
    </div>
  );
}

/**
 * A chart in a horizontally scrollable region (charts keep a minimum width so their labels stay
 * readable on phones). `focus` is the part that matters, as a fraction of the chart's width (one
 * value or a range); when the chart is wider than the screen, the region scrolls just enough to
 * keep that part in view, on first render and whenever it moves.
 */
export function ChartFrame({
  label,
  legend,
  focus,
  children,
}: {
  label: string;
  legend?: ReactNode;
  focus?: number | readonly [number, number];
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const clamp = (f: number) => Math.min(1, Math.max(0, f));
  const lo = focus === undefined ? null : clamp(typeof focus === "number" ? focus : Math.min(focus[0], focus[1]));
  const hi = focus === undefined ? null : clamp(typeof focus === "number" ? focus : Math.max(focus[0], focus[1]));

  useEffect(() => {
    const el = ref.current;
    if (!el || lo === null || hi === null) return;
    const keepInView = () => {
      const full = el.scrollWidth;
      const view = el.clientWidth;
      if (full <= view + 1) return;
      const margin = Math.min(32, view * 0.1);
      const a = lo * full;
      const b = hi * full;
      const left = el.scrollLeft;
      let target = left;
      if (b - a > view - 2 * margin) target = (a + b) / 2 - view / 2;
      else if (a < left + margin) target = a - margin;
      else if (b > left + view - margin) target = b + margin - view;
      if (Math.abs(target - left) > 1) el.scrollLeft = Math.max(0, Math.min(full - view, target));
    };
    keepInView();
    const observer = new ResizeObserver(keepInView);
    observer.observe(el);
    return () => observer.disconnect();
  }, [lo, hi]);

  return (
    <figure className="min-w-0 rounded-panel border border-line bg-sunken p-3 sm:p-4">
      <div ref={ref} className="diagram-scroll" tabIndex={0} role="region" aria-label={label}>
        {children}
      </div>
      {legend ? <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-fg-muted">{legend}</figcaption> : null}
    </figure>
  );
}

export function LegendItem({ swatch, children }: { swatch: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg aria-hidden width="20" height="14" viewBox="0 0 20 14">
        {swatch}
      </svg>
      {children}
    </span>
  );
}

/** Evenly spaced ticks covering [lo, hi]. */
export function ticks(lo: number, hi: number, step: number) {
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Number(v.toFixed(6)));
  return out;
}

export const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;
