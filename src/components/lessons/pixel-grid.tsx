import type { ReactNode } from "react";

/*
 * A grid of coloured cells — an image, a filter or a feature map — for the Computer Vision labs.
 * Pictures keep their own colours in every theme (they are data); outlines and labels on top use
 * black-and-white double strokes so they show on any fill. Cell text picks black or white by the
 * cell's brightness.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  /** "focus" (default) is a white-and-black dashed outline; any other value is a solid colour. */
  tone?: "focus" | string;
  label?: string;
}

/** Greyscale for values in [0, 1]: 0 is white paper, 1 is black ink, as digits are drawn. */
export const ink = (v: number) => {
  const g = Math.round(255 * (1 - Math.min(1, Math.max(0, v))));
  return `rgb(${g},${g},${g})`;
};

/** Diverging colours for signed values scaled to [−1, 1]: blue for negative, white at 0, orange for positive. */
export function diverging(v: number) {
  const t = Math.min(1, Math.max(-1, v));
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * Math.abs(t));
  return t >= 0 ? `rgb(${lerp(255, 200)},${lerp(255, 82)},${lerp(255, 0)})` : `rgb(${lerp(255, 33)},${lerp(255, 102)},${lerp(255, 172)})`;
}

/** Heat colours for values in [0, 1], from pale yellow to deep red. */
export function heat(v: number) {
  const t = Math.min(1, Math.max(0, v));
  const stops = [
    [255, 255, 229],
    [254, 196, 79],
    [236, 112, 20],
    [153, 52, 4],
  ];
  const s = t * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(s));
  const f = s - i;
  const [r, g, b] = [0, 1, 2].map((k) => Math.round(stops[i][k] + (stops[i + 1][k] - stops[i][k]) * f));
  return `rgb(${r},${g},${b})`;
}

function textOn(fill: string) {
  const m = fill.match(/\d+/g);
  if (!m) return "#000";
  const [r, g, b] = m.map(Number);
  return 0.299 * r + 0.587 * g + 0.114 * b > 140 ? "#000" : "#fff";
}

export function PixelGrid({
  w,
  h,
  fill,
  label,
  text,
  boxes = [],
  maxWidth = 352,
  gridLines = false,
  overlay,
}: {
  w: number;
  h: number;
  /** Colour of the cell at row y, column x. */
  fill: (y: number, x: number) => string;
  label: string;
  text?: (y: number, x: number) => string | null;
  boxes?: Box[];
  maxWidth?: number;
  gridLines?: boolean;
  /** Extra SVG drawn on top, in cell units scaled by `cell`. */
  overlay?: (cell: number) => ReactNode;
}) {
  const cell = 40;
  const W = w * cell;
  const H = h * cell;
  const fontSize = cell * 0.32;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full" style={{ maxWidth }} role="img" aria-label={label}>
      {Array.from({ length: w * h }, (_, k) => {
        const y = Math.floor(k / w);
        const x = k % w;
        const f = fill(y, x);
        const t = text?.(y, x);
        return (
          <g key={k}>
            <rect x={x * cell} y={y * cell} width={cell + 0.5} height={cell + 0.5} fill={f} shapeRendering="crispEdges" />
            {t ? (
              <text x={x * cell + cell / 2} y={y * cell + cell / 2} dy="0.35em" textAnchor="middle" fontSize={fontSize} fill={textOn(f)} className="font-mono tabular-nums">
                {t}
              </text>
            ) : null}
          </g>
        );
      })}
      {gridLines
        ? Array.from({ length: w + h + 2 }, (_, i) =>
            i <= w ? (
              <line key={`v${i}`} x1={i * cell} x2={i * cell} y1={0} y2={H} stroke="rgba(0,0,0,0.18)" strokeWidth={1} />
            ) : (
              <line key={`h${i}`} x1={0} x2={W} y1={(i - w - 1) * cell} y2={(i - w - 1) * cell} stroke="rgba(0,0,0,0.18)" strokeWidth={1} />
            ),
          )
        : null}
      {overlay?.(cell)}
      {boxes.map((b, i) => {
        const r = { x: b.x * cell + 2, y: b.y * cell + 2, width: b.w * cell - 4, height: b.h * cell - 4 };
        return (
          <g key={i}>
            {!b.tone || b.tone === "focus" ? (
              <>
                <rect {...r} fill="none" stroke="#fff" strokeWidth={5} />
                <rect {...r} fill="none" stroke="#000" strokeWidth={2.5} strokeDasharray="7 5" />
              </>
            ) : (
              <>
                <rect {...r} fill="none" stroke="#fff" strokeWidth={6} />
                <rect {...r} fill="none" stroke={b.tone} strokeWidth={3.5} />
              </>
            )}
            {b.label ? (
              <g>
                <rect x={r.x} y={Math.max(0, r.y - 22)} width={b.label.length * 8.6 + 10} height={20} fill={b.tone && b.tone !== "focus" ? b.tone : "#000"} />
                <text x={r.x + 5} y={Math.max(0, r.y - 22) + 14.5} fontSize={14} fill="#fff" fontWeight={600}>
                  {b.label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/** A plain bordered frame for a picture that never needs to scroll. */
export function PictureFrame({ caption, children }: { caption?: ReactNode; children: ReactNode }) {
  return (
    <figure className="min-w-0 rounded-panel border border-line bg-sunken p-3 sm:p-4">
      {children}
      {caption ? <figcaption className="mt-2 text-center text-sm text-fg-muted">{caption}</figcaption> : null}
    </figure>
  );
}
