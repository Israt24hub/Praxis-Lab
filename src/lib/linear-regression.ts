/*
 * One-feature linear regression trained by full-batch gradient descent.
 * Pure functions so the browser lab and the tests share exactly the same math.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Scaling {
  mean: number;
  std: number;
}

/** Parameters in the space the optimiser works in (raw or standardised x). */
export interface GdState {
  w: number;
  b: number;
  epoch: number;
}

export function meanSquaredError(w: number, b: number, points: Point[]) {
  if (points.length === 0) return 0;
  let sum = 0;
  for (const p of points) {
    const e = w * p.x + b - p.y;
    sum += e * e;
  }
  return sum / points.length;
}

export function scalingOf(points: Point[]): Scaling {
  const n = points.length;
  const mean = points.reduce((s, p) => s + p.x, 0) / n;
  const variance = points.reduce((s, p) => s + (p.x - mean) ** 2, 0) / n;
  return { mean, std: Math.sqrt(variance) || 1 };
}

export function standardise(points: Point[], s: Scaling): Point[] {
  return points.map((p) => ({ x: (p.x - s.mean) / s.std, y: p.y }));
}

/** Converts parameters learned on standardised x back to the original units. */
export function toOriginalUnits(w: number, b: number, s: Scaling | null) {
  if (!s) return { w, b };
  return { w: w / s.std, b: b - (w * s.mean) / s.std };
}

export function gradients(w: number, b: number, points: Point[]) {
  const n = points.length;
  let gw = 0;
  let gb = 0;
  for (const p of points) {
    const e = w * p.x + b - p.y;
    gw += e * p.x;
    gb += e;
  }
  return { gw: (2 / n) * gw, gb: (2 / n) * gb };
}

/** One full-batch gradient-descent step: w ← w − η·∂L/∂w, b ← b − η·∂L/∂b. */
export function gdStep(state: GdState, points: Point[], learningRate: number): GdState & { gradNorm: number } {
  const { gw, gb } = gradients(state.w, state.b, points);
  return {
    w: state.w - learningRate * gw,
    b: state.b - learningRate * gb,
    epoch: state.epoch + 1,
    gradNorm: Math.hypot(gw, gb),
  };
}

/** Closed-form least-squares fit, used as the reference answer. */
export function leastSquares(points: Point[]) {
  const s = scalingOf(points);
  const n = points.length;
  const meanY = points.reduce((acc, p) => acc + p.y, 0) / n;
  const cov = points.reduce((acc, p) => acc + (p.x - s.mean) * (p.y - meanY), 0) / n;
  const w = cov / (s.std * s.std);
  return { w, b: meanY - w * s.mean };
}
