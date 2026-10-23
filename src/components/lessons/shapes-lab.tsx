"use client";

import { useId, useState } from "react";

import { cx } from "@/lib/cx";
import { arange, broadcast, broadcastColumns, matmul, reshape, showShape, size, transpose, type Shape } from "@/lib/shapes";

import { Segmented, Stats, Verdict } from "./lab-ui";

/*
 * Three panels, computed in the browser with NumPy's own shape rules (checked
 * against NumPy in the tests): a shape calculator for + and @, the same 12 numbers
 * in different shapes, and a broadcasting bug that gives a wrong answer silently.
 */

type Op = "add" | "matmul" | "reshape";

const examples: { label: string; op: Op; a: string; b: string; note: string }[] = [
  { label: "Batch @ weights", op: "matmul", a: "64, 784", b: "784, 10", note: "64 flattened 28 × 28 images times a weight matrix: one row of 10 scores per image." },
  { label: "Weights the wrong way round", op: "matmul", a: "64, 784", b: "10, 784", note: "The weight matrix is stored as (outputs, inputs). Transpose it first: W.T has shape (784, 10)." },
  { label: "Add a bias to every row", op: "add", a: "64, 10", b: "10", note: "The bias (10,) is reused for each of the 64 rows." },
  { label: "Per-channel mean", op: "add", a: "32, 3, 28, 28", b: "3, 1, 1", note: "One value per colour channel, stretched over every image and every pixel." },
  { label: "Same, written as (3,)", op: "add", a: "32, 3, 28, 28", b: "3", note: "Aligned from the right, 3 meets the image width 28. Reshape to (3, 1, 1) first." },
  { label: "Column minus row", op: "add", a: "100, 1", b: "100", note: "No error — but the result is 100 × 100, not 100 values. A classic silent bug." },
  { label: "Flatten images", op: "reshape", a: "32, 3, 28, 28", b: "32, -1", note: "−1 means “work this size out”: 3 × 28 × 28 = 2,352 values per image." },
  { label: "Impossible reshape", op: "reshape", a: "32, 3, 28, 28", b: "32, 100", note: "Reshaping never adds or drops values: 75,264 cannot become 3,200." },
];

/** "3, 4" → [3, 4]; "" → [] (a single number). Returns null for anything else. */
function parseShape(text: string, allowMinusOne: boolean): Shape | null {
  const t = text.trim().replace(/^\(|\)$/g, "").trim();
  if (t === "") return [];
  const parts = t.split(/[,\s×x]+/).filter(Boolean);
  if (parts.length > 5) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isInteger(n) || n > 100000 || (n < 1 && !(allowMinusOne && n === -1)))) return null;
  return nums;
}

function ShapeInput({ label, value, onChange, valid, help }: { label: string; value: string; onChange: (v: string) => void; valid: boolean; help: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!valid}
        aria-describedby={`${id}-help`}
        spellCheck={false}
        className={cx(
          "mt-1.5 w-full rounded-control border bg-page px-3 py-2 font-mono text-sm",
          valid ? "border-line-strong" : "border-danger",
        )}
      />
      <p id={`${id}-help`} className={cx("mt-1 text-sm", valid ? "text-fg-muted" : "text-danger")}>
        {valid ? help : "Use whole numbers separated by commas, for example 3, 4."}
      </p>
    </div>
  );
}

function CalculatorPanel() {
  const [op, setOp] = useState<Op>("matmul");
  const [aText, setA] = useState("64, 784");
  const [bText, setB] = useState("784, 10");
  const [note, setNote] = useState(examples[0].note);

  const a = parseShape(aText, false);
  const b = parseShape(bText, op === "reshape");
  const result = a && b ? (op === "add" ? broadcast(a, b) : op === "matmul" ? matmul(a, b) : reshape(a, b)) : null;
  const cols = a && b && op === "add" ? broadcastColumns(a, b) : null;

  const code = op === "add" ? "a + b" : op === "matmul" ? "a @ b" : `a.reshape(${b ? b.join(", ") : "…"})`;

  return (
    <section aria-labelledby="sh-calc" className="space-y-5">
      <h3 id="sh-calc" className="font-semibold">
        1. Will these shapes work together?
      </h3>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <div>
          <p className="mb-2 text-sm font-semibold">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => {
                  setOp(ex.op);
                  setA(ex.a);
                  setB(ex.b);
                  setNote(ex.note);
                }}
                className={cx(
                  "rounded-control border px-3 py-1.5 text-sm",
                  ex.op === op && ex.a === aText && ex.b === bText ? "border-primary bg-mist font-semibold" : "border-line-strong text-fg-muted hover:text-fg",
                )}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
        <Segmented<Op>
          legend="Operation"
          value={op}
          onChange={(v) => {
            setOp(v);
            setNote("");
          }}
          options={[
            ["add", "a + b (elementwise)"],
            ["matmul", "a @ b (matrix product)"],
            ["reshape", "a.reshape(…)"],
          ]}
        />
        <div className="grid gap-5 @2xl:grid-cols-2">
          <ShapeInput
            label="Shape of a"
            value={aText}
            onChange={(v) => {
              setA(v);
              setNote("");
            }}
            valid={a !== null}
            help={a ? `${size(a).toLocaleString("en-US")} values` : ""}
          />
          <ShapeInput
            label={op === "reshape" ? "New shape (one entry may be −1)" : "Shape of b"}
            value={bText}
            onChange={(v) => {
              setB(v);
              setNote("");
            }}
            valid={b !== null}
            help={op === "reshape" ? "−1 means “work this size out”." : b ? `${size(b).toLocaleString("en-US")} values` : ""}
          />
        </div>
      </div>

      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          {cols ? (
            <div className="overflow-x-auto rounded-panel border border-line bg-surface p-4" tabIndex={0} role="region" aria-label="Broadcasting: dimensions aligned from the right">
              <table className="w-full border-collapse font-mono text-sm">
                <caption className="mb-2 text-left font-sans font-semibold">Line the shapes up from the right</caption>
                <tbody>
                  {(
                    [
                      ["a", cols.map((c) => c.a)],
                      ["b", cols.map((c) => c.b)],
                    ] as const
                  ).map(([name, vals]) => (
                    <tr key={name}>
                      <th scope="row" className="py-1 pr-3 text-left font-sans font-medium text-fg-muted">
                        {name}
                      </th>
                      {vals.map((v, i) => (
                        <td key={i} className={cx("px-2 py-1 text-center", cols[i].stretched === name && "text-highlight-text font-semibold")}>
                          {v === null ? "·" : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-line">
                    <th scope="row" className="py-1 pr-3 text-left font-sans font-medium text-fg-muted">
                      result
                    </th>
                    {cols.map((c, i) => (
                      <td key={i} className={cx("px-2 py-1 text-center", c.ok ? "" : "font-semibold text-danger")}>
                        {c.ok ? c.result : "✗"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <p className="mt-2 font-sans text-sm text-fg-muted">
                Each column must match, or contain a 1 (stretched to fit, shown highlighted). A missing entry (·) counts as 1.
              </p>
            </div>
          ) : op === "matmul" && a && b ? (
            <div className="rounded-panel border border-line bg-surface p-4 text-sm">
              <p className="font-semibold">The inner sizes must match</p>
              {a.length && b.length ? (
                <p className="math mt-2">
                  last size of a: {a[a.length - 1]}   ·   {b.length === 1 ? "size of b" : "second-to-last size of b"}: {b.length === 1 ? b[0] : b[b.length - 2]}
                </p>
              ) : null}
              <p className="mt-2 text-fg-muted">
                (n, k) @ (k, m) gives (n, m): each of the n rows of a is dotted with each of the m columns of b, so both must have length k. A 1-D operand loses its
                added axis afterwards, and any sizes before the last two are batch sizes that broadcast.
              </p>
            </div>
          ) : op === "reshape" && a ? (
            <div className="rounded-panel border border-line bg-surface p-4 text-sm">
              <p className="font-semibold">Reshape keeps every value</p>
              <p className="mt-2 text-fg-muted">
                a holds {size(a).toLocaleString("en-US")} values. The new shape must hold exactly the same number; −1 is filled in to make that true.
              </p>
            </div>
          ) : null}
          {note ? <p className="text-sm text-fg-muted">{note}</p> : null}
        </div>
        <div className="min-w-0 space-y-4">
          <div className="rounded-panel border border-line bg-sunken p-4">
            <p className="font-mono text-sm">
              <span className="text-fg-muted">&gt;&gt;&gt; </span>
              {code}
              {result?.ok ? <span className="text-fg-muted">.shape</span> : null}
            </p>
            <p aria-live="polite" className={cx("mt-2 font-mono text-sm", result && !result.ok ? "text-danger" : "")}>
              {!result ? "—" : result.ok ? showShape(result.shape) : result.error}
            </p>
          </div>
          {result ? (
            result.ok ? (
              <Stats
                columns={2}
                items={[
                  ["result shape", showShape(result.shape)],
                  ["number of values", size(result.shape).toLocaleString("en-US")],
                ]}
              />
            ) : (
              <Verdict tone="bad" title="NumPy refuses">
                The message above is the one NumPy 2 prints for these shapes. Reading which sizes it names is usually enough to find the bug.
              </Verdict>
            )
          ) : null}
          {result?.ok && op === "add" && a && b && size(result.shape) > Math.max(size(a), size(b)) ? (
            <Verdict tone="warn" title="Bigger than either input">
              Broadcasting stretched both arrays into a larger grid. That is right for a column-minus-row table, and a silent bug if you meant to subtract
              value by value.
            </Verdict>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const views = [
  { id: "flat", label: "(12,)", shape: [12], transposed: false },
  { id: "3x4", label: "(3, 4)", shape: [3, 4], transposed: false },
  { id: "4x3", label: "(4, 3)", shape: [4, 3], transposed: false },
  { id: "2x3x2", label: "(2, 3, 2)", shape: [2, 3, 2], transposed: false },
  { id: "t", label: "(3, 4) then .T", shape: [3, 4], transposed: true },
] as const;
type ViewId = (typeof views)[number]["id"];

function Cells({ values }: { values: number[] }) {
  return (
    <div className="flex gap-1">
      {values.map((v) => (
        <span
          key={v}
          className="grid size-9 place-items-center rounded-md border border-line-strong bg-surface font-mono text-sm"
          style={{ backgroundColor: `color-mix(in srgb, var(--dg-hl) ${Math.round((v / 11) * 22)}%, var(--color-surface))` }}
        >
          {v}
        </span>
      ))}
    </div>
  );
}

function ReshapePanel() {
  const [viewId, setView] = useState<ViewId>("3x4");
  const view = views.find((v) => v.id === viewId) ?? views[1];
  const base = arange([...view.shape]);
  const shown = view.transposed ? transpose(base, [3, 4], [1, 0]) : { values: base, shape: [...view.shape] };
  const values = shown.values as unknown;

  return (
    <section aria-labelledby="sh-reshape" className="space-y-5">
      <h3 id="sh-reshape" className="font-semibold">
        2. The same 12 numbers, five shapes
      </h3>
      <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented<ViewId> legend="np.arange(12) reshaped to" value={viewId} onChange={setView} options={views.map((v) => [v.id, v.label] as const)} />
      </div>
      <div className="grid gap-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 overflow-x-auto rounded-panel border border-line bg-sunken p-4" tabIndex={0} role="region" aria-label={`The numbers 0 to 11 arranged with shape ${showShape(shown.shape)}`}>
          <p className="mb-3 font-mono text-sm">shape {showShape(shown.shape)}</p>
          {shown.shape.length === 1 ? (
            <Cells values={values as number[]} />
          ) : shown.shape.length === 2 ? (
            <div className="space-y-1">
              {(values as number[][]).map((row, i) => (
                <Cells key={i} values={row} />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-5">
              {(values as number[][][]).map((block, i) => (
                <div key={i}>
                  <p className="mb-1 font-mono text-xs text-fg-muted">[{i}]</p>
                  <div className="space-y-1">
                    {block.map((row, j) => (
                      <Cells key={j} values={row} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <Verdict tone="neutral" title={view.transposed ? "Transpose is not reshape" : "Reshape keeps the order"}>
            {view.transposed
              ? "Transposing swaps rows and columns: 0, 4, 8 now share a row. A (4, 3) reshape has the same shape but different rows (0, 1, 2) — mixing the two up scrambles data without any error."
              : "NumPy fills the new shape row by row, in the same order the values are stored. The last axis changes fastest. Nothing is copied or moved; only how the numbers are grouped changes."}
          </Verdict>
        </div>
      </div>
    </section>
  );
}

const yTrue = [1, 2, 3, 4];
const yPred = [1.5, 2, 2.5, 4];

function BugPanel() {
  const [fixed, setFixed] = useState(false);
  const diffs = fixed ? [yPred.map((p, i) => p - yTrue[i])] : yPred.map((p) => yTrue.map((t) => p - t));
  const flat = diffs.flat();
  const mse = flat.reduce((s, d) => s + d * d, 0) / flat.length;
  return (
    <section aria-labelledby="sh-bug" className="space-y-5">
      <h3 id="sh-bug" className="font-semibold">
        3. A shape bug with no error message
      </h3>
      <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented<"bug" | "fix">
          legend="Compute the mean squared error with"
          value={fixed ? "fix" : "bug"}
          onChange={(v) => setFixed(v === "fix")}
          options={[
            ["bug", "y_pred of shape (4, 1)"],
            ["fix", "y_pred.ravel(), shape (4,)"],
          ]}
        />
      </div>
      <div className="grid gap-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 overflow-x-auto rounded-panel border border-line bg-sunken p-4" tabIndex={0} role="region" aria-label="The differences y_pred minus y_true">
          <p className="font-mono text-sm">y_true = [1, 2, 3, 4]   y_pred = [1.5, 2, 2.5, 4]</p>
          <p className="mb-3 mt-1 font-mono text-sm">
            (y_pred − y_true).shape = {fixed ? "(4,)" : "(4, 4)"}
          </p>
          <div className="space-y-1">
            {diffs.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map((d, j) => (
                  <span
                    key={j}
                    className={cx(
                      "grid h-9 w-12 place-items-center rounded-md border font-mono text-sm",
                      !fixed && i === j ? "border-success bg-surface font-semibold" : "border-line-strong bg-surface",
                    )}
                  >
                    {d}
                  </span>
                ))}
              </div>
            ))}
          </div>
          {!fixed ? <p className="mt-2 text-sm text-fg-muted">Only the diagonal (outlined) compares each prediction with its own target.</p> : null}
        </div>
        <div className="min-w-0 space-y-4">
          <Stats
            columns={2}
            items={[
              ["values averaged", String(flat.length)],
              ["mean squared error", mse.toFixed(3)],
            ]}
          />
          <Verdict tone={fixed ? "good" : "bad"} title={fixed ? "Correct: 0.125" : "Wrong, and no error: 2.125"}>
            {fixed
              ? "Four differences, one per example. Check the shape of every array before averaging it."
              : "A column (4, 1) minus a row (4,) broadcasts to a 4 × 4 table of every prediction minus every target. The average looks like a plausible number, which is why this bug survives."}
          </Verdict>
        </div>
      </div>
    </section>
  );
}

export function ShapesLab() {
  return (
    <div className="@container space-y-10">
      <CalculatorPanel />
      <ReshapePanel />
      <BugPanel />
      <p className="text-sm text-fg-faint">
        Shapes and error messages follow NumPy 2; the tests check them against output captured from NumPy for 62 cases.
      </p>
    </div>
  );
}
