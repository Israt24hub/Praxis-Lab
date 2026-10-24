"use client";

import { useMemo, useState } from "react";

import { cx } from "@/lib/cx";
import {
  area,
  averagePrecision,
  type BoxXYXY,
  cocoAp,
  disc,
  growMask,
  intersection,
  iou,
  maskScores,
  matchDetections,
  nms,
  precisionRecall,
  shiftMask,
} from "@/lib/detection";
import { APPLES, DETECTIONS, SCENE_H, SCENE_W } from "@/lib/detection-scene";

import { pct, Segmented, Stats, StepSlider, Verdict, ticks } from "./lab-ui";
import { PictureFrame, PixelGrid } from "./pixel-grid";

/*
 * "Object detection and segmentation": IoU between two boxes, non-maximum suppression, the
 * precision–recall curve and average precision of a made-up detector on a made-up picture, and
 * why pixel accuracy is the wrong score for a segmentation mask.
 */

const GOOD = "#1b7a3a";
const BAD = "#c0262d";
const DROPPED = "#6b7280";
const f2 = (v: number) => v.toFixed(2);
const f3 = (v: number) => v.toFixed(3);

function Scene({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} className="mx-auto block h-auto w-full max-w-[640px]" role="img" aria-label={label}>
      <rect width={SCENE_W} height={SCENE_H} fill="#dcefd2" />
      <path d="M0 196 Q 120 150 200 186 T 320 170 L 320 200 L 0 200 Z" fill="#b9dca8" />
      {/* Leaves where the imaginary detector raised false alarms. */}
      {[
        [90, 38, 18, 11],
        [30, 170, 16, 12],
        [237, 35, 14, 9],
        [110, 150, 12, 8],
      ].map(([x, y, rx, ry], i) => (
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#7fb069" transform={`rotate(-25 ${x} ${y})`} />
      ))}
      {APPLES.map((b, i) => {
        const cxp = (b[0] + b[2]) / 2;
        const cyp = (b[1] + b[3]) / 2;
        const r = Math.min(b[2] - b[0], b[3] - b[1]) / 2 - 2;
        return (
          <g key={i}>
            <circle cx={cxp} cy={cyp} r={r} fill="#d64541" />
            <circle cx={cxp - r * 0.35} cy={cyp - r * 0.35} r={r * 0.22} fill="#f08a80" />
            <path d={`M${cxp} ${cyp - r} q 2 -7 6 -9`} stroke="#5b3a1e" strokeWidth={2.5} fill="none" />
          </g>
        );
      })}
      {children}
    </svg>
  );
}

function BoxShape({ b, color, dashed, label, thin }: { b: BoxXYXY; color: string; dashed?: boolean; label?: string; thin?: boolean }) {
  const r = { x: b[0], y: b[1], width: b[2] - b[0], height: b[3] - b[1] };
  return (
    <g>
      <rect {...r} fill="none" stroke="#fff" strokeWidth={thin ? 3 : 4.5} opacity={dashed ? 0.7 : 1} />
      <rect {...r} fill="none" stroke={color} strokeWidth={thin ? 1.5 : 2.5} strokeDasharray={dashed ? "5 4" : undefined} />
      {label ? (
        <g>
          <rect x={b[0]} y={Math.max(0, b[1] - 13)} width={label.length * 6.2 + 6} height={13} fill={color} />
          <text x={b[0] + 3} y={Math.max(0, b[1] - 13) + 10} fontSize={10} fill="#fff" fontWeight={600}>
            {label}
          </text>
        </g>
      ) : null}
    </g>
  );
}

function IouPanel() {
  const gt = APPLES[0];
  const [dx, setDx] = useState(20); // +10 px
  const [dy, setDy] = useState(15); // 0 px
  const [scale, setScale] = useState(4);
  const SCALES = [0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4];
  const MOVES = ticks(-30, 30, 2);
  const k = SCALES[scale];
  const w = (gt[2] - gt[0]) * k;
  const h = (gt[3] - gt[1]) * k;
  const cxp = (gt[0] + gt[2]) / 2 + MOVES[dx];
  const cyp = (gt[1] + gt[3]) / 2 + MOVES[dy];
  const pred: BoxXYXY = [cxp - w / 2, cyp - h / 2, cxp + w / 2, cyp + h / 2];
  const inter = intersection(pred, gt);
  const union = area(pred) + area(gt) - inter;
  const o = iou(pred, gt);
  const ix: BoxXYXY = [Math.max(pred[0], gt[0]), Math.max(pred[1], gt[1]), Math.min(pred[2], gt[2]), Math.min(pred[3], gt[3])];
  return (
    <section aria-labelledby="dt-iou" className="space-y-5">
      <h3 id="dt-iou" className="font-semibold">
        1. How much do two boxes overlap?
      </h3>
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @3xl:grid-cols-3">
        <StepSlider label="Move the prediction right" values={MOVES} index={dx} onChange={setDx} format={(v) => `${v > 0 ? "+" : ""}${v} px`.replace("-", "−")} />
        <StepSlider label="Move it down" values={MOVES} index={dy} onChange={setDy} format={(v) => `${v > 0 ? "+" : ""}${v} px`.replace("-", "−")} />
        <StepSlider label="Size" values={SCALES} index={scale} onChange={setScale} format={(v) => `${Math.round(v * 100)}%`} />
      </div>
      <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <PictureFrame caption="Dashed: the true box around the apple. Solid: the prediction. Shaded: their intersection.">
          <Scene label={`The true box and a predicted box overlapping with IoU ${f2(o)}.`}>
            {inter > 0 ? <rect x={ix[0]} y={ix[1]} width={ix[2] - ix[0]} height={ix[3] - ix[1]} fill="#1d4ed8" opacity={0.35} /> : null}
            <BoxShape b={gt} color="#000" dashed />
            <BoxShape b={pred} color="#1d4ed8" />
          </Scene>
        </PictureFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            columns={2}
            items={[
              ["intersection", `${Math.round(inter).toLocaleString("en-GB")} px²`],
              ["union", `${Math.round(union).toLocaleString("en-GB")} px²`],
              ["IoU = intersection ÷ union", f3(o)],
              ["true box area", `${area(gt).toLocaleString("en-GB")} px²`],
            ]}
          />
          <Verdict tone={o >= 0.75 ? "good" : o >= 0.5 ? "warn" : "bad"} title={o >= 0.75 ? "A hit even under a strict 0.75 threshold" : o >= 0.5 ? "A hit at IoU 0.5, a miss at 0.75" : "A miss: IoU below 0.5"}>
            Moving the box 10 pixels, a fifth of its width, already drops IoU to 0.667: the intersection shrinks while the union grows. Size matters as much — a
            perfectly centred box at 60% of the size scores only 0.36, because IoU compares areas.
          </Verdict>
        </div>
      </div>
    </section>
  );
}

const NMS_STEPS = ["0.3", "0.4", "0.5", "0.6", "0.7", "off"] as const;
const LOOSE = "Every duplicate counts as a false positive, because an apple can be matched only once. Duplicates with high scores rank above real apples and pull precision and AP down.";
const NMS_NOTE: Record<(typeof NMS_STEPS)[number], { tone: "good" | "warn" | "bad"; title: string; text: string }> = {
  "0.3": {
    tone: "bad",
    title: "Too strict: a real apple was deleted",
    text: "The two touching apples at the bottom have boxes that overlap by 0.33, so the lower-scoring one is suppressed as if it were a duplicate.",
  },
  "0.4": { tone: "good", title: "Each apple keeps exactly one box", text: "Every duplicate is gone and both touching apples survive. Only the three false alarms on leaves remain; NMS cannot remove those." },
  "0.5": {
    tone: "good",
    title: "One weak duplicate survives",
    text: "A second box on the middle apple (score 0.30) overlaps the first by only 0.47. It ranks below every real apple, so here it does not change AP.",
  },
  "0.6": { tone: "warn", title: "Too loose: duplicates survive", text: LOOSE },
  "0.7": { tone: "warn", title: "Too loose: nothing is suppressed", text: LOOSE },
  off: { tone: "warn", title: "No suppression", text: LOOSE },
};

function DetectionPanels() {
  const [nmsIndex, setNmsIndex] = useState(2);
  const [matchAt, setMatchAt] = useState<"0.5" | "0.75">("0.5");
  const boxes = DETECTIONS.map((d) => d.box);
  const scores = DETECTIONS.map((d) => d.score);
  const thr = NMS_STEPS[nmsIndex];
  const keep = useMemo(() => (thr === "off" ? boxes.map((_, i) => i) : nms(boxes, scores, Number(thr))), [thr]); // eslint-disable-line react-hooks/exhaustive-deps
  const kept = keep.map((i) => boxes[i]);
  const keptScores = keep.map((i) => scores[i]);
  const matches = matchDetections(kept, keptScores, APPLES, Number(matchAt));
  const pr = precisionRecall(matches, APPLES.length);
  const ap = averagePrecision(matches, APPLES.length);
  const coco = cocoAp(kept, keptScores, APPLES);
  const missed = APPLES.length - matches.filter((m) => m.tp).length;
  const ap50 = averagePrecision(matchDetections(kept, keptScores, APPLES, 0.5), APPLES.length);

  // Precision–recall chart.
  const W = 360;
  const H = 220;
  const L = 44;
  const B = 34;
  const X = (r: number) => L + r * (W - L - 12);
  const Y = (p: number) => H - B - p * (H - B - 10);
  const env = pr.map((p) => p.precision);
  for (let i = env.length - 2; i >= 0; i--) env[i] = Math.max(env[i], env[i + 1]);
  let path = `M${X(0)} ${Y(env[0] ?? 0)}`;
  pr.forEach((p, i) => (path += ` H${X(p.recall)} V${Y(env[i])}`));
  path += ` H${X(pr.at(-1)?.recall ?? 0)}`;

  return (
    <>
      <section aria-labelledby="dt-nms" className="space-y-5">
        <h3 id="dt-nms" className="font-semibold">
          2. Many boxes per apple: non-maximum suppression
        </h3>
        <p className="text-sm text-fg-muted">
          A made-up detector proposed {DETECTIONS.length} scored boxes for the {APPLES.length} apples. NMS keeps the highest-scoring box, deletes every box that
          overlaps it by more than the threshold, and repeats.
        </p>
        <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
          <StepSlider label="NMS overlap threshold (IoU)" values={NMS_STEPS.map((_, i) => i)} index={nmsIndex} onChange={setNmsIndex} format={(i) => (NMS_STEPS[i] === "off" ? "off (keep all)" : NMS_STEPS[i])} />
        </div>
        <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <PictureFrame caption={`Kept boxes are solid with their scores (green: matched an apple at IoU ${matchAt}; red: false alarm or duplicate). Removed boxes are grey dashes.`}>
            <Scene label={`${keep.length} of ${DETECTIONS.length} boxes kept by NMS at ${thr}; ${missed} of ${APPLES.length} apples missed at IoU ${matchAt}.`}>
              {boxes.map((b, i) => (keep.includes(i) ? null : <BoxShape key={i} b={b} color={DROPPED} dashed thin />))}
              {matches.map((m) => (
                <BoxShape key={m.det} b={kept[m.det]} color={m.tp ? GOOD : BAD} label={f2(m.score)} />
              ))}
            </Scene>
          </PictureFrame>
          <div className="min-w-0 space-y-4">
            <Stats
              columns={2}
              items={[
                ["boxes kept", `${keep.length} of ${DETECTIONS.length}`],
                [`apples found (IoU ≥ ${matchAt})`, `${APPLES.length - missed} of ${APPLES.length}`],
                ["false alarms and duplicates", String(matches.filter((m) => !m.tp).length)],
                ["AP at IoU 0.5", f3(ap50)],
              ]}
            />
            <Verdict tone={NMS_NOTE[thr].tone} title={NMS_NOTE[thr].title}>
              {NMS_NOTE[thr].text}
            </Verdict>
          </div>
        </div>
      </section>

      <section aria-labelledby="dt-ap" className="space-y-5">
        <h3 id="dt-ap" className="font-semibold">
          3. Precision, recall and average precision
        </h3>
        <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
          <Segmented
            legend="A detection counts as correct when its IoU with an unmatched apple is at least"
            value={matchAt}
            onChange={setMatchAt}
            options={[
              ["0.5", "0.5 (PASCAL VOC)"],
              ["0.75", "0.75 (strict)"],
            ]}
          />
        </div>
        <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="overflow-x-auto rounded-panel border border-line bg-surface">
            <table className="w-full min-w-[20rem] border-collapse text-sm">
              <caption className="sr-only">Kept detections from highest score down, with running precision and recall</caption>
              <thead>
                <tr className="border-b border-line text-left">
                  <th scope="col" className="px-3 py-1.5 font-semibold">
                    Score
                  </th>
                  <th scope="col" className="px-3 py-1.5 text-right font-semibold">
                    best IoU
                  </th>
                  <th scope="col" className="px-3 py-1.5 font-semibold">
                    result
                  </th>
                  <th scope="col" className="px-3 py-1.5 text-right font-semibold">
                    precision
                  </th>
                  <th scope="col" className="px-3 py-1.5 text-right font-semibold">
                    recall
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {matches.map((m, i) => (
                  <tr key={m.det} className="border-b border-line last:border-0">
                    <th scope="row" className="px-3 py-1 text-left font-normal">
                      {f2(m.score)}
                    </th>
                    <td className="px-3 py-1 text-right">{f2(m.bestIou)}</td>
                    <td className={cx("px-3 py-1 font-sans", m.tp ? "text-fg" : "font-semibold text-fg")}>{m.tp ? "hit" : m.bestIou >= Number(matchAt) ? "duplicate" : "miss"}</td>
                    <td className="px-3 py-1 text-right">{f2(pr[i].precision)}</td>
                    <td className="px-3 py-1 text-right">{f2(pr[i].recall)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="min-w-0 space-y-4">
            <PictureFrame caption="Precision against recall, made non-increasing (the envelope COCO averages).">
              <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[420px]" role="img" aria-label={`Precision–recall curve; average precision ${f3(ap)}.`}>
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                  <g key={t}>
                    <line x1={L} x2={W - 12} y1={Y(t)} y2={Y(t)} className="dg-grid" />
                    <text x={L - 6} y={Y(t)} dy="0.35em" textAnchor="end" className="dg-label">
                      {t}
                    </text>
                    <text x={X(t)} y={H - B + 16} textAnchor="middle" className="dg-label">
                      {t}
                    </text>
                  </g>
                ))}
                <path d={`${path} V${Y(0)} H${X(0)} Z`} fill="var(--color-primary)" opacity={0.15} />
                <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth={2.5} />
                {pr.map((p, i) => (
                  <circle key={i} cx={X(p.recall)} cy={Y(p.precision)} r={3.5} fill={matches[i].tp ? GOOD : BAD} />
                ))}
                <text x={(L + W) / 2} y={H - 4} textAnchor="middle" className="dg-label">
                  recall
                </text>
              </svg>
            </PictureFrame>
            <Stats
              columns={2}
              items={[
                [`AP at IoU ${matchAt}`, f3(ap)],
                ["COCO AP (IoU 0.50 to 0.95)", f3(coco.mean)],
              ]}
            />
          </div>
        </div>
        <Verdict tone="neutral" title="AP rewards ranking real apples above false alarms, and finding them all">
          AP is the area under the precision–recall envelope. For one class and one picture it is a single number; a dataset’s mAP averages it over classes, and
          COCO also averages over ten IoU thresholds, so loose boxes cost points even when every apple is found.
        </Verdict>
      </section>
    </>
  );
}

const MASK_N = 16;
const TRUTH = disc(MASK_N, 7.5, 7.5, 3.5);
const MASKS = {
  exact: { label: "Perfect", mask: TRUTH },
  shift1: { label: "1 px to the right", mask: shiftMask(TRUTH, MASK_N, 1, 0) },
  shift3: { label: "3 px to the right", mask: shiftMask(TRUTH, MASK_N, 3, 0) },
  grow: { label: "1 px too big", mask: growMask(TRUTH, MASK_N, true) },
  shrink: { label: "1 px too small", mask: growMask(TRUTH, MASK_N, false) },
  empty: { label: "Nothing (all background)", mask: new Uint8Array(MASK_N * MASK_N) },
} as const;

function MaskPanel() {
  const [which, setWhich] = useState<keyof typeof MASKS>("empty");
  const pred = MASKS[which].mask;
  const s = maskScores(pred, TRUTH);
  const fill = (y: number, x: number) => {
    const i = y * MASK_N + x;
    return pred[i] && TRUTH[i] ? "#1b7a3a" : pred[i] ? "#f59e0b" : TRUTH[i] ? "#c0262d" : "#f3f4f6";
  };
  return (
    <section aria-labelledby="dt-mask" className="space-y-5">
      <h3 id="dt-mask" className="font-semibold">
        4. Segmentation: score the pixels that matter
      </h3>
      <div className="rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented legend="Predicted mask" value={which} onChange={setWhich} options={Object.entries(MASKS).map(([k, v]) => [k as keyof typeof MASKS, v.label] as const)} />
      </div>
      <div className="grid gap-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <PictureFrame caption="Green: object, predicted. Red: object, missed. Amber: background predicted as object. Grey: background.">
          <PixelGrid w={MASK_N} h={MASK_N} fill={fill} label={`True mask of ${s.tp + s.fn} pixels; prediction: ${s.tp} correct, ${s.fn} missed, ${s.fp} extra.`} maxWidth={300} gridLines />
        </PictureFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            columns={3}
            items={[
              ["pixel accuracy", pct(s.pixelAccuracy)],
              ["IoU (Jaccard)", f3(s.iou)],
              ["Dice (F1)", f3(s.dice)],
            ]}
          />
          <Verdict tone={which === "empty" ? "bad" : s.iou >= 0.6 ? "good" : "warn"} title={which === "empty" ? "87.5% pixel accuracy for finding nothing" : `IoU ${f3(s.iou)}, Dice ${f3(s.dice)}`}>
            {which === "empty"
              ? "The object covers 32 of 256 pixels, so calling everything background is right 87.5% of the time. IoU and Dice ignore the easy background and score 0."
              : "IoU = overlap ÷ (overlap + missed + extra). Dice = 2 × overlap ÷ (2 × overlap + missed + extra), always at least as high as IoU. Both ignore correctly predicted background."}
          </Verdict>
        </div>
      </div>
    </section>
  );
}

export function DetectionLab() {
  return (
    <div className="@container space-y-10">
      <IouPanel />
      <DetectionPanels />
      <MaskPanel />
      <p className="text-sm text-fg-faint">The picture, the apples and the detector’s boxes are made up for teaching; every score is computed in your browser.</p>
    </div>
  );
}
