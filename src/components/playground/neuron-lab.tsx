"use client";

import { RotateCcw } from "lucide-react";
import { useId, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { cx } from "@/lib/cx";

/*
 * A real (tiny) computation: one neuron, a = f(w1·x1 + w2·x2 + b).
 * Everything is computed in the browser from the slider values.
 */

type Activation = "sigmoid" | "relu" | "tanh";

const activations: Record<Activation, { label: string; fn: (z: number) => number; range: [number, number]; note: (z: number, a: number) => string }> = {
  sigmoid: {
    label: "Sigmoid",
    fn: (z) => 1 / (1 + Math.exp(-z)),
    range: [0, 1],
    note: (z) =>
      `Sigmoid squeezes any z into the range 0 to 1, so the output can be read as a probability. It is above 0.5 exactly when z is positive — here z is ${z > 0 ? "positive" : z < 0 ? "negative" : "zero"}.`,
  },
  relu: {
    label: "ReLU",
    fn: (z) => Math.max(0, z),
    range: [0, 10],
    note: (z) =>
      z > 0
        ? "ReLU passes positive values through unchanged. This neuron is active."
        : "z is not positive, so ReLU outputs 0. The neuron is inactive for these inputs, and no gradient would flow through it during training.",
  },
  tanh: {
    label: "tanh",
    fn: (z) => Math.tanh(z),
    range: [-1, 1],
    note: () => "tanh squeezes z into the range −1 to 1 and is centred on 0, unlike sigmoid.",
  },
};

const defaults = { x1: 1, x2: 0.5, w1: 0.8, w2: -1.2, b: 0.1 };
type Params = typeof defaults;

const fmt = (n: number) => (Math.abs(n) < 0.005 ? "0.00" : n.toFixed(2)).replace("-", "−");
const fmtSigned = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n));

function Slider({ name, label, value, onChange }: { name: keyof Params; label: string; value: number; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm">
          <span className="font-bold">{name}</span> <span className="text-chalk-muted">{label}</span>
        </label>
        <output htmlFor={id} className="font-mono text-sm tabular-nums">
          {fmt(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={-2}
        max={2}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--color-accent)]"
      />
    </div>
  );
}

function ActivationPlot({ activation, z }: { activation: Activation; z: number }) {
  const { fn, range } = activations[activation];
  const W = 320;
  const H = 180;
  const pad = 24;
  const zMin = -10;
  const zMax = 10;
  const sx = (v: number) => pad + ((v - zMin) / (zMax - zMin)) * (W - 2 * pad);
  const sy = (v: number) => H - pad - ((v - range[0]) / (range[1] - range[0])) * (H - 2 * pad);
  const curve = Array.from({ length: 201 }, (_, i) => zMin + (i * (zMax - zMin)) / 200)
    .map((v, i) => `${i === 0 ? "M" : "L"}${sx(v).toFixed(1)} ${sy(fn(v)).toFixed(1)}`)
    .join(" ");
  const a = fn(z);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${activations[activation].label} curve with the current point at z = ${fmt(z)}, output ${fmt(a)}.`}>
      <line x1={pad} y1={sy(Math.max(range[0], Math.min(0, range[1])))} x2={W - pad} y2={sy(Math.max(range[0], Math.min(0, range[1])))} className="dg-line" />
      <line x1={sx(0)} y1={pad / 2} x2={sx(0)} y2={H - pad} className="dg-line" />
      <path d={curve} className="dg-chalk" />
      <line x1={sx(z)} y1={sy(a)} x2={sx(z)} y2={H - pad} stroke="var(--color-accent)" strokeDasharray="3 3" />
      <circle cx={sx(z)} cy={sy(a)} r={6} fill="var(--color-accent)" />
      <text x={W - pad} y={H - 6} textAnchor="end" className="dg-label">z</text>
      <text x={sx(0) + 6} y={pad} className="dg-label">a = f(z)</text>
    </svg>
  );
}

export function NeuronLab() {
  const [p, setP] = useState<Params>(defaults);
  const [activation, setActivation] = useState<Activation>("sigmoid");
  const set = (key: keyof Params) => (v: number) => setP((prev) => ({ ...prev, [key]: v }));

  const z = p.w1 * p.x1 + p.w2 * p.x2 + p.b;
  const a = activations[activation].fn(z);

  return (
    <div className="grid gap-8 rounded-panel border border-line bg-board-raised p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="mb-1 font-bold">Inputs</legend>
          <Slider name="x1" label="first input" value={p.x1} onChange={set("x1")} />
          <Slider name="x2" label="second input" value={p.x2} onChange={set("x2")} />
        </fieldset>
        <fieldset className="space-y-4">
          <legend className="mb-1 font-bold">Parameters (what training would learn)</legend>
          <Slider name="w1" label="weight on x1" value={p.w1} onChange={set("w1")} />
          <Slider name="w2" label="weight on x2" value={p.w2} onChange={set("w2")} />
          <Slider name="b" label="bias" value={p.b} onChange={set("b")} />
        </fieldset>
        <fieldset>
          <legend className="mb-2 font-bold">Activation</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(activations) as Activation[]).map((key) => (
              <label
                key={key}
                className={cx(
                  "cursor-pointer rounded-control border px-3 py-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                  activation === key ? "border-accent bg-board text-chalk" : "border-line-strong text-chalk-muted hover:text-chalk",
                )}
              >
                <input
                  type="radio"
                  name="activation"
                  value={key}
                  checked={activation === key}
                  onChange={() => setActivation(key)}
                  className="sr-only"
                />
                {activations[key].label}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          className={buttonStyles("secondary")}
          onClick={() => {
            setP(defaults);
            setActivation("sigmoid");
          }}
        >
          <RotateCcw aria-hidden className="size-4" />
          Reset values
        </button>
      </div>

      <div className="space-y-6">
        <div className="rounded-control border border-line bg-board-deep p-4 sm:p-5">
          <p className="text-sm text-chalk-muted">1. Weighted sum</p>
          <p className="mt-1 overflow-x-auto font-mono text-[0.95rem] leading-relaxed">
            z = {fmtSigned(p.w1)} × {fmtSigned(p.x1)} + {fmtSigned(p.w2)} × {fmtSigned(p.x2)} + {fmtSigned(p.b)}
            <br />
            <span className="text-accent">z = {fmt(z)}</span>
          </p>
          <p className="mt-4 text-sm text-chalk-muted">2. Activation</p>
          <p className="mt-1 font-mono text-[0.95rem]">
            a = {activations[activation].label}({fmt(z)}) = <span className="text-accent">{activation === "relu" ? fmt(a) : a.toFixed(3)}</span>
          </p>
        </div>
        <div className="rounded-control border border-line bg-board-deep p-3 sm:p-4">
          <ActivationPlot activation={activation} z={z} />
        </div>
        <p aria-live="polite" className="text-chalk-muted">
          {activations[activation].note(z, a)}
        </p>
      </div>
    </div>
  );
}
