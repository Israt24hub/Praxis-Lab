"use client";

import { Shuffle } from "lucide-react";
import { useMemo, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import {
  FRESH_ROWS,
  MAX_MODELS,
  SELECTION_SEED,
  selectModel,
  splitChecks,
  splitVisits,
  VALIDATION_ROWS,
  visits,
  type SplitKind,
} from "@/lib/selection";

import { ChartFrame, LegendItem, Segmented, Stats, StepSlider, Verdict, pct } from "./lab-ui";

/*
 * Part 1: three ways to split 24 clinic visits by 8 patients, and what each one
 * mixes between training and test. Part 2: what choosing among many models on the
 * test set does to the test score. Both computed in the browser.
 */

const kinds: Record<SplitKind, { label: string; question: string }> = {
  random: { label: "Random rows", question: "How well does the model do on more visits like these, from the same patients?" },
  grouped: { label: "By patient", question: "How well does the model do for patients it has never seen?" },
  time: { label: "By date", question: "How well does the model do on visits that happen later?" },
};

const patients = "ABCDEFGH".split("");
const monthStarts = [1, 32, 60, 91, 121, 152, 182];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function SplitPanel() {
  const [kind, setKind] = useState<SplitKind>("random");
  const test = useMemo(() => splitVisits(kind), [kind]);
  const checks = splitChecks(test);

  const W = 560;
  const H = 330;
  const pad = { l: 92, r: 16, t: 24, b: 40 };
  const sx = (day: number) => pad.l + ((day - 1) / 181) * (W - pad.l - pad.r);
  const rowH = (H - pad.t - pad.b) / patients.length;
  const sy = (p: string) => pad.t + (patients.indexOf(p) + 0.5) * rowH;

  return (
    <section aria-labelledby="sl-split" className="space-y-5">
      <h3 id="sl-split" className="font-semibold">
        1. Three ways to split the same records
      </h3>
      <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented<SplitKind>
          legend="Put a quarter of the visits in the test set by"
          value={kind}
          onChange={setKind}
          options={(Object.keys(kinds) as SplitKind[]).map((k) => [k, kinds[k].label] as const)}
        />
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: 24 visits by patient and date, marked training or test"
          legend={
            <>
              <LegendItem swatch={<circle cx="10" cy="7" r="5" fill="var(--dg-ink)" />}>training visit</LegendItem>
              <LegendItem swatch={<rect x="5" y="2" width="10" height="10" fill="var(--color-surface)" stroke="var(--color-highlight)" strokeWidth="2.5" />}>
                test visit
              </LegendItem>
              {kind === "time" ? (
                <LegendItem swatch={<line x1="10" y1="0" x2="10" y2="14" stroke="var(--color-line-strong)" strokeWidth="2" strokeDasharray="3 3" />}>
                  cut-off date
                </LegendItem>
              ) : null}
            </>
          }
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label={`24 visits by 8 patients from January to June. ${checks.testSize} are in the test set. ${checks.sharedPatients.length} test patients also appear in training.`}
          >
            {monthStarts.slice(0, 6).map((d, i) => (
              <g key={d}>
                <line x1={sx(d)} x2={sx(d)} y1={pad.t} y2={H - pad.b} className="dg-grid" />
                <text x={(sx(d) + sx(monthStarts[i + 1])) / 2} y={H - pad.b + 20} textAnchor="middle" className="dg-label">
                  {monthNames[i]}
                </text>
              </g>
            ))}
            {patients.map((p) => {
              const shared = checks.sharedPatients.includes(p);
              return (
                <g key={p}>
                  <line x1={pad.l} x2={W - pad.r} y1={sy(p)} y2={sy(p)} className="dg-grid" />
                  <text x={pad.l - 12} y={sy(p) + 4} textAnchor="end" className={shared ? "dg-label-strong" : "dg-label"}>
                    {shared ? `patient ${p} ⚠` : `patient ${p}`}
                  </text>
                </g>
              );
            })}
            {kind === "time" ? (
              <line
                x1={(sx(checks.lastTrainDay) + sx(visits[visits.length - 6].day)) / 2}
                x2={(sx(checks.lastTrainDay) + sx(visits[visits.length - 6].day)) / 2}
                y1={pad.t - 6}
                y2={H - pad.b}
                stroke="var(--color-line-strong)"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            ) : null}
            {visits.map((v) =>
              test.has(v.id) ? (
                <rect key={v.id} x={sx(v.day) - 6} y={sy(v.patient) - 6} width={12} height={12} fill="var(--color-surface)" stroke="var(--color-highlight)" strokeWidth={2.5} />
              ) : (
                <circle key={v.id} cx={sx(v.day)} cy={sy(v.patient)} r={6} fill="var(--dg-ink)" />
              ),
            )}
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              ["test visits", `${checks.testSize} of ${visits.length}`],
              ["test patients also in training", String(checks.sharedPatients.length)],
              ["test visits dated before the last training visit", String(checks.testBeforeLastTrain)],
            ]}
          />
          <Verdict
            tone={kind === "random" ? "warn" : "good"}
            title={kind === "random" ? "Patients on both sides" : kind === "grouped" ? "Every test patient is new" : "Training never sees the future"}
          >
            <p>
              This split answers: <span className="font-semibold text-fg">{kinds[kind].question}</span>
            </p>
            <p className="mt-2">
              {kind === "random"
                ? `${checks.sharedPatients.length} of the test patients (marked ⚠) also have visits in training. A model can recognise a patient instead of learning anything general, so the test score is too optimistic for new patients.`
                : kind === "grouped"
                  ? "All three visits of each test patient are held out together. Dates are still mixed, which is fine unless the model will be used on future visits."
                  : `Everything before the cut-off trains; everything after tests. ${checks.sharedPatients.length} patients appear on both sides — right if you will predict known patients’ future visits, wrong if the model is for new patients.`}
            </p>
          </Verdict>
        </div>
      </div>
    </section>
  );
}

const MODEL_COUNTS = [1, 10, 100, 1000];
const TEST_SIZES = [50, 100, 200, 500, 1000];

function ReusePanel() {
  const [modelsIndex, setModelsIndex] = useState(3);
  const [testIndex, setTestIndex] = useState(2);
  const [chooseOn, setChooseOn] = useState<"validation" | "test">("test");
  const [seed, setSeed] = useState(SELECTION_SEED);
  const models = MODEL_COUNTS[modelsIndex];
  const testRows = TEST_SIZES[testIndex];
  const r = useMemo(() => selectModel(models, testRows, chooseOn, seed), [models, testRows, chooseOn, seed]);

  const reported = r.winnerTest;
  const inflated = reported - r.winnerFresh > 2 * Math.sqrt(0.25 / testRows);

  // Histogram of the scores used to choose, in bins 1 percentage point wide.
  const lo = 0.3;
  const hi = 0.75;
  const bins = Array.from({ length: Math.round((hi - lo) * 100) }, () => 0);
  for (const s of r.choosingScores) bins[Math.max(0, Math.min(bins.length - 1, Math.floor((s - lo) * 100 + 1e-9)))]++;
  const maxBin = Math.max(...bins, 1);
  const W = 560;
  const H = 210;
  const pad = { l: 40, r: 16, t: 24, b: 40 };
  const bx = (v: number) => pad.l + ((v - lo) / (hi - lo)) * (W - pad.l - pad.r);
  const bh = (n: number) => (n / maxBin) * (H - pad.t - pad.b);
  const winnerScore = r.choosingScores[r.winner];

  return (
    <section aria-labelledby="sl-reuse" className="space-y-5">
      <h3 id="sl-reuse" className="font-semibold">
        2. What choosing on the test set does to the test score
      </h3>
      <p className="text-sm text-fg-muted">
        Every candidate model here is a rule built on a meaningless random feature, so each one’s true accuracy is exactly 50%. The question is what score the
        winner reports.
      </p>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <div className="grid gap-5 @2xl:grid-cols-2">
          <StepSlider label="Models tried" values={MODEL_COUNTS} index={modelsIndex} onChange={setModelsIndex} format={(v) => v.toLocaleString("en-US")} />
          <StepSlider label="Test set size (rows)" values={TEST_SIZES} index={testIndex} onChange={setTestIndex} format={(v) => v.toLocaleString("en-US")} />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Segmented<"validation" | "test">
            legend="Choose the winner by its score on"
            value={chooseOn}
            onChange={setChooseOn}
            options={[
              ["validation", `the validation set (${VALIDATION_ROWS} rows)`],
              ["test", "the test set"],
            ]}
          />
          <button type="button" onClick={() => setSeed(seed + 1)} className={buttonStyles("secondary", "px-3 py-2")}>
            <Shuffle aria-hidden className="size-4" />
            Draw a new dataset
          </button>
        </div>
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <ChartFrame
          label={`Chart: the ${models} models' scores on the ${chooseOn} set`}
          legend={
            <>
              <LegendItem swatch={<rect x="3" y="2" width="14" height="10" fill="var(--dg-hl)" fillOpacity="0.5" />}>number of models with that score</LegendItem>
              <LegendItem swatch={<line x1="10" y1="0" x2="10" y2="14" stroke="var(--color-highlight)" strokeWidth="3" />}>the winner</LegendItem>
              <LegendItem swatch={<line x1="10" y1="0" x2="10" y2="14" stroke="var(--dg-ink)" strokeWidth="2" strokeDasharray="3 3" />}>true accuracy, 50%</LegendItem>
            </>
          }
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label={`Histogram of ${models} models' accuracy on the ${chooseOn} set. The winner scored ${pct(winnerScore)}; every model's true accuracy is 50%.`}
          >
            {[0.3, 0.4, 0.5, 0.6, 0.7].map((t) => (
              <text key={t} x={bx(t)} y={H - pad.b + 18} textAnchor="middle" className="dg-label">
                {Math.round(t * 100)}%
              </text>
            ))}
            <text x={W - pad.r} y={H - 4} textAnchor="end" className="dg-label">
              accuracy on the {chooseOn} set
            </text>
            <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} className="dg-line" />
            {bins.map((n, i) =>
              n > 0 ? (
                <rect
                  key={i}
                  x={bx(lo + i / 100) + 0.5}
                  y={H - pad.b - bh(n)}
                  width={bx(lo + (i + 1) / 100) - bx(lo + i / 100) - 1}
                  height={bh(n)}
                  fill="var(--dg-hl)"
                  fillOpacity={0.5}
                />
              ) : null,
            )}
            <line x1={bx(0.5)} x2={bx(0.5)} y1={pad.t} y2={H - pad.b} stroke="var(--dg-ink)" strokeWidth={2} strokeDasharray="3 3" />
            <line x1={bx(winnerScore)} x2={bx(winnerScore)} y1={pad.t - 6} y2={H - pad.b} stroke="var(--color-highlight)" strokeWidth={3} />
            <text
              x={winnerScore > 0.62 ? bx(winnerScore) - 6 : bx(winnerScore) + 6}
              y={pad.t + 4}
              textAnchor={winnerScore > 0.62 ? "end" : "start"}
              className="dg-label-strong"
            >
              winner {pct(winnerScore)}
            </text>
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              [chooseOn === "validation" ? "winner on validation" : "winner on test (reported)", pct(chooseOn === "validation" ? r.winnerValidation : r.winnerTest)],
              [chooseOn === "validation" ? "winner on test (reported)" : "winner on validation", pct(chooseOn === "validation" ? r.winnerTest : r.winnerValidation)],
              [`winner on ${FRESH_ROWS.toLocaleString("en-US")} new rows`, pct(r.winnerFresh)],
            ]}
          />
          {chooseOn === "test" ? (
            <Verdict tone={inflated ? "bad" : "warn"} title={`Reported test accuracy: ${pct(reported)}`}>
              {models === 1
                ? "With one model there is nothing to choose, so the test score is honest — it differs from 50% only by chance."
                : `The winner was the luckiest of ${models.toLocaleString("en-US")} on these ${testRows.toLocaleString("en-US")} test rows. On ${FRESH_ROWS.toLocaleString("en-US")} new rows it scores ${pct(r.winnerFresh)}: the test set has been used to choose, so its score is no longer an estimate of anything.`}
            </Verdict>
          ) : (
            <Verdict tone="good" title={`Reported test accuracy: ${pct(reported)}`}>
              {models === 1
                ? "With one model there is nothing to choose; the validation and test scores differ from 50% only by chance."
                : `The validation score (${pct(r.winnerValidation)}) is inflated by the same luck, but the test set played no part in choosing, so its score is an honest estimate: close to the true 50%, give or take the noise of ${testRows.toLocaleString("en-US")} rows.`}
            </Verdict>
          )}
        </div>
      </div>
      <p className="text-sm text-fg-faint">
        Simulated: every row has a random label and {MAX_MODELS.toLocaleString("en-US")} random yes/no features; model i predicts “yes” when feature i is “yes”.
        Dataset #{seed - SELECTION_SEED + 1}.
      </p>
    </section>
  );
}

export function SplitsLab() {
  return (
    <div className="@container space-y-10">
      <SplitPanel />
      <ReusePanel />
    </div>
  );
}
