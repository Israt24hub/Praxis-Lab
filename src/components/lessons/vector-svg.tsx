/*
 * Shared SVG pieces for labs that draw vectors on a square coordinate grid.
 */

export interface Plane {
  size: number;
  /** Coordinates shown run from −range to +range on both axes. */
  range: number;
  sx: (v: number) => number;
  sy: (v: number) => number;
}

export function makePlane(size: number, range: number, pad = 28): Plane {
  const scale = (size - 2 * pad) / (2 * range);
  return { size, range, sx: (v) => size / 2 + v * scale, sy: (v) => size / 2 - v * scale };
}

export function Grid({ plane, step = 1, labels = true }: { plane: Plane; step?: number; labels?: boolean }) {
  const { range, sx, sy } = plane;
  const ticks: number[] = [];
  for (let v = -range; v <= range + 1e-9; v += step) ticks.push(Number(v.toFixed(6)));
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={sy(-range)} y2={sy(range)} className="dg-grid" />
          <line x1={sx(-range)} x2={sx(range)} y1={sy(t)} y2={sy(t)} className="dg-grid" />
        </g>
      ))}
      <line x1={sx(-range)} x2={sx(range)} y1={sy(0)} y2={sy(0)} stroke="var(--color-line-strong)" strokeWidth={1.5} />
      <line x1={sx(0)} x2={sx(0)} y1={sy(-range)} y2={sy(range)} stroke="var(--color-line-strong)" strokeWidth={1.5} />
      {labels
        ? ticks
            .filter((t) => t !== 0 && Number.isInteger(t) && Math.abs(t) < range)
            .map((t) => (
              <g key={`l${t}`}>
                <text x={sx(t)} y={sy(0) + 15} textAnchor="middle" className="dg-label">
                  {t}
                </text>
                <text x={sx(0) - 6} y={sy(t) + 4} textAnchor="end" className="dg-label">
                  {t}
                </text>
              </g>
            ))
        : null}
    </g>
  );
}

/** An arrow from (x0, y0) to (x1, y1) in plane coordinates, with a filled head. */
export function Arrow({
  plane,
  from = [0, 0],
  to,
  colour,
  width = 3,
  dashed,
  label,
  labelOffset = [8, -8],
}: {
  plane: Plane;
  from?: [number, number];
  to: [number, number];
  colour: string;
  width?: number;
  dashed?: boolean;
  label?: string;
  labelOffset?: [number, number];
}) {
  const x0 = plane.sx(from[0]);
  const y0 = plane.sy(from[1]);
  const x1 = plane.sx(to[0]);
  const y1 = plane.sy(to[1]);
  const len = Math.hypot(x1 - x0, y1 - y0);
  if (len < 1) return <circle cx={x0} cy={y0} r={3.5} fill={colour} />;
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const head = Math.min(12, len * 0.45);
  const bx = x1 - ux * head;
  const by = y1 - uy * head;
  return (
    <g>
      <line x1={x0} y1={y0} x2={bx} y2={by} stroke={colour} strokeWidth={width} strokeDasharray={dashed ? "6 4" : undefined} strokeLinecap="round" />
      <path d={`M${x1} ${y1} L${bx - uy * head * 0.5} ${by + ux * head * 0.5} L${bx + uy * head * 0.5} ${by - ux * head * 0.5} Z`} fill={colour} />
      {label ? (
        <text x={x1 + labelOffset[0]} y={y1 + labelOffset[1]} className="dg-label-strong" paintOrder="stroke" stroke="var(--color-sunken)" strokeWidth={4}>
          {label}
        </text>
      ) : null}
    </g>
  );
}
