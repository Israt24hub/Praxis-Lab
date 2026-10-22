"use client";

import { RotateCcw, Shuffle, SkipForward, StepForward } from "lucide-react";
import { useMemo, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { effort, shoppers } from "@/content/datasets/shoppers";
import { assign, inertia, initCentres, kmeansBest, lloyd, pca2, purity, standardize, update, type Vec } from "@/lib/kmeans";

import { ChartFrame, Checkbox, LegendItem, Segmented, Stats, StepSlider, Verdict, pct, ticks } from "./lab-ui";

/*
 * Two unsupervised methods on small invented datasets, computed in the browser.
 * k-means: step through assignment and update, change k, standardise or not, and
 * restart from different random centres. PCA: the directions of greatest variance
 * in two correlated measurements, with and without standardising.
 */

type Tab = "kmeans" | "pca";

const raw: Vec[] = shoppers.visits.map((v, i) => [v, shoppers.spend[i]]);
const scaler = standardize(raw);
const KS = [1, 2, 3, 4, 5, 6];
const colours = ["var(--dg-cat-1)", "var(--dg-cat-2)", "var(--dg-cat-3)", "var(--dg-cat-4)", "var(--dg-cat-5)", "var(--dg-cat-6)"];
const groupNames = ["frequent, low spend", "rare, low spend", "regular, high spend"];

const compact = (v: number) =>
  v === 0
    ? "0"
    : v >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : v >= 1e4 ? `${Math.round(v / 1e3).toLocaleString("en-US")}k` : v >= 100 ? Math.round(v).toLocaleString("en-US") : v.toFixed(2);

/* ---------- k-means ---------- */

interface Run {
  centres: Vec[];
  labels: number[] | null;
  moves: number;
  /** What the last step was: nothing yet, an assignment, or a move of the centres. */
  phase: "start" | "assigned" | "moved";
  done: boolean;
}

const startRun = (rows: Vec[], k: number, seed: number): Run => ({
  centres: initCentres(rows, k, seed),
  labels: null,
  moves: 0,
  phase: "start",
  done: false,
});

function GroupMark({ cx, cy, group, fill, stroke, r = 5.5 }: { cx: number; cy: number; group: number; fill: string; stroke: string; r?: number }) {
  if (group === 1) return <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} fill={fill} stroke={stroke} strokeWidth={1.5} />;
  if (group === 2) return <path d={`M${cx} ${cy - r * 1.25} L${cx + r * 1.15} ${cy + r * 0.85} L${cx - r * 1.15} ${cy + r * 0.85} Z`} fill={fill} stroke={stroke} strokeWidth={1.5} />;
  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={1.5} />;
}

function KMeansPanel() {
  const [kIndex, setKIndex] = useState(2);
  const [scaled, setScaled] = useState(false);
  const [seed, setSeed] = useState(1);
  const [reveal, setReveal] = useState(false);
  const k = KS[kIndex];
  const rows = scaled ? scaler.rows : raw;
  const [run, setRun] = useState<Run>(() => startRun(raw, 3, 1));

  const reset = (nextK: number, nextScaled: boolean, nextSeed: number) => setRun(startRun(nextScaled ? scaler.rows : raw, nextK, nextSeed));

  const elbow = useMemo(() => KS.map((kk) => kmeansBest(scaled ? scaler.rows : raw, kk, 10).inertia), [scaled]);

  const assignStep = () => {
    const labels = assign(rows, run.centres);
    const unchanged = run.labels !== null && labels.every((l, i) => l === run.labels?.[i]);
    setRun({ ...run, labels, phase: "assigned", done: unchanged });
  };
  const moveStep = () => {
    if (!run.labels) return;
    setRun({ ...run, centres: update(rows, run.labels, run.centres), moves: run.moves + 1, phase: "moved" });
  };
  // After an assignment the next step moves the centres; at the start or after a move, it assigns.
  const nextIsMove = run.phase === "assigned" && !run.done;
  const finish = () => {
    const r = lloyd(rows, run.centres);
    setRun({ centres: r.centres, labels: r.labels, moves: run.moves + r.iterations, phase: "assigned", done: true });
  };

  const display = (c: Vec) => (scaled ? scaler.unscale(c) : c);
  const currentInertia = run.labels ? inertia(rows, run.labels, run.centres) : null;

  const W = 560;
  const H = 380;
  const pad = { l: 60, r: 16, t: 30, b: 44 };
  const sx = (v: number) => pad.l + (v / 20) * (W - pad.l - pad.r);
  const sy = (v: number) => H - pad.b - (v / 3000) * (H - pad.t - pad.b);

  const EW = 560;
  const EH = 220;
  const ep = { l: 64, r: 16, t: 28, b: 40 };
  const ex = (kk: number) => ep.l + ((kk - 1) / 5) * (EW - ep.l - ep.r);
  const ey = (v: number) => EH - ep.b - (v / elbow[0]) * (EH - ep.t - ep.b);

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <div className="grid gap-5 @2xl:grid-cols-2">
          <StepSlider
            label="Number of clusters k"
            values={KS}
            index={kIndex}
            onChange={(i) => {
              setKIndex(i);
              reset(KS[i], scaled, seed);
            }}
          />
          <div className="space-y-3">
            <Checkbox
              checked={scaled}
              onChange={(v) => {
                setScaled(v);
                reset(k, v, seed);
              }}
              label="Standardise both features first"
              help="Rescale each to mean 0, standard deviation 1, so a visit and a dollar stop being compared directly."
            />
            <Checkbox checked={reveal} onChange={setReveal} label="Reveal the groups the data came from" help="Shown as shapes. Real data has no such answer key." />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={nextIsMove ? moveStep : assignStep} disabled={run.done} className={buttonStyles("primary", "px-4 py-2")}>
            <StepForward aria-hidden className="size-4" />
            {nextIsMove ? "Move each centre to its points’ mean" : "Assign each point to its nearest centre"}
          </button>
          <button type="button" onClick={finish} disabled={run.done} className={buttonStyles("secondary", "px-3 py-2")}>
            <SkipForward aria-hidden className="size-4" />
            Run to the end
          </button>
          <button
            type="button"
            onClick={() => {
              setSeed(seed + 1);
              reset(k, scaled, seed + 1);
            }}
            className={buttonStyles("secondary", "px-3 py-2")}
          >
            <Shuffle aria-hidden className="size-4" />
            New random start
          </button>
          <button type="button" onClick={() => reset(k, scaled, seed)} className={buttonStyles("secondary", "px-3 py-2")}>
            <RotateCcw aria-hidden className="size-4" />
            Restart
          </button>
        </div>
      </div>

      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: shoppers by visits and spend, coloured by cluster"
          legend={
            <>
              <LegendItem swatch={<path d="M4 1 L16 13 M16 1 L4 13" stroke="var(--dg-ink)" strokeWidth="2.5" />}>cluster centre</LegendItem>
              {run.labels ? null : <LegendItem swatch={<circle cx="10" cy="7" r="5" fill="var(--color-line-strong)" />}>not yet assigned</LegendItem>}
              {reveal ? (
                <>
                  <LegendItem swatch={<circle cx="10" cy="7" r="5" fill="none" stroke="var(--dg-ink)" strokeWidth="1.5" />}>{groupNames[0]}</LegendItem>
                  <LegendItem swatch={<rect x="5" y="2" width="10" height="10" fill="none" stroke="var(--dg-ink)" strokeWidth="1.5" />}>{groupNames[1]}</LegendItem>
                  <LegendItem swatch={<path d="M10 1 L16 12 L4 12 Z" fill="none" stroke="var(--dg-ink)" strokeWidth="1.5" />}>{groupNames[2]}</LegendItem>
                </>
              ) : null}
            </>
          }
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label={`60 shoppers by visits per month and spend per month, ${run.labels ? `coloured by ${k} clusters` : "not yet assigned to clusters"}.`}
          >
            {ticks(0, 3000, 500).map((t) => (
              <g key={`y${t}`}>
                <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="dg-grid" />
                <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="dg-label">
                  ${t.toLocaleString("en-US")}
                </text>
              </g>
            ))}
            {ticks(0, 20, 2).map((t) => (
              <text key={`x${t}`} x={sx(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                {t}
              </text>
            ))}
            <text x={W - pad.r} y={H - 4} textAnchor="end" className="dg-label">
              visits per month
            </text>
            <text x={pad.l} y={16} className="dg-label">
              spend per month
            </text>
            {raw.map(([v, s], i) => {
              const c = run.labels ? colours[run.labels[i]] : "var(--color-line-strong)";
              return <GroupMark key={i} cx={sx(v)} cy={sy(s)} group={reveal ? shoppers.group[i] : 0} fill={c} stroke={reveal ? "var(--dg-ink)" : c} />;
            })}
            {run.centres.map((c, i) => {
              const [v, s] = display(c);
              const x = sx(v);
              const yy = sy(s);
              return (
                <g key={`c${i}`}>
                  <path d={`M${x - 9} ${yy - 9} L${x + 9} ${yy + 9} M${x + 9} ${yy - 9} L${x - 9} ${yy + 9}`} stroke="var(--color-surface)" strokeWidth={7} />
                  <path d={`M${x - 9} ${yy - 9} L${x + 9} ${yy + 9} M${x + 9} ${yy - 9} L${x - 9} ${yy + 9}`} stroke={colours[i]} strokeWidth={3.5} />
                  <text x={x + 12} y={yy - 8} className="dg-label-strong">
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </ChartFrame>

        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              ["centre moves", String(run.moves)],
              ["inertia", currentInertia === null ? "—" : compact(currentInertia)],
              ["start", `random #${seed}`],
            ]}
          />
          {run.done ? (
            reveal ? (
              <Verdict
                tone={purity(run.labels ?? [], shoppers.group) === 60 && k === 3 ? "good" : "warn"}
                title={`Converged. Each cluster’s most common group covers ${purity(run.labels ?? [], shoppers.group)} of 60 shoppers.`}
              >
                {k === 3 && purity(run.labels ?? [], shoppers.group) === 60
                  ? "The three clusters are exactly the three groups the data came from."
                  : scaled
                    ? "Not the groups the data came from. Try k = 3, or a new random start."
                    : "Without standardising, spend (hundreds of dollars) swamps visits (a handful), so the clusters are bands of spend."}
              </Verdict>
            ) : (
              <Verdict tone="neutral" title="Converged: reassigning would change nothing">
                k-means stops when no point switches cluster. That is a local best for this start, not necessarily the best possible clustering — compare the
                inertia with other random starts.
              </Verdict>
            )
          ) : (
            <Verdict
              tone="neutral"
              title={run.phase === "start" ? "Random starting centres" : run.phase === "assigned" ? "Points assigned" : "Centres moved"}
            >
              {run.phase === "start"
                ? `k = ${k} centres placed on randomly chosen shoppers. Grey points are not assigned yet.`
                : run.phase === "assigned"
                  ? "Each point has joined its nearest centre. Next, each centre moves to the average of its points."
                  : "Each centre is now at the average of its points. Next, reassign: if no point changes cluster, k-means has converged."}
            </Verdict>
          )}
          <ChartFrame
            label="Chart: inertia for k from 1 to 6"
            legend={<span>Inertia: total squared distance from each point to its centre, best of 10 random starts. Look for the bend.</span>}
          >
            <svg
              viewBox={`0 0 ${EW} ${EH}`}
              className="h-auto w-full"
              role="img"
              aria-label={`Inertia for k = 1 to 6 ${scaled ? "on standardised data" : "on raw data"}: ${elbow.map((v) => compact(v)).join(", ")}.`}
            >
              {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                <g key={f}>
                  <line x1={ep.l} x2={EW - ep.r} y1={ey(f * elbow[0])} y2={ey(f * elbow[0])} className="dg-grid" />
                  <text x={ep.l - 8} y={ey(f * elbow[0]) + 4} textAnchor="end" className="dg-label">
                    {compact(f * elbow[0])}
                  </text>
                </g>
              ))}
              {KS.map((kk) => (
                <text
                  key={kk}
                  x={ex(kk)}
                  y={EH - ep.b + 18}
                  textAnchor="middle"
                  className="dg-label"
                  style={kk === k ? { fontWeight: 700, fill: "var(--color-fg)" } : undefined}
                >
                  {kk}
                </text>
              ))}
              <text x={EW - ep.r} y={EH - 4} textAnchor="end" className="dg-label">
                k
              </text>
              <text x={ep.l} y={14} className="dg-label">
                inertia {scaled ? "(standardised units)" : "(raw units)"}
              </text>
              <path d={elbow.map((v, i) => `${i ? "L" : "M"}${ex(i + 1)} ${ey(v)}`).join(" ")} fill="none" stroke="var(--dg-hl)" strokeWidth={2.5} />
              {elbow.map((v, i) => (
                <circle key={i} cx={ex(i + 1)} cy={ey(v)} r={i + 1 === k ? 6 : 4} fill={i + 1 === k ? "var(--dg-hl)" : "var(--color-surface)"} stroke="var(--dg-hl)" strokeWidth={2} />
              ))}
            </svg>
          </ChartFrame>
        </div>
      </div>
    </div>
  );
}

/* ---------- PCA ---------- */

const effortRaw: Vec[] = effort.hours.map((h, i) => [h, effort.questions[i]]);
const effortScaled = standardize(effortRaw).rows;

function PCAPanel() {
  const [scaled, setScaled] = useState(false);
  const [showProj, setShowProj] = useState(true);
  const rows = scaled ? effortScaled : effortRaw;
  const pca = useMemo(() => pca2(rows), [rows]);
  const [u1, u2] = pca.components;
  const [mx, my] = pca.mean;

  const W = 560;
  const H = 400;
  const pad = 36;
  const hx = Math.max(...rows.map((r) => Math.abs(r[0] - mx)));
  const hy = Math.max(...rows.map((r) => Math.abs(r[1] - my)));
  const s = Math.min((W - 2 * pad) / (2 * hx * 1.1), (H - 2 * pad) / (2 * hy * 1.1));
  const px = (v: number) => W / 2 + (v - mx) * s;
  const py = (v: number) => H / 2 - (v - my) * s;
  const reach = 2 * Math.max(hx, hy);
  const scores = rows.map((r) => (r[0] - mx) * u1[0] + (r[1] - my) * u1[1]);
  const sMax = Math.max(...scores.map(Math.abs));
  const gridStep = scaled ? 1 : 100;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @2xl:grid-cols-2">
        <Checkbox
          checked={scaled}
          onChange={setScaled}
          label="Standardise both features first"
          help="Hours and questions each rescaled to mean 0, standard deviation 1."
        />
        <Checkbox checked={showProj} onChange={setShowProj} label="Show each student’s projection onto PC1" help="The dotted lines drop each point onto the first component." />
      </div>

      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: the data as PCA sees it, with both axes on the same scale"
          legend={
            <>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--dg-hl)" strokeWidth="3" />}>PC1</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-highlight)" strokeWidth="2.5" strokeDasharray="5 4" />}>PC2</LegendItem>
              <LegendItem swatch={<circle cx="10" cy="7" r="4.5" fill="var(--dg-ink)" />}>a student</LegendItem>
            </>
          }
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label={`40 students, ${scaled ? "standardised" : "in raw units"}, drawn with equal scales on both axes. PC1 explains ${pct(pca.ratios[0])} of the variance.`}
          >
            <defs>
              <clipPath id="pca-clip">
                <rect x={0} y={0} width={W} height={H} />
              </clipPath>
            </defs>
            <g clipPath="url(#pca-clip)">
              {ticks(my - H / 2 / s, my + H / 2 / s, gridStep).map((t) => (
                <line key={`gy${t}`} x1={0} x2={W} y1={py(t)} y2={py(t)} className="dg-grid" />
              ))}
              {ticks(mx - W / 2 / s, mx + W / 2 / s, gridStep).map((t) => (
                <line key={`gx${t}`} x1={px(t)} x2={px(t)} y1={0} y2={H} className="dg-grid" />
              ))}
              {showProj
                ? rows.map((r, i) => {
                    const fx = mx + scores[i] * u1[0];
                    const fy = my + scores[i] * u1[1];
                    return <line key={`p${i}`} x1={px(r[0])} y1={py(r[1])} x2={px(fx)} y2={py(fy)} stroke="var(--color-fg-faint)" strokeDasharray="2 3" />;
                  })
                : null}
              <line x1={px(mx - reach * u2[0])} y1={py(my - reach * u2[1])} x2={px(mx + reach * u2[0])} y2={py(my + reach * u2[1])} stroke="var(--color-highlight)" strokeWidth={2.5} strokeDasharray="5 4" />
              <line x1={px(mx - reach * u1[0])} y1={py(my - reach * u1[1])} x2={px(mx + reach * u1[0])} y2={py(my + reach * u1[1])} stroke="var(--dg-hl)" strokeWidth={3} />
              {rows.map((r, i) => (
                <circle key={i} cx={px(r[0])} cy={py(r[1])} r={4.5} fill="var(--dg-ink)" />
              ))}
            </g>
            <text x={12} y={20} className="dg-label">
              {scaled ? "grid: 1 standard deviation" : "grid: 100 units (hours or questions)"}
            </text>
          </svg>
        </ChartFrame>

        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              ["PC1 explains", pct(pca.ratios[0], 2)],
              ["PC2 explains", pct(pca.ratios[1], 2)],
              ["PC1 weights (hours, questions)", `${u1[0].toFixed(2)}, ${u1[1].toFixed(2)}`],
            ]}
          />
          <Verdict tone={scaled ? "good" : "warn"} title={scaled ? "Both measures count: PC1 is a combined effort score" : "PC1 is just the questions column"}>
            {scaled
              ? `After standardising, PC1 weighs hours and questions equally and keeps ${pct(pca.ratios[0])} of the variation. One number per student instead of two, losing little.`
              : `In raw units one question counts as much as one hour, and questions spread over hundreds while hours spread over about 16. PCA follows the biggest numbers, so PC1 points almost exactly along the questions axis (weights ${u1[0].toFixed(2)} and ${u1[1].toFixed(2)}). The ${pct(pca.ratios[0], 2)} it “explains” is mostly a choice of units.`}
          </Verdict>
          <ChartFrame label="Chart: each student reduced to one number, their PC1 score">
            <svg viewBox="0 0 560 90" className="h-auto w-full" role="img" aria-label="Each student's PC1 score on a single line.">
              <line x1={24} x2={536} y1={45} y2={45} className="dg-line" />
              {scores.map((v, i) => (
                <circle key={i} cx={280 + (v / sMax) * 250} cy={45} r={5} fill="var(--dg-hl)" fillOpacity={0.55} stroke="var(--dg-hl)" />
              ))}
              <text x={24} y={80} className="dg-label">
                lower effort
              </text>
              <text x={536} y={80} textAnchor="end" className="dg-label">
                higher effort
              </text>
              <text x={24} y={20} className="dg-label">
                each student as one number: their PC1 score
              </text>
            </svg>
          </ChartFrame>
        </div>
      </div>
    </div>
  );
}

export function ClusteringLab() {
  const [tab, setTab] = useState<Tab>("kmeans");
  return (
    <div className="@container space-y-6">
      <Segmented<Tab>
        legend="Method"
        value={tab}
        onChange={setTab}
        options={[
          ["kmeans", "k-means clustering"],
          ["pca", "PCA"],
        ]}
      />
      {tab === "kmeans" ? <KMeansPanel /> : <PCAPanel />}
      <p className="text-sm text-fg-faint">
        Invented data: 60 shoppers made from three groups of 20, and 40 students whose practice questions are roughly 20 × their study hours. Everything is
        computed in your browser.
      </p>
    </div>
  );
}
