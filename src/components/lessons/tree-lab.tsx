"use client";

import { useMemo, useState } from "react";

import { plantRule, plantsTrain, plantsValidation } from "@/content/datasets/plants";
import {
  accuracyOf,
  countLeaves,
  fitForest,
  fitTree,
  forestPredict,
  forestProba,
  tracePath,
  treePredict,
  treeProba,
  type TreeNode,
} from "@/lib/tree";

import { ChartFrame, Checkbox, LegendItem, Segmented, Stats, StepSlider, Verdict, pct, ticks } from "./lab-ui";

/*
 * A classification tree of any depth from 1 to 10, or a random forest of 100
 * full-depth trees, trained in the browser on 200 plants and checked on 200 more.
 * The shaded region is what the model predicts; the trace shows the questions the
 * tree asks for one plant.
 */

type ModelKind = "tree" | "forest";

const X = plantsTrain.map((p) => [p.light, p.water]);
const y = plantsTrain.map((p) => p.thrives);
const VX = plantsValidation.map((p) => [p.light, p.water]);
const vy = plantsValidation.map((p) => p.thrives);

const FOREST_TREES = 100;
const FOREST_SEED = 1;
const DEPTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const featureName = ["light", "water"];
const featureUnit = ["h", "cups"];

const W = 560;
const H = 400;
const pad = { l: 48, r: 16, t: 30, b: 44 };
const L_MIN = 1;
const L_MAX = 13;
const W_MAX = 10;
const sx = (v: number) => pad.l + ((v - L_MIN) / (L_MAX - L_MIN)) * (W - pad.l - pad.r);
const sy = (v: number) => H - pad.b - (v / W_MAX) * (H - pad.t - pad.b);
const GRID_X = 120;
const GRID_Y = 100;

/** Shaded "predicted to thrive" cells, merged into horizontal runs. */
function regionRuns(predict: (x: number[]) => number) {
  const runs: { x: number; y: number; w: number; h: number }[] = [];
  const cw = (L_MAX - L_MIN) / GRID_X;
  const ch = W_MAX / GRID_Y;
  for (let j = 0; j < GRID_Y; j++) {
    const water = (j + 0.5) * ch;
    let start = -1;
    for (let i = 0; i <= GRID_X; i++) {
      const on = i < GRID_X && predict([L_MIN + (i + 0.5) * cw, water]) === 1;
      if (on && start < 0) start = i;
      if (!on && start >= 0) {
        const x0 = sx(L_MIN + start * cw);
        const x1 = sx(L_MIN + i * cw);
        runs.push({ x: x0, y: sy((j + 1) * ch), w: x1 - x0, h: sy(j * ch) - sy((j + 1) * ch) });
        start = -1;
      }
    }
  }
  return runs;
}

const trees = DEPTHS.map((d) => fitTree(X, y, { maxDepth: d }));
const treeScores = trees.map((t) => ({
  train: accuracyOf((x) => treePredict(t, x), X, y),
  val: accuracyOf((x) => treePredict(t, x), VX, vy),
}));

function AccuracyChart({ depth, forestVal, kind }: { depth: number; forestVal: number | null; kind: ModelKind }) {
  const CW = 560;
  const CH = 250;
  const p = { l: 48, r: 16, t: 28, b: 40 };
  const cx = (d: number) => p.l + ((d - 1) / 9) * (CW - p.l - p.r);
  const cy = (v: number) => CH - p.b - ((v - 0.5) / 0.5) * (CH - p.t - p.b);
  const line = (vals: number[]) => vals.map((v, i) => `${i === 0 ? "M" : "L"}${cx(i + 1).toFixed(1)} ${cy(v).toFixed(1)}`).join(" ");
  const bestVal = Math.max(...treeScores.map((s) => s.val));
  return (
    <svg
      viewBox={`0 0 ${CW} ${CH}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Training and validation accuracy of a single tree for depths 1 to 10. Validation accuracy peaks at ${pct(bestVal)}.${forestVal !== null ? ` The forest scores ${pct(forestVal)}.` : ""}`}
    >
      {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((t) => (
        <g key={t}>
          <line x1={p.l} x2={CW - p.r} y1={cy(t)} y2={cy(t)} className="dg-grid" />
          <text x={p.l - 8} y={cy(t) + 4} textAnchor="end" className="dg-label">
            {Math.round(t * 100)}%
          </text>
        </g>
      ))}
      {DEPTHS.map((d) => (
        <text
          key={d}
          x={cx(d)}
          y={CH - p.b + 18}
          textAnchor="middle"
          className="dg-label"
          style={kind === "tree" && d === depth ? { fontWeight: 700, fill: "var(--color-fg)" } : undefined}
        >
          {d}
        </text>
      ))}
      <text x={CW - p.r} y={CH - 4} textAnchor="end" className="dg-label">
        maximum tree depth
      </text>
      <text x={p.l} y={14} className="dg-label">
        accuracy
      </text>
      {kind === "tree" ? <line x1={cx(depth)} x2={cx(depth)} y1={p.t} y2={CH - p.b} stroke="var(--color-line-strong)" /> : null}
      {forestVal !== null ? (
        <line x1={p.l} x2={CW - p.r} y1={cy(forestVal)} y2={cy(forestVal)} stroke="var(--color-success)" strokeWidth={2.5} strokeDasharray="2 4" />
      ) : null}
      <path d={line(treeScores.map((s) => s.train))} fill="none" stroke="var(--dg-ink)" strokeWidth={2.25} />
      <path d={line(treeScores.map((s) => s.val))} fill="none" stroke="var(--color-highlight)" strokeWidth={2.5} strokeDasharray="7 4" />
      {treeScores.map((s, i) => (
        <g key={i}>
          <circle cx={cx(i + 1)} cy={cy(s.train)} r={kind === "tree" && i + 1 === depth ? 5 : 3} fill="var(--dg-ink)" />
          <circle
            cx={cx(i + 1)}
            cy={cy(s.val)}
            r={kind === "tree" && i + 1 === depth ? 5.5 : 3.5}
            fill="var(--color-surface)"
            stroke="var(--color-highlight)"
            strokeWidth={2}
          />
        </g>
      ))}
    </svg>
  );
}

export function TreeLab() {
  const [kind, setKind] = useState<ModelKind>("tree");
  const [depthIndex, setDepthIndex] = useState(2);
  const [showVal, setShowVal] = useState(false);
  const [showRule, setShowRule] = useState(false);
  const [lightIndex, setLightIndex] = useState(14);
  const [waterIndex, setWaterIndex] = useState(8);

  const depth = DEPTHS[depthIndex];
  const tree: TreeNode = trees[depthIndex];
  const forest = useMemo(() => (kind === "forest" ? fitForest(X, y, FOREST_TREES, FOREST_SEED) : null), [kind]);

  const lightValues = useMemo(() => ticks(1, 13, 0.5), []);
  const waterValues = useMemo(() => ticks(0, 10, 0.5), []);
  const query = [lightValues[lightIndex], waterValues[waterIndex]];

  const predict = useMemo(() => (forest ? (x: number[]) => forestPredict(forest, x) : (x: number[]) => treePredict(tree, x)), [forest, tree]);
  const runs = useMemo(() => regionRuns(predict), [predict]);
  const trainAcc = forest ? accuracyOf(predict, X, y) : treeScores[depthIndex].train;
  const valAcc = forest ? accuracyOf(predict, VX, vy) : treeScores[depthIndex].val;
  const forestVal = useMemo(() => (forest ? accuracyOf((x) => forestPredict(forest, x), VX, vy) : null), [forest]);

  const trace = tracePath(tree, query);
  const leafN = trace.leaf.counts[0] + trace.leaf.counts[1];
  const votes = forest ? forest.filter((t) => treePredict(t, query) === 1).length : 0;
  const queryP = forest ? forestProba(forest, query) : treeProba(tree, query);

  const bestDepth = DEPTHS[treeScores.map((s) => s.val).indexOf(Math.max(...treeScores.map((s) => s.val)))];
  const gap = trainAcc - valAcc;

  return (
    <div className="@container space-y-6">
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented<ModelKind>
          legend="Model"
          value={kind}
          onChange={setKind}
          options={[
            ["tree", "One decision tree"],
            ["forest", `Random forest (${FOREST_TREES} trees)`],
          ]}
        />
        <div className="grid gap-5 @2xl:grid-cols-2">
          {kind === "tree" ? (
            <StepSlider
              label="Maximum depth (questions per prediction)"
              values={DEPTHS}
              index={depthIndex}
              onChange={setDepthIndex}
              help={depth === 10 ? "At depth 10 this tree cannot split any further." : `A depth-${depth} tree asks at most ${depth} question${depth > 1 ? "s" : ""}.`}
            />
          ) : (
            <p className="text-sm text-fg-muted">
              Each tree in the forest grows to full depth on a bootstrap sample of the 200 plants, choosing from one random feature at each split. The forest
              averages their predictions.
            </p>
          )}
          <div className="space-y-3">
            <Checkbox checked={showVal} onChange={setShowVal} label="Show the 200 validation plants" help="Not used for training; used to score each model." />
            <Checkbox checked={showRule} onChange={setShowRule} label="Show the rule the data came from" help="Before 8% of labels were flipped. You never see this in real data." />
          </div>
        </div>
      </div>

      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <ChartFrame
            label="Chart: plants by light and water, with the region the model predicts as thriving"
            legend={
              <>
                <LegendItem swatch={<rect x="1" y="1" width="18" height="12" fill="var(--dg-hl)" fillOpacity="0.22" />}>predicted to thrive</LegendItem>
                <LegendItem swatch={<circle cx="10" cy="7" r="4.5" fill="var(--dg-ink)" />}>thrived</LegendItem>
                <LegendItem swatch={<circle cx="10" cy="7" r="4.5" fill="none" stroke="var(--dg-ink)" strokeWidth="1.75" />}>did not</LegendItem>
                {showVal ? (
                  <LegendItem swatch={<rect x="6" y="3" width="8" height="8" transform="rotate(45 10 7)" fill="none" stroke="var(--color-highlight)" strokeWidth="2" />}>
                    validation plant
                  </LegendItem>
                ) : null}
                <LegendItem swatch={<path d="M4 7 H16 M10 1 V13" stroke="var(--color-danger)" strokeWidth="2.5" />}>the plant traced below</LegendItem>
              </>
            }
          >
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full"
              role="img"
              aria-label={`200 training plants by hours of light and cups of water. The shaded region is where the ${kind === "tree" ? `depth-${depth} tree` : "random forest"} predicts a plant will thrive.`}
            >
              <defs>
                <clipPath id="tl-clip">
                  <rect x={pad.l} y={pad.t} width={W - pad.l - pad.r} height={H - pad.t - pad.b} />
                </clipPath>
              </defs>
              <path
                d={runs.map((r) => `M${r.x.toFixed(2)} ${r.y.toFixed(2)}h${r.w.toFixed(2)}v${r.h.toFixed(2)}h${(-r.w).toFixed(2)}Z`).join("")}
                fill="var(--dg-hl)"
                fillOpacity={0.22}
                shapeRendering="crispEdges"
                clipPath="url(#tl-clip)"
              />
              {ticks(0, W_MAX, 2).map((t) => (
                <g key={`y${t}`}>
                  <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="dg-grid" />
                  <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="dg-label">
                    {t}
                  </text>
                </g>
              ))}
              {ticks(L_MIN, L_MAX, 2).map((t) => (
                <text key={`x${t}`} x={sx(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                  {t}
                </text>
              ))}
              <text x={W - pad.r} y={H - 4} textAnchor="end" className="dg-label">
                hours of light per day
              </text>
              <text x={pad.l} y={16} className="dg-label">
                cups of water per week
              </text>
              {showRule ? (
                <g clipPath="url(#tl-clip)" stroke="var(--color-fg-faint)" strokeWidth={2} strokeDasharray="3 5">
                  <line x1={sx(L_MIN)} y1={sy(L_MIN / 2 - 0.5)} x2={sx(L_MAX)} y2={sy(L_MAX / 2 - 0.5)} />
                  <line x1={sx(L_MIN)} y1={sy(L_MIN / 2 + 3)} x2={sx(L_MAX)} y2={sy(L_MAX / 2 + 3)} />
                </g>
              ) : null}
              {plantsTrain.map((p, i) => (
                <circle
                  key={i}
                  cx={sx(p.light)}
                  cy={sy(p.water)}
                  r={4.5}
                  fill={p.thrives ? "var(--dg-ink)" : "var(--color-surface)"}
                  stroke="var(--dg-ink)"
                  strokeWidth={1.75}
                />
              ))}
              {showVal
                ? plantsValidation.map((p, i) => (
                    <rect
                      key={`v${i}`}
                      x={sx(p.light) - 4}
                      y={sy(p.water) - 4}
                      width={8}
                      height={8}
                      transform={`rotate(45 ${sx(p.light)} ${sy(p.water)})`}
                      fill={p.thrives ? "var(--color-highlight)" : "var(--color-surface)"}
                      stroke="var(--color-highlight)"
                      strokeWidth={2}
                    />
                  ))
                : null}
              <g>
                <path
                  d={`M${sx(query[0]) - 11} ${sy(query[1])} H${sx(query[0]) + 11} M${sx(query[0])} ${sy(query[1]) - 11} V${sy(query[1]) + 11}`}
                  stroke="var(--color-surface)"
                  strokeWidth={6}
                />
                <path
                  d={`M${sx(query[0]) - 11} ${sy(query[1])} H${sx(query[0]) + 11} M${sx(query[0])} ${sy(query[1]) - 11} V${sy(query[1]) + 11}`}
                  stroke="var(--color-danger)"
                  strokeWidth={2.5}
                />
              </g>
            </svg>
          </ChartFrame>

          <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @xl:grid-cols-2">
            <StepSlider label="Traced plant: hours of light" values={lightValues} index={lightIndex} onChange={setLightIndex} format={(v) => `${v} h`} />
            <StepSlider label="Traced plant: cups of water" values={waterValues} index={waterIndex} onChange={setWaterIndex} format={(v) => `${v} cups`} />
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              ["training accuracy", pct(trainAcc)],
              ["validation accuracy", pct(valAcc)],
              [kind === "tree" ? "leaves" : "trees", kind === "tree" ? String(countLeaves(tree)) : String(FOREST_TREES)],
            ]}
          />

          {kind === "tree" ? (
            <Verdict
              tone={depth === bestDepth ? "good" : depth < bestDepth - 1 ? "warn" : gap > 0.12 ? "bad" : "neutral"}
              title={
                depth === bestDepth
                  ? "Best single tree on validation"
                  : depth < bestDepth - 1
                    ? "Too few questions: underfitting"
                    : gap > 0.12
                      ? "Memorising noise: overfitting"
                      : "Close to the best depth"
              }
            >
              {depth < bestDepth - 1
                ? `The staircase is too coarse to follow the diagonal band. Training and validation accuracy are both low.`
                : gap > 0.12
                  ? `Training accuracy ${pct(trainAcc)} but validation ${pct(valAcc)}: the extra boxes are fitting the flipped labels, which do not repeat in new plants.`
                  : `Depth ${bestDepth} scores best on validation (${pct(treeScores[bestDepth - 1].val)}). Deeper trees keep improving on training data only.`}
            </Verdict>
          ) : (
            <Verdict tone="good" title={`The forest beats every single tree: ${pct(valAcc)} on validation`}>
              Every tree in the forest overfits its own bootstrap sample, but they overfit in different places. Averaging cancels much of that noise and smooths the
              staircase towards the diagonal band. The best single tree scored {pct(Math.max(...treeScores.map((s) => s.val)))}.
            </Verdict>
          )}

          <section aria-labelledby="tl-trace" className="rounded-panel border border-line bg-surface p-4">
            <h3 id="tl-trace" className="text-sm font-semibold">
              How the {kind === "tree" ? "tree" : "forest"} decides for a plant with {query[0]} h of light and {query[1]} cups of water
            </h3>
            {kind === "tree" ? (
              <>
                <ol className="mt-3 space-y-1.5 text-sm">
                  {trace.steps.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-mono text-fg-faint">{i + 1}.</span>
                      <span>
                        Is {featureName[s.feature]} ≤ {s.threshold.toFixed(2)} {featureUnit[s.feature]}?{" "}
                        <span className="font-semibold">{s.goesLeft ? "Yes" : "No"}</span>{" "}
                        <span className="text-fg-muted">
                          ({s.value} {featureUnit[s.feature]})
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-sm">
                  Leaf: {leafN} training plant{leafN === 1 ? "" : "s"}, {trace.leaf.counts[1]} thrived.{" "}
                  <span className="font-semibold">Prediction: {treePredict(tree, query) ? "thrives" : "does not thrive"}</span>{" "}
                  <span className="text-fg-muted">(probability {queryP.toFixed(2)})</span>
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm">
                {votes} of {FOREST_TREES} trees say it thrives; the average of their probabilities is {queryP.toFixed(2)}.{" "}
                <span className="font-semibold">Prediction: {queryP > 0.5 ? "thrives" : "does not thrive"}</span>
                {plantRule(query[0], query[1]) !== queryP > 0.5 ? (
                  <span className="text-fg-muted"> — the rule behind the data says otherwise.</span>
                ) : null}
              </p>
            )}
          </section>

          <ChartFrame
            label="Chart: accuracy by tree depth"
            legend={
              <>
                <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--dg-ink)" strokeWidth="2.25" />}>training</LegendItem>
                <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-highlight)" strokeWidth="2.5" strokeDasharray="7 4" />}>
                  validation
                </LegendItem>
                {forestVal !== null ? (
                  <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-success)" strokeWidth="2.5" strokeDasharray="2 4" />}>
                    forest, validation
                  </LegendItem>
                ) : null}
              </>
            }
          >
            <AccuracyChart depth={depth} forestVal={forestVal} kind={kind} />
          </ChartFrame>
        </div>
      </div>

      <p className="text-sm text-fg-faint">
        Invented data: 200 training and 200 validation plants, labelled by a rule with 8% of labels flipped. Trees use Gini impurity, as scikit-learn does; the
        forest uses a fixed random seed, so it gives the same result every time.
      </p>
    </div>
  );
}
