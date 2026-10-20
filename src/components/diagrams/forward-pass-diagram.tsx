"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { cx } from "@/lib/cx";

/*
 * Hero diagram: a 3-4-2 network the learner steps through.
 * It is an illustration with example values — no model runs here.
 */

const R = 19;
const layers = {
  input: { x: 112, ys: [138, 214, 290], values: ["0.8", "0.1", "0.5"] },
  hidden: { x: 300, ys: [100, 176, 252, 328], values: ["1.2", "0", "0.4", "0.9"] },
  output: { x: 474, ys: [176, 252], values: ["0.82", "0.18"], names: ["class A", "class B"] },
};

const stages = [
  {
    title: "Inputs arrive as numbers",
    body: "Each input node holds one feature value. Whatever the raw data was — pixels, words, table columns — it reaches the network as numbers like these.",
  },
  {
    title: "Weighted sums",
    body: "Every connection multiplies its input by a weight. Each hidden unit adds up everything it receives, plus a bias of its own.",
  },
  {
    title: "Activation",
    body: "ReLU passes positive sums through and turns negative ones into 0 — the second unit is off for this input. Without a nonlinearity, stacked layers would collapse into a single linear function.",
  },
  {
    title: "Prediction",
    body: "The output layer combines the hidden values into one score per class, and softmax turns those scores into probabilities that add up to 1.",
  },
  {
    title: "Learning",
    body: "During training the prediction is compared with the correct label. Backpropagation sends that error backward, and every weight moves a small step in the direction that reduces it.",
  },
] as const;

type Stage = -1 | 0 | 1 | 2 | 3 | 4;

function Edge({ x1, y1, x2, y2, state }: { x1: number; y1: number; x2: number; y2: number; state: "idle" | "on" | "back" }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className="transition-[stroke,opacity] duration-200"
      stroke={state === "idle" ? "var(--color-line-strong)" : "var(--color-accent)"}
      strokeWidth={state === "idle" ? 1.25 : 1.75}
      strokeDasharray={state === "back" ? "5 5" : undefined}
      opacity={state === "idle" ? 0.85 : 1}
    />
  );
}

function Node({
  x,
  y,
  value,
  on,
  dim,
}: {
  x: number;
  y: number;
  value?: string;
  on: boolean;
  dim?: boolean;
}) {
  return (
    <g className="transition-opacity duration-200" opacity={dim ? 0.55 : 1}>
      <circle
        cx={x}
        cy={y}
        r={R}
        fill="var(--color-board-deep)"
        stroke={on ? "var(--color-accent)" : "var(--color-chalk)"}
        strokeWidth={on ? 2.5 : 1.5}
        className="transition-[stroke] duration-200"
      />
      {value !== undefined ? (
        <text x={x} y={y + 4.5} textAnchor="middle" className="dg-mono fp-value">
          {value}
        </text>
      ) : null}
    </g>
  );
}

export function ForwardPassDiagram() {
  const [stage, setStage] = useState<Stage>(-1);
  const { input, hidden, output } = layers;

  const inHidState = stage === 1 ? "on" : stage === 4 ? "back" : "idle";
  const hidOutState = stage === 3 ? "on" : stage === 4 ? "back" : "idle";
  const current = stage === -1 ? null : stages[stage as 0 | 1 | 2 | 3 | 4];

  return (
    <figure className="rounded-panel border border-line bg-board-deep">
      <svg
        viewBox="0 0 600 420"
        className="block h-auto w-full"
        role="img"
        aria-label="A small neural network: three input nodes, four hidden units and two output nodes, every node connected to every node in the next layer."
      >
        <text x={input.x} y={58} textAnchor="middle" className="dg-label fp-text">
          Inputs
        </text>
        <text x={hidden.x} y={58} textAnchor="middle" className="dg-label fp-text">
          Hidden (ReLU)
        </text>
        <text x={output.x} y={58} textAnchor="middle" className="dg-label fp-text">
          Output (softmax)
        </text>

        {input.ys.map((y1) =>
          hidden.ys.map((y2) => (
            <Edge key={`ih-${y1}-${y2}`} x1={input.x} y1={y1} x2={hidden.x} y2={y2} state={inHidState} />
          )),
        )}
        {hidden.ys.map((y1) =>
          output.ys.map((y2) => (
            <Edge key={`ho-${y1}-${y2}`} x1={hidden.x} y1={y1} x2={output.x} y2={y2} state={hidOutState} />
          )),
        )}

        {input.ys.map((y, i) => (
          <Node key={`i-${y}`} x={input.x} y={y} on={stage === 0} value={stage >= 0 ? input.values[i] : undefined} />
        ))}
        {hidden.ys.map((y, i) => (
          <Node
            key={`h-${y}`}
            x={hidden.x}
            y={y}
            on={stage === 2}
            dim={stage >= 2 && hidden.values[i] === "0"}
            value={stage >= 2 ? hidden.values[i] : undefined}
          />
        ))}
        {output.ys.map((y, i) => (
          <g key={`o-${y}`}>
            <Node x={output.x} y={y} on={stage === 3} value={stage >= 3 ? output.values[i] : undefined} />
            <text x={output.x + R + 10} y={y + 4.5} className="dg-label fp-text">
              {output.names[i]}
            </text>
          </g>
        ))}

        {stage === 4 ? (
          <g>
            <defs>
              <marker id="fp-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="var(--color-accent)" />
              </marker>
            </defs>
            <line
              x1={output.x}
              y1={382}
              x2={input.x}
              y2={382}
              stroke="var(--color-accent)"
              strokeWidth={2}
              markerEnd="url(#fp-arrow)"
            />
            <text x={(input.x + output.x) / 2} y={408} textAnchor="middle" className="dg-label fp-text">
              error flows backward to every weight
            </text>
          </g>
        ) : null}
      </svg>

      <figcaption className="border-t border-line p-5 sm:p-6">
        <div aria-live="polite" className="min-h-[7.5rem] sm:min-h-[6.5rem]">
          {current ? (
            <>
              <p className="font-bold text-chalk">
                Step {stage + 1} of {stages.length}: {current.title}
              </p>
              <p className="mt-1.5 text-chalk-muted">{current.body}</p>
            </>
          ) : (
            <>
              <p className="font-bold text-chalk">A small neural network</p>
              <p className="mt-1.5 text-chalk-muted">
                Three inputs, four hidden units, two outputs. Step through it to see what happens between data going in
                and a prediction coming out.
              </p>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {stage === -1 ? (
            <button type="button" className={buttonStyles("secondary")} onClick={() => setStage(0)}>
              Step through a forward pass
              <ChevronRight aria-hidden className="size-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                className={buttonStyles("secondary", "px-3")}
                onClick={() => setStage((s) => (s > 0 ? ((s - 1) as Stage) : s))}
                disabled={stage === 0}
              >
                <ChevronLeft aria-hidden className="size-4" />
                Back
              </button>
              <ol className="flex gap-1.5" aria-label="Steps">
                {stages.map((s, i) => (
                  <li key={s.title}>
                    <button
                      type="button"
                      aria-label={`Step ${i + 1}: ${s.title}`}
                      aria-current={stage === i ? "step" : undefined}
                      onClick={() => setStage(i as Stage)}
                      className={cx(
                        "grid size-9 place-items-center rounded-full border text-sm font-bold transition-colors duration-150",
                        stage === i
                          ? "border-accent bg-accent text-board"
                          : "border-line-strong text-chalk-muted hover:border-chalk hover:text-chalk",
                      )}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ol>
              {stage < stages.length - 1 ? (
                <button
                  type="button"
                  className={buttonStyles("secondary", "px-3")}
                  onClick={() => setStage((s) => (s + 1) as Stage)}
                >
                  Next
                  <ChevronRight aria-hidden className="size-4" />
                </button>
              ) : (
                <button type="button" className={buttonStyles("secondary", "px-3")} onClick={() => setStage(-1)}>
                  <RotateCcw aria-hidden className="size-4" />
                  Start over
                </button>
              )}
            </>
          )}
        </div>
        <p className="mt-4 text-sm text-chalk-faint">Illustration with example values. No model is running.</p>
      </figcaption>
    </figure>
  );
}
