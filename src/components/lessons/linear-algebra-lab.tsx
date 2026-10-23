"use client";

import { useState } from "react";

import { angleBetween, columns, cosine, det, dot, matVec, norm, presets, rank, type Mat2, type Vec2 } from "@/lib/linalg";

import { ChartFrame, LegendItem, Segmented, Stats, StepSlider, Verdict, ticks } from "./lab-ui";
import { Arrow, Grid, makePlane, type Plane } from "./vector-svg";

/*
 * Two panels, both computed in the browser. 1: two vectors, their sum, their dot
 * product and the projection of one onto the other. 2: a 2 × 2 matrix acting on
 * the plane — the grid, the unit square, the basis vectors and one vector x.
 */

const COORDS = ticks(-4, 4, 0.5);
const ENTRIES = ticks(-2, 2, 0.5);
const idx = (values: number[], v: number) => values.findIndex((x) => Math.abs(x - v) < 1e-9);
const num = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0$/, ""));
const signed = (v: number) => (v < 0 ? `(${num(v)})` : num(v));

const U = "var(--dg-hl)";

/**
 * The horizontal span of some x-coordinates, as fractions of the plane's width (for ChartFrame
 * focus), padded on the right where the arrow labels sit.
 */
const planeFocus = (plane: Plane, xs: number[]): [number, number] => {
  const clip = (v: number) => Math.max(-plane.range, Math.min(plane.range, v));
  return [plane.sx(clip(Math.min(...xs) - 0.5)) / plane.size, plane.sx(clip(Math.max(...xs) + 1)) / plane.size];
};
const V = "var(--color-highlight)";

function DotPanel() {
  const [u, setU] = useState<Vec2>([3, 1]);
  const [v, setV] = useState<Vec2>([1, 2]);
  const plane = makePlane(420, 5);
  const d = dot(u, v);
  const zero = norm(u) === 0 || norm(v) === 0;
  const proj: Vec2 = norm(u) === 0 ? [0, 0] : [(d / dot(u, u)) * u[0], (d / dot(u, u)) * u[1]];
  const sum: Vec2 = [u[0] + v[0], u[1] + v[1]];
  const angle = zero ? null : angleBetween(u, v);

  const slider = (label: string, value: number, set: (x: number) => void) => (
    <StepSlider label={label} values={COORDS} index={idx(COORDS, value)} onChange={(i) => set(COORDS[i])} format={num} />
  );

  return (
    <section aria-labelledby="la-dot" className="space-y-5">
      <h3 id="la-dot" className="font-semibold">
        1. Adding vectors and the dot product
      </h3>
      <div className="grid gap-5 rounded-panel border border-line bg-surface p-4 sm:p-5 @2xl:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-semibold">u = ({num(u[0])}, {num(u[1])})</p>
          {slider("u, first entry", u[0], (x) => setU([x, u[1]]))}
          {slider("u, second entry", u[1], (x) => setU([u[0], x]))}
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold">v = ({num(v[0])}, {num(v[1])})</p>
          {slider("v, first entry", v[0], (x) => setV([x, v[1]]))}
          {slider("v, second entry", v[1], (x) => setV([v[0], x]))}
        </div>
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: vectors u and v, their sum, and the projection of v onto u"
          focus={planeFocus(plane, [0, u[0], v[0], sum[0]])}
          legend={
            <>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke={U} strokeWidth="3" />}>u</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke={V} strokeWidth="3" />}>v</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--dg-ink)" strokeWidth="2" strokeDasharray="6 4" />}>u + v</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-success)" strokeWidth="4" />}>shadow of v on u’s line</LegendItem>
            </>
          }
        >
          <svg viewBox="0 0 420 420" className="mx-auto h-auto w-full max-w-[420px]" role="img" aria-label={`u = (${u.join(", ")}), v = (${v.join(", ")}). Their dot product is ${num(d)}.`}>
            <Grid plane={plane} />
            {/* the parallelogram behind u + v */}
            <path
              d={`M${plane.sx(0)} ${plane.sy(0)} L${plane.sx(u[0])} ${plane.sy(u[1])} L${plane.sx(sum[0])} ${plane.sy(sum[1])} L${plane.sx(v[0])} ${plane.sy(v[1])} Z`}
              fill="var(--dg-hl)"
              fillOpacity={0.07}
              stroke="var(--color-line-strong)"
              strokeDasharray="2 4"
            />
            {!zero ? (
              <>
                <line x1={plane.sx(v[0])} y1={plane.sy(v[1])} x2={plane.sx(proj[0])} y2={plane.sy(proj[1])} stroke="var(--color-fg-faint)" strokeDasharray="2 3" />
                <line x1={plane.sx(0)} y1={plane.sy(0)} x2={plane.sx(proj[0])} y2={plane.sy(proj[1])} stroke="var(--color-success)" strokeWidth={6} strokeOpacity={0.6} strokeLinecap="round" />
              </>
            ) : null}
            <Arrow plane={plane} to={sum} colour="var(--dg-ink)" width={2} dashed label="u + v" />
            <Arrow plane={plane} to={u} colour={U} label="u" />
            <Arrow plane={plane} to={v} colour={V} label="v" />
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <Stats
            items={[
              ["u + v", `(${num(sum[0])}, ${num(sum[1])})`],
              ["2u", `(${num(2 * u[0])}, ${num(2 * u[1])})`],
              ["u · v", num(d)],
              ["length of u", norm(u).toFixed(3)],
              ["length of v", norm(v).toFixed(3)],
              ["angle between", angle === null ? "—" : `${angle.toFixed(1)}°`],
            ]}
          />
          <div className="rounded-panel border border-line bg-surface p-4 text-sm">
            <p className="font-semibold">How the dot product is computed</p>
            <p className="math mt-2">
              u · v = {signed(u[0])} × {signed(v[0])} + {signed(u[1])} × {signed(v[1])} = {num(d)}
            </p>
            {!zero ? (
              <p className="math mt-1 text-fg-muted">
                = |u| |v| cos θ = {norm(u).toFixed(3)} × {norm(v).toFixed(3)} × {cosine(u, v).toFixed(3)}
              </p>
            ) : null}
          </div>
          <Verdict
            tone="neutral"
            title={zero ? "One vector has length zero" : Math.abs(d) < 1e-9 ? "Perpendicular: the dot product is 0" : d > 0 ? "Positive: they point roughly the same way" : "Negative: they point roughly opposite ways"}
          >
            {zero
              ? "The dot product is 0 and the angle is undefined."
              : `The green shadow is how far v reaches along u’s direction: u · v ÷ |u| = ${(d / norm(u)).toFixed(3)}. A neuron computes exactly this kind of weighted sum: weights · inputs.`}
          </Verdict>
        </div>
      </div>
    </section>
  );
}

function MatrixPanel() {
  const [W, setW] = useState<Mat2>([
    [1, 2],
    [3, -1],
  ]);
  const [x, setX] = useState<Vec2>([2, 1]);
  const [preset, setPreset] = useState("custom");
  const plane = makePlane(420, 5);
  const [c1, c2] = columns(W);
  const Wx = matVec(W, x);
  const D = det(W);
  const r = rank(W);

  const setEntry = (i: 0 | 1, j: 0 | 1, value: number) => {
    const next = W.map((row) => row.slice()) as Mat2;
    next[i][j] = value;
    setW(next);
    setPreset("custom");
  };
  const map = (p: Vec2) => matVec(W, p);
  const line = (a: Vec2, b: Vec2) => {
    const A = map(a);
    const B = map(b);
    return `M${plane.sx(A[0])} ${plane.sy(A[1])} L${plane.sx(B[0])} ${plane.sy(B[1])}`;
  };
  const gridLines: string[] = [];
  for (let k = -3; k <= 3; k++) {
    gridLines.push(line([k, -3], [k, 3]));
    gridLines.push(line([-3, k], [3, k]));
  }
  const square = [map([0, 0]), map([1, 0]), map([1, 1]), map([0, 1])];

  return (
    <section aria-labelledby="la-matrix" className="space-y-5">
      <h3 id="la-matrix" className="font-semibold">
        2. A matrix moves the whole plane
      </h3>
      <div className="space-y-5 rounded-panel border border-line bg-surface p-4 sm:p-5">
        <Segmented
          legend="Start from"
          value={preset}
          onChange={(id) => {
            setPreset(id);
            const p = presets.find((q) => q.id === id);
            if (p) setW(p.W.map((row) => row.slice()) as Mat2);
          }}
          options={[["custom", "Example W"], ...presets.map((p) => [p.id, p.label] as const)]}
        />
        <div className="grid gap-5 @2xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            {([0, 1] as const).map((i) =>
              ([0, 1] as const).map((j) => (
                <StepSlider
                  key={`${i}${j}`}
                  label={`W row ${i + 1}, column ${j + 1}`}
                  values={ENTRIES}
                  index={Math.max(0, idx(ENTRIES, W[i][j]))}
                  onChange={(k) => setEntry(i, j, ENTRIES[k])}
                  format={num}
                />
              )),
            )}
          </div>
          <div className="space-y-3">
            <StepSlider label="x, first entry" values={COORDS} index={idx(COORDS, x[0])} onChange={(k) => setX([COORDS[k], x[1]])} format={num} />
            <StepSlider label="x, second entry" values={COORDS} index={idx(COORDS, x[1])} onChange={(k) => setX([x[0], COORDS[k]])} format={num} />
          </div>
        </div>
      </div>
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ChartFrame
          label="Chart: the plane after applying W"
          focus={planeFocus(plane, [0, c1[0], c2[0], c1[0] + c2[0], x[0], Wx[0]])}
          legend={
            <>
              <LegendItem swatch={<rect x="2" y="2" width="16" height="10" fill="var(--dg-hl)" fillOpacity="0.2" stroke="var(--dg-hl)" />}>unit square after W (area = |det W|)</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-success)" strokeWidth="3" />}>W(1, 0) = column 1</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--dg-cat-5)" strokeWidth="3" />}>W(0, 1) = column 2</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke="var(--color-fg-faint)" strokeWidth="2" strokeDasharray="5 4" />}>x</LegendItem>
              <LegendItem swatch={<line x1="0" y1="7" x2="20" y2="7" stroke={V} strokeWidth="3" />}>Wx</LegendItem>
            </>
          }
        >
          <svg viewBox="0 0 420 420" className="mx-auto h-auto w-full max-w-[420px]" role="img" aria-label={`The plane transformed by W = [[${W[0].join(", ")}], [${W[1].join(", ")}]]. Its determinant is ${num(D)}.`}>
            <defs>
              <clipPath id="la-clip">
                <rect x={plane.sx(-5)} y={plane.sy(5)} width={plane.sx(5) - plane.sx(-5)} height={plane.sy(-5) - plane.sy(5)} />
              </clipPath>
            </defs>
            <Grid plane={plane} />
            <g clipPath="url(#la-clip)">
              <path d={gridLines.join(" ")} stroke="var(--dg-hl)" strokeOpacity={0.45} strokeWidth={1.25} fill="none" />
              <path
                d={`M${square.map((p) => `${plane.sx(p[0])} ${plane.sy(p[1])}`).join(" L")} Z`}
                fill="var(--dg-hl)"
                fillOpacity={0.2}
                stroke="var(--dg-hl)"
                strokeWidth={1.5}
              />
            </g>
            <Arrow plane={plane} to={x} colour="var(--color-fg-faint)" width={2} dashed label="x" labelOffset={[-18, -8]} />
            <Arrow plane={plane} to={c1} colour="var(--color-success)" />
            <Arrow plane={plane} to={c2} colour="var(--dg-cat-5)" />
            <Arrow plane={plane} to={Wx} colour={V} label="Wx" />
          </svg>
        </ChartFrame>
        <div className="min-w-0 space-y-4">
          <div className="rounded-panel border border-line bg-surface p-4 text-sm">
            <p className="font-semibold">Each entry of Wx is one row of W dotted with x</p>
            <p className="math mt-2">
              row 1: {signed(W[0][0])} × {signed(x[0])} + {signed(W[0][1])} × {signed(x[1])} = {num(Wx[0])}
            </p>
            <p className="math">
              row 2: {signed(W[1][0])} × {signed(x[0])} + {signed(W[1][1])} × {signed(x[1])} = {num(Wx[1])}
            </p>
          </div>
          <Stats
            items={[
              ["Wx", `(${num(Wx[0])}, ${num(Wx[1])})`],
              ["det W (area scale)", num(D)],
              ["rank", r === 2 ? "2 (the plane)" : r === 1 ? "1 (a line)" : "0 (a point)"],
            ]}
          />
          <Verdict tone={r < 2 ? "warn" : "neutral"} title={r < 2 ? "W squashes the plane: information is lost" : D < 0 ? "W flips the plane over" : "W keeps the plane two-dimensional"}>
            {preset !== "custom" ? `${presets.find((p) => p.id === preset)?.note} ` : null}
            {r < 2
              ? "Different inputs now land on the same output, so x cannot be recovered from Wx."
              : `The unit square becomes a parallelogram of area ${num(Math.abs(D))}. Its sides are W’s columns: where (1, 0) and (0, 1) go.`}
          </Verdict>
        </div>
      </div>
    </section>
  );
}

export function LinearAlgebraLab() {
  return (
    <div className="@container space-y-10">
      <DotPanel />
      <MatrixPanel />
      <p className="text-sm text-fg-faint">Every value is computed in your browser from the entries you set.</p>
    </div>
  );
}
