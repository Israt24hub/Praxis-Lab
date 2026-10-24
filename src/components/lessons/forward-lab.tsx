"use client";

import { useState } from "react";

import { b1, b2, exampleBatch, exampleParams, forwardExample, W1, W2 } from "@/lib/forward-example";
import type { Matrix } from "@/lib/nn";
import { cx } from "@/lib/cx";

import { Segmented, Stats, StepSlider, ticks } from "./lab-ui";

/*
 * A forward pass through 3 → 4 (ReLU) → 2 (softmax), computed in the browser for a batch
 * of up to four examples. Every intermediate array is shown with its shape, and any
 * single number can be traced back to the multiplications that produced it.
 */

type Stage = "Z1" | "H" | "Z2" | "P";

/** Up to three decimals, at least two: 0.94, 0.245, −1.25. */
export function fmt(v: number) {
  const r = Math.round(v * 1000) / 1000;
  let s = (Object.is(r, -0) ? 0 : r).toFixed(3);
  if (s.endsWith("0")) s = s.slice(0, -1);
  return s.replace("-", "−");
}
const paren = (v: number) => (v < 0 ? `(${fmt(v)})` : fmt(v));
const SUB = ["₁", "₂", "₃", "₄"];

const STAGES: [Stage, string][] = [
  ["Z1", "Layer 1 sums"],
  ["H", "ReLU"],
  ["Z2", "Layer 2 sums"],
  ["P", "Softmax"],
];
const INPUT_VALUES = ticks(-2, 2, 0.5);

function MatrixTable({
  name,
  shape,
  M,
  colPrefix,
  rows,
  selRow,
  selCol,
  zeroMuted,
}: {
  name: string;
  shape: string;
  M: Matrix;
  colPrefix: string;
  rows: number;
  selRow?: number;
  selCol?: number;
  zeroMuted?: boolean;
}) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
        <span className="font-semibold">{name}</span>
        <span className="font-mono text-fg-muted">shape {shape}</span>
      </figcaption>
      <div className="overflow-x-auto rounded-panel border border-line bg-surface">
        <table className="w-full border-collapse font-mono text-sm tabular-nums">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="px-2.5 py-1.5 text-left font-sans text-xs font-semibold text-fg-muted">
                example
              </th>
              {M[0].map((_, j) => (
                <th key={j} scope="col" className="px-2.5 py-1.5 text-right font-sans text-xs font-semibold text-fg-muted">
                  {colPrefix === "x" ? `x${SUB[j]}` : `${colPrefix}${j + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {M.slice(0, rows).map((r, i) => (
              <tr key={i} className={cx("border-b border-line last:border-0", i === selRow && "bg-mist")}>
                <th scope="row" className="px-2.5 py-1.5 text-left font-sans text-xs font-semibold text-fg-muted">
                  {i + 1}
                </th>
                {r.map((v, j) => (
                  <td
                    key={j}
                    className={cx(
                      "px-2.5 py-1.5 text-right",
                      zeroMuted && v === 0 && (i === selRow ? "text-fg-muted" : "text-fg-faint"),
                      i === selRow && j === selCol && "font-bold text-fg outline-2 -outline-offset-2 outline-primary",
                    )}
                  >
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

function WeightTable({ name, M, bias, rowPrefix, colPrefix }: { name: string; M: Matrix; bias: number[]; rowPrefix: string; colPrefix: string }) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
        <span className="font-semibold">{name}</span>
        <span className="font-mono text-fg-muted">
          shape ({M.length}, {bias.length}) and ({bias.length},)
        </span>
      </figcaption>
      <div className="overflow-x-auto rounded-panel border border-line bg-surface">
        <table className="w-full border-collapse font-mono text-sm tabular-nums">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="px-2.5 py-1.5 text-left font-sans text-xs font-semibold text-fg-muted">
                from ↓ to →
              </th>
              {bias.map((_, j) => (
                <th key={j} scope="col" className="px-2.5 py-1.5 text-right font-sans text-xs font-semibold text-fg-muted">
                  {colPrefix}
                  {j + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {M.map((r, i) => (
              <tr key={i} className="border-b border-line">
                <th scope="row" className="px-2.5 py-1.5 text-left font-sans text-xs font-semibold text-fg-muted">
                  {rowPrefix === "x" ? `x${SUB[i]}` : `${rowPrefix}${i + 1}`}
                </th>
                {r.map((v, j) => (
                  <td key={j} className="px-2.5 py-1.5 text-right">
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row" className="px-2.5 py-1.5 text-left font-sans text-xs font-semibold text-fg-muted">
                bias
              </th>
              {bias.map((v, j) => (
                <td key={j} className="px-2.5 py-1.5 text-right">
                  {fmt(v)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function ForwardLab() {
  const [X, setX] = useState<Matrix>(() => exampleBatch.map((r) => r.slice()));
  const [batch, setBatch] = useState<"1" | "2" | "4">("4");
  const [row, setRow] = useState(0);
  const [stage, setStage] = useState<Stage>("Z1");
  const [col, setCol] = useState(2);
  const B = Number(batch);
  const r = Math.min(row, B - 1);
  const width = stage === "Z1" || stage === "H" ? 4 : 2;
  const c = Math.min(col, width - 1);
  const f = forwardExample(X);

  const setInput = (k: number, v: number) => setX(X.map((x, i) => (i === r ? x.map((old, j) => (j === k ? v : old)) : x)));

  let trace: { formula: string; lines: string[] };
  if (stage === "Z1") {
    const terms = X[r].map((x, i) => `${paren(x)} × ${paren(W1[i][c])}`);
    trace = {
      formula: `Z₁[${r + 1}, ${c + 1}] = example ${r + 1}’s inputs · column ${c + 1} of W₁ + b₁[${c + 1}]`,
      lines: [`= ${terms.join(" + ")} + ${paren(b1[c])}`, `= ${fmt(f.Z1[r][c])}`],
    };
  } else if (stage === "H") {
    trace = {
      formula: `H[${r + 1}, ${c + 1}] = ReLU(Z₁[${r + 1}, ${c + 1}]) = max(0, Z₁[${r + 1}, ${c + 1}])`,
      lines: [`= max(0, ${fmt(f.Z1[r][c])})`, `= ${fmt(f.H[r][c])}${f.Z1[r][c] < 0 ? "   (negative sums become 0)" : ""}`],
    };
  } else if (stage === "Z2") {
    const terms = f.H[r].map((h, i) => `${paren(h)} × ${paren(W2[i][c])}`);
    trace = {
      formula: `Z₂[${r + 1}, ${c + 1}] = example ${r + 1}’s hidden values · column ${c + 1} of W₂ + b₂[${c + 1}]`,
      lines: [`= ${terms.join(" + ")} + ${paren(b2[c])}`, `= ${fmt(f.Z2[r][c])}`],
    };
  } else {
    const [z1, z2] = f.Z2[r];
    trace = {
      formula: `P[${r + 1}, ${c + 1}] = e^Z₂[${r + 1}, ${c + 1}] ÷ (e^Z₂[${r + 1}, 1] + e^Z₂[${r + 1}, 2])`,
      lines: [
        `= e^${fmt(f.Z2[r][c])} ÷ (e^${fmt(z1)} + e^${fmt(z2)})`,
        `= ${Math.exp(f.Z2[r][c]).toFixed(3)} ÷ (${Math.exp(z1).toFixed(3)} + ${Math.exp(z2).toFixed(3)}) = ${f.P[r][c].toFixed(3)}`,
      ],
    };
  }

  const zeros = f.H.slice(0, B).flat().filter((v) => v === 0).length;
  const predicted = f.P.slice(0, B).map((p) => (p[0] >= p[1] ? 1 : 2));

  return (
    <div className="@container space-y-6">
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <div className="grid gap-5 @2xl:grid-cols-2">
          <Segmented legend="Batch size B" value={batch} onChange={setBatch} options={[["1", "1"], ["2", "2"], ["4", "4"]]} />
          <Segmented
            legend="Example to trace"
            value={String(r)}
            onChange={(v) => setRow(Number(v))}
            options={Array.from({ length: B }, (_, i) => [String(i), `example ${i + 1}`] as const)}
          />
        </div>
        <div className="grid gap-5 @2xl:grid-cols-2">
          <Segmented legend="Trace a number in" value={stage} onChange={setStage} options={STAGES} />
          <Segmented
            legend={stage === "P" || stage === "Z2" ? "Output" : "Hidden unit"}
            value={String(c)}
            onChange={(v) => setCol(Number(v))}
            options={Array.from({ length: width }, (_, j) => [String(j), stage === "P" || stage === "Z2" ? `output ${j + 1}` : `unit ${j + 1}`] as const)}
          />
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Inputs of example {r + 1}</legend>
          <div className="grid gap-5 @2xl:grid-cols-3">
            {[0, 1, 2].map((k) => (
              <StepSlider
                key={k}
                label={`x${["₁", "₂", "₃"][k]}`}
                values={INPUT_VALUES}
                index={INPUT_VALUES.indexOf(X[r][k])}
                onChange={(i) => setInput(k, INPUT_VALUES[i])}
                format={(v) => fmt(v)}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <div className="rounded-panel border border-primary bg-surface p-4 text-sm" aria-live="polite">
        <p className="font-semibold">{trace.formula}</p>
        <div className="mt-2 overflow-x-auto font-mono">
          {trace.lines.map((l) => (
            <p key={l} className="whitespace-nowrap">
              {l}
            </p>
          ))}
        </div>
      </div>

      <div className="grid gap-5 @3xl:grid-cols-2">
        <MatrixTable name="Input X" shape={`(${B}, 3)`} M={X} colPrefix="x" rows={B} selRow={r} />
        <MatrixTable name="Layer 1 sums Z₁ = X·W₁ + b₁" shape={`(${B}, 4)`} M={f.Z1} colPrefix="unit " rows={B} selRow={r} selCol={stage === "Z1" ? c : undefined} />
        <MatrixTable name="Hidden values H = ReLU(Z₁)" shape={`(${B}, 4)`} M={f.H} colPrefix="unit " rows={B} selRow={r} selCol={stage === "H" ? c : undefined} zeroMuted />
        <MatrixTable name="Layer 2 sums Z₂ = H·W₂ + b₂ (logits)" shape={`(${B}, 2)`} M={f.Z2} colPrefix="output " rows={B} selRow={r} selCol={stage === "Z2" ? c : undefined} />
        <MatrixTable name="Probabilities P = softmax(Z₂)" shape={`(${B}, 2)`} M={f.P} colPrefix="class " rows={B} selRow={r} selCol={stage === "P" ? c : undefined} />
        <div className="min-w-0 space-y-3">
          <Stats
            columns={2}
            items={[
              ["parameters", String(exampleParams)],
              ["hidden values that are 0", `${zeros} of ${4 * B}`],
              ["multiply-adds per example", String(3 * 4 + 4 * 2)],
              ["predicted classes", predicted.join(", ")],
            ]}
          />
          <p className="text-sm text-fg-muted">
            Each row is computed independently: changing the batch size changes the first number of every shape, and nothing else.
          </p>
        </div>
      </div>

      <details className="rounded-panel border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-semibold">The weights (set by hand for this lesson)</summary>
        <div className="mt-4 grid gap-5 @3xl:grid-cols-2">
          <WeightTable name="Layer 1: W₁ and b₁" M={W1} bias={b1} rowPrefix="x" colPrefix="unit " />
          <WeightTable name="Layer 2: W₂ and b₂" M={W2} bias={b2} rowPrefix="unit " colPrefix="output " />
        </div>
      </details>
      <p className="text-sm text-fg-faint">Every value is computed in your browser. A trained network would have learned its weights from data.</p>
    </div>
  );
}
