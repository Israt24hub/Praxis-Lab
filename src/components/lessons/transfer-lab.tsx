"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import type { Digits } from "@/lib/digits";
import { drawTarget, METHOD_LABEL, METHODS, type Method, runMethod, targetTest, TRANSFER_STEPS } from "@/lib/transfer";

import { pct, Segmented, Verdict } from "./lab-ui";
import { ink, PixelGrid } from "./pixel-grid";
import { DigitsCredit, DigitsStatus, useDigits } from "./use-digits";

/*
 * "Image classification and transfer learning": does a network pretrained on digits 0–4 learn
 * digits 5–9 from a handful of examples better than a network trained from scratch? Every model
 * is trained in the browser, one after another, and a running tally collects the draws.
 */

const KS = ["1", "2", "5", "10", "20"] as const;
type K = (typeof KS)[number];
type Result = Partial<Record<Method, number>>;
const METHOD_NOTE: Record<Method, string> = {
  linear: "Logistic regression on the 64 raw pixels. No convolution, no pretraining.",
  scratch: "The small CNN with random starting weights, all trained on the few examples.",
  frozen: "The filters learned on digits 0–4 kept fixed; only a new 5-way head is trained.",
  finetune: "Starts from the filters learned on digits 0–4 and trains everything.",
};

function Lab({ d }: { d: Digits }) {
  const [k, setK] = useState<K>("5");
  const [draw, setDraw] = useState(1);
  // Results of every draw so far, keyed "k:draw"; a draw is complete when all four methods are in.
  const [runs, setRuns] = useState<Record<string, Result>>({});
  const run = useRef(0);
  const kn = Number(k);
  const key = `${kn}:${draw}`;
  const result = runs[key] ?? {};
  const idx = useMemo(() => drawTarget(d, kn, draw), [d, kn, draw]);
  const nTest = useMemo(() => targetTest(d).length, [d]);

  useEffect(() => {
    const id = ++run.current;
    const runKey = `${kn}:${draw}`;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      if (run.current !== id) return;
      const m = METHODS[i];
      const accuracy = runMethod(d, m, kn, draw).accuracy;
      setRuns((r) => ({ ...r, [runKey]: { ...r[runKey], [m]: accuracy } }));
      i++;
      if (i < METHODS.length) timer = setTimeout(next, 0);
    };
    timer = setTimeout(next, 30);
    return () => clearTimeout(timer);
  }, [d, kn, draw]);

  const done = METHODS.every((m) => result[m] !== undefined);
  const draws = Object.entries(runs)
    .filter(([key, r]) => key.startsWith(`${kn}:`) && METHODS.every((m) => r[m] !== undefined))
    .map(([, r]) => r as Record<Method, number>);
  const stat = (m: Method) => {
    const v = draws.map((r) => r[m]);
    return { mean: v.reduce((a, b) => a + b, 0) / Math.max(1, v.length), lo: Math.min(...v), hi: Math.max(...v) };
  };
  const ranked = done ? [...METHODS].sort((a, b) => result[b]! - result[a]!) : [];
  const gap = done ? (result[ranked[0]]! - result[ranked[3]]!) * 100 : 0;
  // Pretraining is compared with the better of the two methods that do not use it.
  const pre = done ? Math.max(result.frozen!, result.finetune!) - Math.max(result.scratch!, result.linear!) : 0;

  return (
    <div className="@container space-y-8">
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented
          legend="Labelled training images per digit (5–9)"
          value={k}
          onChange={(v) => {
            setK(v);
            setDraw(1);
          }}
          options={KS.map((v) => [v, v] as const)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setDraw((n) => n + 1)}
            disabled={!done}
            className={buttonStyles("primary", "px-4 py-2")}
          >
            Draw different examples
          </button>
          <p className="text-sm text-fg-muted" aria-live="polite">
            Draw {draw}: {5 * kn} training images.{" "}
            {done ? "All four models trained." : `Training model ${Object.keys(result).length + 1} of 4…`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <figure className="min-w-0 rounded-panel border border-line bg-sunken p-3 sm:p-4">
          <figcaption className="mb-2 text-sm font-semibold">The only labelled examples the target task gets</figcaption>
          <div className="space-y-1.5">
            {[5, 6, 7, 8, 9].map((c, row) => (
              <div key={c} className="flex items-center gap-2">
                <span className="w-4 font-mono text-sm">{c}</span>
                <div className="flex flex-wrap gap-1">
                  {idx.slice(row * kn, row * kn + kn).map((i) => (
                    <div key={i} className="w-7">
                      <PixelGrid w={8} h={8} fill={(y, x) => ink(d.images[i][y * 8 + x])} label={`Training image of a ${c}`} maxWidth={28} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </figure>

        <div className="min-w-0 space-y-3">
          <p className="text-sm font-semibold">
            Accuracy on all {nTest} test images of 5–9 ({TRANSFER_STEPS} training steps each)
          </p>
          <ul className="space-y-3">
            {METHODS.map((m) => {
              const v = result[m];
              return (
                <li key={m}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold">{METHOD_LABEL[m]}</span>
                    <span className="font-mono tabular-nums">{v === undefined ? "training…" : pct(v)}</span>
                  </div>
                  <div className="mt-1 h-3 rounded-full bg-sunken" aria-hidden>
                    <div className={cx("h-3 rounded-full", m === "frozen" || m === "finetune" ? "bg-primary" : "bg-fg-muted")} style={{ width: `${(v ?? 0) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-sm text-fg-muted">{METHOD_NOTE[m]}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {done ? (
        <Verdict tone={pre > 0.02 ? "good" : "neutral"} title={pre > 0.02 ? "Pretraining helped on this draw" : "Pretraining made little difference on this draw"}>
          Best: {METHOD_LABEL[ranked[0]]} ({pct(result[ranked[0]]!)}); worst: {METHOD_LABEL[ranked[3]]} ({pct(result[ranked[3]]!)}), a gap of{" "}
          {gap.toFixed(1)} points. Draw different examples a few times: on this tiny problem, which examples you happen to get matters about as much as how you
          train.
        </Verdict>
      ) : null}

      {draws.length ? (
        <div className="overflow-x-auto rounded-panel border border-line bg-surface">
          <table className="w-full min-w-[20rem] border-collapse text-sm">
            <caption className="px-3 pt-3 text-left font-semibold">
              Running tally for {k} per digit: {draws.length} draw{draws.length > 1 ? "s" : ""}
            </caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="px-3 py-2 font-semibold">
                  Method
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  average
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  lowest – highest
                </th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {METHODS.map((m) => {
                const s = stat(m);
                return (
                  <tr key={m} className="border-b border-line last:border-0">
                    <th scope="row" className="px-3 py-2 text-left font-normal">
                      {METHOD_LABEL[m]}
                    </th>
                    <td className="px-3 py-2 text-right font-mono">{pct(s.mean)}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {pct(s.lo)} – {pct(s.hi)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      <DigitsCredit extra="The pretrained filters come from a CNN trained beforehand on digits 0–4 in PyTorch; everything else is trained here." />
    </div>
  );
}

export function TransferLab() {
  const { data, error, retry } = useDigits();
  return data ? <Lab d={data} /> : <DigitsStatus error={error} retry={retry} />;
}
