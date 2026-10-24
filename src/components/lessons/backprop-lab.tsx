"use client";

import { useState } from "react";

import { chainGradients, cloneTiny, tinyFiniteDiff, tinyInput, tinyLabel, tinyParamList, tinyPass, tinyStart, tinyStep, type TinyParams } from "@/lib/backprop";
import { type Activation, activations } from "@/lib/nn";
import { buttonStyles } from "@/components/ui/button";

import { ChartFrame, LegendItem, Segmented, Stats, StepSlider, Verdict, ticks } from "./lab-ui";

/*
 * Two panels for "Backpropagation". The first runs a forward and backward pass through a
 * 2 → 2 → 1 network on one example, checks every gradient against a finite difference,
 * and takes gradient steps. The second multiplies local slopes through a deep chain of
 * one-unit layers to show gradients vanishing or exploding.
 */

const n3 = (v: number) => (Object.is(Math.round(v * 1000) / 1000, -0) ? 0 : v).toFixed(3).replace("-", "−");
const n6 = (v: number) => (Object.is(Math.round(v * 1e6) / 1e6, -0) ? 0 : v).toFixed(6).replace("-", "−");
const INPUTS = ticks(-2, 2, 0.5);
const LRS = [0.1, 0.5, 1, 2, 5];

function Node({ x, y, title, lines, strong }: { x: number; y: number; title: string; lines: string[]; strong?: boolean }) {
  const w = 128;
  const h = 26 + lines.length * 17;
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={8} fill="var(--color-surface)" stroke={strong ? "var(--color-primary)" : "var(--color-line-strong)"} strokeWidth={strong ? 2 : 1.25} />
      <text x={x} y={y - h / 2 + 18} textAnchor="middle" className="dg-label" fontWeight={600}>
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={l} x={x} y={y - h / 2 + 36 + i * 17} textAnchor="middle" className="dg-label" fontFamily="var(--font-mono)">
          {l}
        </text>
      ))}
    </g>
  );
}

type Pt = readonly [number, number];
type Anchor = "start" | "middle" | "end";

/**
 * The 2 → 2 → 1 network as a diagram: left to right when there is room ("wide"), top to
 * bottom on narrow screens ("tall"), so a phone never has to scroll sideways to read it.
 */
function NetDiagram({
  layout,
  back,
  params,
  r,
  x,
  wLabel,
}: {
  layout: "wide" | "tall";
  back: boolean;
  params: TinyParams;
  r: ReturnType<typeof tinyPass>;
  x: [number, number];
  wLabel: (v: number, g: number) => string;
}) {
  const wide = layout === "wide";
  const W = wide ? 640 : 360;
  const H = wide ? 300 : 440;
  const P = wide
    ? { x1: [70, 80], x2: [70, 220], h1: [300, 80], h2: [300, 220], o: [500, 150] }
    : { x1: [90, 40], x2: [270, 40], h1: [90, 200], h2: [270, 200], o: [180, 350] };
  const half = { x: 21.5, h: 30, o: 30 };
  // Where an edge leaves its source and reaches its target.
  const ends = (from: number[], to: number[], fromH: number, toH: number): [Pt, Pt] =>
    wide
      ? [
          [from[0] + 64, from[1]],
          [to[0] - 64, to[1]],
        ]
      : [
          [from[0], from[1] + fromH],
          [to[0], to[1] - toH],
        ];
  const along = ([a, b]: [Pt, Pt], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const stroke = back ? "var(--color-highlight)" : "var(--color-line-strong)";
  const edge = (key: string, seg: [Pt, Pt], t: number, dx: number, dy: number, anchor: Anchor, text: string) => {
    const [lx, ly] = along(seg, t);
    return (
      <g key={key}>
        <line x1={seg[0][0]} y1={seg[0][1]} x2={seg[1][0]} y2={seg[1][1]} stroke={stroke} strokeWidth={1.5} />
        <text x={lx + dx} y={ly + dy} textAnchor={anchor} className="dg-label" fontFamily="var(--font-mono)" fill={back ? "var(--color-highlight-text)" : undefined}>
          {text}
        </text>
      </g>
    );
  };
  const sA = ends(P.x1, P.h1, half.x, half.h);
  const sB = ends(P.x1, P.h2, half.x, half.h);
  const sC = ends(P.x2, P.h1, half.x, half.h);
  const sD = ends(P.x2, P.h2, half.x, half.h);
  const sE = ends(P.h1, P.o, half.h, half.o);
  const sF = ends(P.h2, P.o, half.h, half.o);
  const w = (i: number, j: number) => wLabel(params.W1[i][j], r.grads.W1[i][j]);
  const v = (i: number) => wLabel(params.W2[i][0], r.grads.W2[i][0]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={wide ? "mx-auto hidden h-auto w-full max-w-[760px] @xl:block" : "mx-auto block h-auto w-full max-w-[420px]"}
      role="img"
      aria-label={back ? `Gradients: ∂L/∂z at the output is ${n3(r.dzo)}.` : `Forward pass: prediction ${n3(r.yhat)}, loss ${n3(r.loss)}.`}
    >
      {wide ? (
        <>
          {edge("a", sA, 0.3, 0, -6, "middle", w(0, 0))}
          {edge("b", sB, 0.22, 0, 16, "middle", w(0, 1))}
          {edge("c", sC, 0.22, 0, -4, "middle", w(1, 0))}
          {edge("d", sD, 0.3, 0, 16, "middle", w(1, 1))}
          {edge("e", sE, 0.45, 22, -8, "middle", v(0))}
          {edge("f", sF, 0.45, 22, 20, "middle", v(1))}
          <line x1={P.o[0] + 64} y1={P.o[1]} x2={W - 8} y2={P.o[1]} stroke="var(--color-line-strong)" strokeWidth={1.5} />
          <text x={W - 8} y={P.o[1] - 10} textAnchor="end" className="dg-label" fontWeight={600}>
            L = {n3(r.loss)}
          </text>
        </>
      ) : (
        <>
          {edge("a", sA, 0.5, -8, 4, "end", w(0, 0))}
          {edge("b", sB, 0.3, 8, -6, "start", w(0, 1))}
          {edge("c", sC, 0.75, 8, 4, "start", w(1, 0))}
          {edge("d", sD, 0.5, 8, 4, "start", w(1, 1))}
          {edge("e", sE, 0.5, -10, 4, "end", v(0))}
          {edge("f", sF, 0.5, 10, 4, "start", v(1))}
          <line x1={P.o[0]} y1={P.o[1] + half.o} x2={P.o[0]} y2={P.o[1] + half.o + 26} stroke="var(--color-line-strong)" strokeWidth={1.5} />
          <text x={P.o[0]} y={H - 12} textAnchor="middle" className="dg-label" fontWeight={600}>
            L = {n3(r.loss)}
          </text>
        </>
      )}
      <Node x={P.x1[0]} y={P.x1[1]} title="input x₁" lines={[n3(x[0])]} />
      <Node x={P.x2[0]} y={P.x2[1]} title="input x₂" lines={[n3(x[1])]} />
      <Node
        x={P.h1[0]}
        y={P.h1[1]}
        title="hidden h₁"
        strong={back}
        lines={back ? [`∂L/∂h = ${n3(r.dh[0])}`, `∂L/∂z = ${n3(r.dzh[0])}`] : [`z = ${n3(r.zh[0])}`, `h = σ(z) = ${n3(r.h[0])}`]}
      />
      <Node
        x={P.h2[0]}
        y={P.h2[1]}
        title="hidden h₂"
        strong={back}
        lines={back ? [`∂L/∂h = ${n3(r.dh[1])}`, `∂L/∂z = ${n3(r.dzh[1])}`] : [`z = ${n3(r.zh[1])}`, `h = σ(z) = ${n3(r.h[1])}`]}
      />
      <Node x={P.o[0]} y={P.o[1]} title="output ŷ" strong={back} lines={back ? [`∂L/∂z = ŷ − y`, `= ${n3(r.dzo)}`] : [`z = ${n3(r.zo)}`, `ŷ = σ(z) = ${n3(r.yhat)}`]} />
    </svg>
  );
}

function TinyNetPanel() {
  const [params, setParams] = useState<TinyParams>(() => cloneTiny(tinyStart));
  const [x, setX] = useState<[number, number]>(tinyInput);
  const [label, setLabel] = useState<"1" | "0">(String(tinyLabel) as "1");
  const [view, setView] = useState<"forward" | "backward">("forward");
  const [lri, setLri] = useState(LRS.indexOf(0.5));
  const [history, setHistory] = useState<number[]>([]);
  const y = Number(label);
  const lr = LRS[lri];
  const r = tinyPass(params, x, y);
  const fd = tinyParamList.map((_, k) => tinyFiniteDiff(params, x, y, k));
  const maxGap = Math.max(...tinyParamList.map((p, k) => Math.abs(p.get(r.grads) - fd[k])));
  const next = tinyStep(params, r.grads, lr);
  const nextLoss = tinyPass(next, x, y).loss;
  const reset = () => {
    setParams(cloneTiny(tinyStart));
    setHistory([]);
  };
  const changeInput = (fn: () => void) => {
    fn();
    setHistory([]);
  };

  const back = view === "backward";
  const wLabel = (v: number, g: number) => (back ? n3(g) : n3(v));

  return (
    <section aria-labelledby="bp-tiny" className="space-y-5">
      <h3 id="bp-tiny" className="font-semibold">
        1. Forward, backward, step
      </h3>
      <p className="text-sm text-fg-muted">
        Two inputs, two sigmoid hidden units, one sigmoid output, binary cross-entropy loss, one training example. Backpropagation gives every gradient in one
        backward sweep; the table checks each against a finite difference.
      </p>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <div className="grid gap-5 @2xl:grid-cols-3">
          <StepSlider label="Input x₁" values={INPUTS} index={INPUTS.indexOf(x[0])} onChange={(i) => changeInput(() => setX([INPUTS[i], x[1]]))} format={n3} />
          <StepSlider label="Input x₂" values={INPUTS} index={INPUTS.indexOf(x[1])} onChange={(i) => changeInput(() => setX([x[0], INPUTS[i]]))} format={n3} />
          <Segmented legend="Target y" value={label} onChange={(v) => changeInput(() => setLabel(v))} options={[["1", "1"], ["0", "0"]]} />
        </div>
        <div className="grid gap-5 @2xl:grid-cols-[auto_minmax(0,1fr)_auto] @2xl:items-end">
          <Segmented legend="Show" value={view} onChange={setView} options={[["forward", "Forward: values"], ["backward", "Backward: gradients"]]} />
          <StepSlider label="Learning rate η" values={LRS} index={lri} onChange={setLri} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonStyles("primary", "px-3 py-2")}
              onClick={() => {
                setHistory([...(history.length ? history : [r.loss]), nextLoss]);
                setParams(next);
              }}
            >
              Take one step
            </button>
            <button type="button" className={buttonStyles("secondary", "px-3 py-2")} onClick={reset}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <ChartFrame
        label={back ? "Diagram: the network with the gradient of the loss at every node and weight" : "Diagram: the network with every value of the forward pass"}
        legend={
          back ? (
            <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-highlight)" strokeWidth="2" />}>numbers on lines are ∂L/∂weight</LegendItem>
          ) : (
            <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-line-strong)" strokeWidth="2" />}>numbers on lines are weights</LegendItem>
          )
        }
      >
        <NetDiagram layout="wide" back={back} params={params} r={r} x={x} wLabel={wLabel} />
        <div className="@xl:hidden">
          <NetDiagram layout="tall" back={back} params={params} r={r} x={x} wLabel={wLabel} />
        </div>
      </ChartFrame>

      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="overflow-x-auto rounded-panel border border-line bg-surface">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">Every parameter, its gradient by backpropagation and by finite difference, and its value after one step</caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="px-3 py-2 font-semibold">
                  Parameter
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  Value
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  ∂L/∂ (backprop)
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  finite difference
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  after a step
                </th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {tinyParamList.map((p, k) => (
                <tr key={p.name} className="border-b border-line last:border-0">
                  <th scope="row" className="px-3 py-1.5 text-left font-sans font-semibold">
                    {p.name}
                  </th>
                  <td className="px-3 py-1.5 text-right">{n3(p.get(params))}</td>
                  <td className="px-3 py-1.5 text-right">{n6(p.get(r.grads))}</td>
                  <td className="px-3 py-1.5 text-right">{n6(fd[k])}</td>
                  <td className="px-3 py-1.5 text-right">{n3(p.get(next))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="min-w-0 space-y-4">
          <Stats
            columns={2}
            items={[
              ["loss now", n3(r.loss)],
              ["loss after one step", n3(nextLoss)],
              ["prediction ŷ", n3(r.yhat)],
              ["steps taken", String(Math.max(0, history.length - 1))],
            ]}
          />
          <Verdict tone={maxGap < 1e-6 ? "good" : "warn"} title={maxGap < 1e-6 ? "All nine gradients match the finite differences" : "A gradient disagrees with its finite difference"}>
            Largest gap: {maxGap.toExponential(1)}. One backward pass gave all nine; the finite differences needed two extra forward passes per parameter.
            {history.length > 1 ? ` Loss so far: ${history.map(n3).join(" → ")}.` : ""}
          </Verdict>
        </div>
      </div>
    </section>
  );
}

const CHAIN_ACTS: Activation[] = ["sigmoid", "tanh", "relu"];
const WEIGHTS = [0.5, 1, 2, 4];
const DEPTHS = [2, 5, 10, 20, 30];

function ChainPanel() {
  const [act, setAct] = useState<Activation>("sigmoid");
  const [wi, setWi] = useState(1);
  const [di, setDi] = useState(2);
  const w = WEIGHTS[wi];
  const depth = DEPTHS[di];
  const { outputs, grads } = chainGradients(depth, act, w);
  const logs = grads.map((g) => Math.log10(Math.max(g, 1e-300)));
  const lo = Math.min(-2, Math.floor(Math.min(...logs)));
  const hi = Math.max(1, Math.ceil(Math.max(...logs)));
  const step = Math.max(1, Math.ceil((hi - lo) / 7));
  const W = 560;
  const H = 260;
  const pad = { l: 56, r: 16, t: 20, b: 36 };
  const bw = (W - pad.l - pad.r) / depth;
  const sy = (v: number) => H - pad.b - ((v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const first = grads[0];
  const last = grads[depth - 1];
  const ratio = first / last;

  const verdict =
    Math.max(first, last) > 10
      ? { tone: "bad" as const, title: "Exploding: the gradients are huge", text: `With weight ${w}, each ReLU layer multiplies the signal and the gradient by ${w}. Updates this large would throw the weights far away: this is why initial weights are scaled to the layer size.` }
      : ratio < 1e-3
        ? {
            tone: "bad" as const,
            title: `Vanishing: layer 1’s gradient is ${ratio.toExponential(1)} × the last layer’s`,
            text: `Each layer multiplies the gradient by w × φ′(z). ${act === "sigmoid" ? "Sigmoid’s slope is at most 0.25, so" : "Here the slope is small enough that"} the early layers barely learn while the late ones do.`,
          }
        : last < 1e-2
          ? { tone: "warn" as const, title: "Every gradient is tiny", text: `With weight ${w} below 1, every layer shrinks the signal and the gradient alike. The layers stay balanced but all learn slowly.` }
          : { tone: "good" as const, title: "Gradients reach the first layer", text: `Layer 1 gets ${ratio >= 0.999 && ratio <= 1.001 ? "the same gradient as" : `${ratio.toFixed(2)} ×`} the last layer’s.` };

  return (
    <section aria-labelledby="bp-chain" className="space-y-5">
      <h3 id="bp-chain" className="font-semibold">
        2. Gradients through many layers
      </h3>
      <p className="text-sm text-fg-muted">
        A deep, narrow network: one unit per layer, every weight equal to w, input 1. Backpropagation multiplies one local slope per layer, so the bars show how
        strongly the final output responds to each layer’s weight.
      </p>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented legend="Activation" value={act} onChange={setAct} options={CHAIN_ACTS.map((a) => [a, activations[a].label] as const)} />
        <div className="grid gap-5 @2xl:grid-cols-2">
          <StepSlider label="Weight w in every layer" values={WEIGHTS} index={wi} onChange={setWi} />
          <StepSlider label="Depth (layers)" values={DEPTHS} index={di} onChange={setDi} />
        </div>
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <ChartFrame label="Chart: size of the gradient for each layer’s weight, logarithmic scale">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Gradient sizes from layer 1 (${first.toExponential(1)}) to layer ${depth} (${last.toExponential(1)}).`}>
            {ticks(lo, hi, step).map((e) => (
              <g key={e}>
                <line x1={pad.l} x2={W - pad.r} y1={sy(e)} y2={sy(e)} className="dg-grid" />
                <text x={pad.l - 8} y={sy(e) + 4} textAnchor="end" className="dg-label">
                  {e === 0 ? "1" : `1e${e}`}
                </text>
              </g>
            ))}
            {logs.map((v, i) => (
              <rect key={i} x={pad.l + i * bw + bw * 0.15} y={sy(v)} width={bw * 0.7} height={Math.max(0, sy(lo) - sy(v))} fill="var(--dg-hl)" fillOpacity={0.75} />
            ))}
            {[1, depth].map((l) => (
              <text key={l} x={pad.l + (l - 0.5) * bw} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                {l === 1 ? "layer 1" : `layer ${l}`}
              </text>
            ))}
            <text x={pad.l} y={12} className="dg-label">
              |∂ output / ∂ wₗ|
            </text>
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            columns={2}
            items={[
              ["layer 1 gradient", first.toExponential(2)],
              [`layer ${depth} gradient`, last.toExponential(2)],
              ["ratio, first ÷ last", ratio.toExponential(2)],
              ["final output", outputs[depth - 1].toExponential(2)],
            ]}
          />
          <Verdict tone={verdict.tone} title={verdict.title}>
            {verdict.text}
          </Verdict>
        </div>
      </div>
      <p className="text-sm text-fg-faint">A one-unit-per-layer chain keeps the arithmetic visible; wide networks show the same effect on average.</p>
    </section>
  );
}

export function BackpropLab() {
  return (
    <div className="@container space-y-10">
      <TinyNetPanel />
      <ChainPanel />
    </div>
  );
}
