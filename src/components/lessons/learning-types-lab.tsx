"use client";

import { useMemo, useState } from "react";

import { studentJobs, studentJobsHeldOut, type StudentJobRow } from "@/content/datasets/student-jobs";
import { fitLogistic2, sigmoid } from "@/lib/classification";
import { kmeansBest, matchedAgreement } from "@/lib/kmeans";

import { ChartFrame, Checkbox, LegendItem, Segmented, Stats, Verdict, ticks } from "./lab-ui";

/*
 * The same 40 students, two kinds of learning. Supervised: logistic regression
 * learns pass/fail from labelled examples. Unsupervised: k-means groups the
 * students without any labels, and only afterwards are the groups compared with
 * the labels. Everything is computed in the browser.
 */

type Mode = "supervised" | "unsupervised";
type ClusterOn = "both" | "study";
type Compare = "none" | "passed" | "job";

const W = 560;
const H = 380;
const pad = { l: 52, r: 16, t: 30, b: 44 };
const X_MAX = 18;
const Y_MAX = 30;
const sx = (v: number) => pad.l + (v / X_MAX) * (W - pad.l - pad.r);
const sy = (v: number) => H - pad.b - (v / Y_MAX) * (H - pad.t - pad.b);

const rows = studentJobs.map((r) => ({ x: [r.study, r.work] as [number, number], y: r.passed }));
const model = fitLogistic2(rows);
const predict = (r: StudentJobRow) => (sigmoid(model.w[0] * r.study + model.w[1] * r.work + model.b) >= 0.5 ? 1 : 0);
const trainCorrect = studentJobs.filter((r) => predict(r) === r.passed).length;
const heldCorrect = studentJobsHeldOut.filter((r) => predict(r) === r.passed).length;
/** Study hours where the model's probability is exactly 0.5, at a given number of work hours. */
const boundaryAt = (work: number) => -(model.b + model.w[1] * work) / model.w[0];

const clusterColour = ["var(--dg-cat-1)", "var(--dg-cat-2)"];

function Marker({ cx, cy, filled, colour, diamond }: { cx: number; cy: number; filled: boolean; colour: string; diamond?: boolean }) {
  return diamond ? (
    <rect
      x={cx - 5}
      y={cy - 5}
      width={10}
      height={10}
      transform={`rotate(45 ${cx} ${cy})`}
      fill={filled ? colour : "var(--color-surface)"}
      stroke={colour}
      strokeWidth={2}
    />
  ) : (
    <circle cx={cx} cy={cy} r={6} fill={filled ? colour : "var(--color-surface)"} stroke={colour} strokeWidth={2} />
  );
}

export function LearningTypesLab() {
  const [mode, setMode] = useState<Mode>("supervised");
  const [clusterOn, setClusterOn] = useState<ClusterOn>("both");
  const [compare, setCompare] = useState<Compare>("none");
  const [showHeldOut, setShowHeldOut] = useState(false);

  const clusters = useMemo(() => {
    const X = studentJobs.map((r) => (clusterOn === "both" ? [r.study, r.work] : [r.study]));
    const res = kmeansBest(X, 2);
    // Number the clusters by their mean study hours, so the colours stay put when the features change.
    const order = res.centres.map((c, i) => [c[0], i] as const).sort((a, b) => a[0] - b[0]).map(([, i]) => i);
    const relabel = (l: number) => order.indexOf(l);
    return {
      labels: res.labels.map(relabel),
      centres: order.map((i) => res.centres[i]),
    };
  }, [clusterOn]);

  const sizes = [0, 1].map((c) => clusters.labels.filter((l) => l === c).length);
  const truth = compare === "passed" ? studentJobs.map((r) => r.passed) : compare === "job" ? studentJobs.map((r) => r.job) : null;
  const agreement = truth ? matchedAgreement(clusters.labels, truth) : null;
  const table = truth ? [0, 1].map((c) => [0, 1].map((v) => clusters.labels.filter((l, i) => l === c && truth[i] === v).length)) : null;

  // Where k-means switches from one cluster to the other: the perpendicular bisector of the two centres.
  const divider = (() => {
    const [a, b] = clusters.centres;
    if (clusterOn === "study") {
      const x = (a[0] + b[0]) / 2;
      return { x1: sx(x), y1: sy(0), x2: sx(x), y2: sy(Y_MAX) };
    }
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = -(b[1] - a[1]);
    const dy = b[0] - a[0];
    const len = Math.hypot(dx, dy);
    const L = 60;
    return { x1: sx(mx - (dx / len) * L), y1: sy(my - (dy / len) * L), x2: sx(mx + (dx / len) * L), y2: sy(my + (dy / len) * L) };
  })();

  const labelName = compare === "passed" ? ["failed", "passed"] : ["full-time", "has a job"];
  const supervised = mode === "supervised";

  return (
    <div className="@container space-y-6">
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented<Mode>
          legend="What does the method get to see?"
          value={mode}
          onChange={setMode}
          options={[
            ["supervised", "Features and labels (supervised)"],
            ["unsupervised", "Features only (unsupervised)"],
          ]}
        />
        {supervised ? (
          <Checkbox
            checked={showHeldOut}
            onChange={setShowHeldOut}
            label="Show 20 held-out students"
            help="Students the model never saw while learning. Their labels are only used to check it."
          />
        ) : (
          <div className="grid gap-5 @2xl:grid-cols-2">
            <Segmented<ClusterOn>
              legend="Group the students by"
              value={clusterOn}
              onChange={setClusterOn}
              options={[
                ["both", "Study and work hours"],
                ["study", "Study hours only"],
              ]}
            />
            <Segmented<Compare>
              legend="Afterwards, compare the groups with"
              value={compare}
              onChange={setCompare}
              options={[
                ["none", "Nothing"],
                ["passed", "Passed or failed"],
                ["job", "Has a job"],
              ]}
            />
          </div>
        )}
      </div>

      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: students by study hours and work hours"
          legend={
            supervised ? (
              <>
                <LegendItem swatch={<circle cx="10" cy="7" r="5" fill="var(--dg-ink)" />}>passed</LegendItem>
                <LegendItem swatch={<circle cx="10" cy="7" r="5" fill="none" stroke="var(--dg-ink)" strokeWidth="2" />}>failed</LegendItem>
                <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--dg-hl)" strokeWidth="2.5" />}>
                  decision boundary (shaded side: predicted pass)
                </LegendItem>
                <LegendItem swatch={<circle cx="10" cy="7" r="6" fill="none" stroke="var(--color-danger)" strokeWidth="2" />}>
                  predicted wrongly
                </LegendItem>
                {showHeldOut ? (
                  <LegendItem swatch={<rect x="5" y="2" width="9" height="9" transform="rotate(45 10 7)" fill="none" stroke="var(--dg-ink)" strokeWidth="2" />}>
                    held-out student
                  </LegendItem>
                ) : null}
              </>
            ) : (
              <>
                <LegendItem swatch={<circle cx="10" cy="7" r="5" fill="var(--dg-cat-1)" />}>group 1</LegendItem>
                <LegendItem swatch={<circle cx="10" cy="7" r="5" fill="var(--dg-cat-2)" />}>group 2</LegendItem>
                <LegendItem swatch={<path d="M4 1 L16 13 M16 1 L4 13" stroke="var(--dg-ink)" strokeWidth="2.5" />}>group centre</LegendItem>
                <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-line-strong)" strokeWidth="2" strokeDasharray="5 4" />}>
                  where the groups meet
                </LegendItem>
                {truth ? (
                  <LegendItem swatch={<circle cx="10" cy="7" r="5" fill="none" stroke="var(--dg-ink)" strokeWidth="2" />}>
                    hollow: {labelName[0]}; filled: {labelName[1]}
                  </LegendItem>
                ) : null}
              </>
            )
          }
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label={
              supervised
                ? `40 students plotted by study hours and work hours, filled if they passed. The logistic regression boundary sits near ${boundaryAt(10).toFixed(1)} study hours.`
                : `40 students plotted by study hours and work hours, coloured by the two groups k-means found using ${clusterOn === "both" ? "both features" : "study hours only"}.`
            }
          >
            <defs>
              <clipPath id="lt-clip">
                <rect x={pad.l} y={pad.t} width={W - pad.l - pad.r} height={H - pad.t - pad.b} />
              </clipPath>
            </defs>
            {ticks(0, Y_MAX, 5).map((t) => (
              <g key={`y${t}`}>
                <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="dg-grid" />
                <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="dg-label">
                  {t}
                </text>
              </g>
            ))}
            {ticks(0, X_MAX, 2).map((t) => (
              <text key={`x${t}`} x={sx(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                {t}
              </text>
            ))}
            <text x={W - pad.r} y={H - 4} textAnchor="end" className="dg-label">
              study hours per week
            </text>
            <text x={pad.l} y={16} className="dg-label">
              paid work hours per week
            </text>

            {supervised ? (
              <g clipPath="url(#lt-clip)">
                <path
                  d={`M${sx(boundaryAt(0))} ${sy(0)} L${sx(X_MAX)} ${sy(0)} L${sx(X_MAX)} ${sy(Y_MAX)} L${sx(boundaryAt(Y_MAX))} ${sy(Y_MAX)} Z`}
                  fill="var(--dg-hl)"
                  fillOpacity={0.12}
                />
                <line x1={sx(boundaryAt(0))} y1={sy(0)} x2={sx(boundaryAt(Y_MAX))} y2={sy(Y_MAX)} stroke="var(--dg-hl)" strokeWidth={2.5} />
              </g>
            ) : (
              <line {...divider} stroke="var(--color-line-strong)" strokeWidth={2} strokeDasharray="5 4" clipPath="url(#lt-clip)" />
            )}

            {studentJobs.map((r, i) => {
              const cx = sx(r.study);
              const cy = sy(r.work);
              if (supervised) {
                const wrong = predict(r) !== r.passed;
                return (
                  <g key={i}>
                    <Marker cx={cx} cy={cy} filled={r.passed === 1} colour="var(--dg-ink)" />
                    {wrong ? <circle cx={cx} cy={cy} r={10} fill="none" stroke="var(--color-danger)" strokeWidth={2} /> : null}
                  </g>
                );
              }
              const c = clusters.labels[i];
              return <Marker key={i} cx={cx} cy={cy} filled={truth ? truth[i] === 1 : true} colour={clusterColour[c]} />;
            })}

            {supervised && showHeldOut
              ? studentJobsHeldOut.map((r, i) => {
                  const cx = sx(r.study);
                  const cy = sy(r.work);
                  const wrong = predict(r) !== r.passed;
                  return (
                    <g key={`h${i}`}>
                      <Marker cx={cx} cy={cy} filled={r.passed === 1} colour="var(--dg-ink)" diamond />
                      {wrong ? <circle cx={cx} cy={cy} r={11} fill="none" stroke="var(--color-danger)" strokeWidth={2} /> : null}
                    </g>
                  );
                })
              : null}

            {!supervised
              ? clusters.centres.map((c, i) => {
                  const cx = sx(c[0]);
                  const cy = clusterOn === "both" ? sy(c[1]) : sy(Y_MAX) + 4;
                  return (
                    <g key={`c${i}`}>
                      <path d={`M${cx - 8} ${cy - 8} L${cx + 8} ${cy + 8} M${cx + 8} ${cy - 8} L${cx - 8} ${cy + 8}`} stroke="var(--color-surface)" strokeWidth={6} />
                      <path d={`M${cx - 8} ${cy - 8} L${cx + 8} ${cy + 8} M${cx + 8} ${cy - 8} L${cx - 8} ${cy + 8}`} stroke={clusterColour[i]} strokeWidth={3} />
                    </g>
                  );
                })
              : null}
          </svg>
        </ChartFrame>

        <div className="min-w-0 space-y-4">
          {supervised ? (
            <>
              <Stats
                items={[
                  ["training students right", `${trainCorrect} of ${studentJobs.length}`],
                  ["held-out students right", `${heldCorrect} of ${studentJobsHeldOut.length}`],
                  ["boundary at 10 h work", `${boundaryAt(10).toFixed(1)} h study`],
                ]}
              />
              <Verdict tone="good" title="The labels define the task, so it can be checked">
                <p>
                  Logistic regression learned P(pass) = σ({model.w[0].toFixed(2)} × study {model.w[1] < 0 ? "−" : "+"} {Math.abs(model.w[1]).toFixed(2)} × work{" "}
                  {model.b < 0 ? "−" : "+"} {Math.abs(model.b).toFixed(2)}). Work hours barely matter to it: the labels say passing depends on study.
                </p>
                <p className="mt-2">
                  Because every student has a correct answer, we can score the model on students it never saw: {heldCorrect} of {studentJobsHeldOut.length}{" "}
                  held-out students right.
                </p>
              </Verdict>
            </>
          ) : (
            <>
              <Stats
                items={[
                  ["group 1 size", String(sizes[0])],
                  ["group 2 size", String(sizes[1])],
                  [
                    "group centres",
                    clusterOn === "both"
                      ? clusters.centres.map((c) => `(${c[0].toFixed(1)}, ${c[1].toFixed(1)})`).join(" ")
                      : clusters.centres.map((c) => `${c[0].toFixed(1)} h`).join(", "),
                  ],
                ]}
              />
              {truth && table && agreement !== null ? (
                <>
                  <table className="w-full max-w-md border-collapse text-sm">
                    <caption className="mb-2 text-left font-semibold">Groups against the label “{compare === "passed" ? "passed" : "has a job"}”</caption>
                    <thead>
                      <tr>
                        <th scope="col" className="border-b border-line py-1.5 text-left font-medium text-fg-muted">
                          <span className="sr-only">Group</span>
                        </th>
                        {labelName.map((n) => (
                          <th key={n} scope="col" className="border-b border-line py-1.5 text-right font-medium text-fg-muted">
                            {n}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.map((row, c) => (
                        <tr key={c}>
                          <th scope="row" className="border-b border-line py-1.5 text-left font-medium">
                            group {c + 1}
                          </th>
                          {row.map((v, j) => (
                            <td key={j} className="border-b border-line py-1.5 text-right font-mono tabular-nums">
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Verdict tone={agreement >= 36 ? "good" : "warn"} title={`The groups match this label for ${agreement} of 40 students`}>
                    {agreement >= 36
                      ? "k-means found this structure without being told about it — because it is the biggest difference in the features it was given."
                      : "Close to what a coin would give. The groups are real, but they are not about this label. Nothing told k-means which question we care about."}
                  </Verdict>
                </>
              ) : (
                <Verdict tone="neutral" title="Two groups — but what do they mean?">
                  k-means split the students into the two groups that are tightest in the features it was given. With no labels there is no score to check: deciding
                  what a group means is up to you. Compare the groups with a label to see what they line up with.
                </Verdict>
              )}
            </>
          )}
        </div>
      </div>

      <p className="text-sm text-fg-faint">
        Invented data for 60 students. Logistic regression (scikit-learn’s default settings) and k-means (best of 10 random starts) are computed in your browser.
      </p>
    </div>
  );
}
