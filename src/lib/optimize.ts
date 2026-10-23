/*
 * Gradient descent (with optional momentum) on three two-parameter loss
 * surfaces, for the "Optimization fundamentals" lab. Pure and deterministic.
 */
export type P = [number, number];

export interface Surface {
  id: string;
  label: string;
  f: (p: P) => number;
  grad: (p: P) => P;
  /** Where the minima are, for drawing and for the "distance to minimum" read-out. */
  minima: P[];
  range: { w1: [number, number]; w2: [number, number] };
  start: P;
}

const tiltedRoot = (() => {
  // Stationary points of (w1² − 1)² + 0.4·w1 in w1: 4w1³ − 4w1 + 0.4 = 0, solved by Newton's method.
  const g = (w: number) => 4 * w ** 3 - 4 * w + 0.4;
  const dg = (w: number) => 12 * w * w - 4;
  const solve = (w0: number) => {
    let w = w0;
    for (let i = 0; i < 50; i++) w -= g(w) / dg(w);
    return w;
  };
  return { left: solve(-1.1), right: solve(1) };
})();

export const surfaces: Surface[] = [
  {
    id: "bowl",
    label: "Round bowl",
    f: ([a, b]) => a * a + b * b,
    grad: ([a, b]) => [2 * a, 2 * b],
    minima: [[0, 0]],
    range: { w1: [-3, 3], w2: [-3, 3] },
    start: [-2.5, 2],
  },
  {
    id: "valley",
    label: "Narrow valley",
    f: ([a, b]) => 0.5 * (a * a + 10 * b * b),
    grad: ([a, b]) => [a, 10 * b],
    minima: [[0, 0]],
    range: { w1: [-3, 3], w2: [-3, 3] },
    start: [-2.5, 2],
  },
  {
    id: "twominima",
    label: "Two valleys (not convex)",
    // + 0.5 only lifts the surface so every loss is positive; it changes no gradient.
    f: ([a, b]) => (a * a - 1) ** 2 + 0.4 * a + b * b + 0.5,
    grad: ([a, b]) => [4 * a * (a * a - 1) + 0.4, 2 * b],
    minima: [
      [tiltedRoot.left, 0],
      [tiltedRoot.right, 0],
    ],
    range: { w1: [-2, 2], w2: [-2, 2] },
    start: [0.4, 1.5],
  },
];

export interface Run {
  path: P[];
  losses: number[];
  diverged: boolean;
}

/** Gradient descent: v ← β·v − η·∇f(w); w ← w + v. With β = 0 this is plain gradient descent. */
export function descend(s: Surface, start: P, lr: number, steps: number, momentum = 0): Run {
  let w: P = [start[0], start[1]];
  let v: P = [0, 0];
  const path: P[] = [w];
  const losses = [s.f(w)];
  let diverged = false;
  for (let t = 0; t < steps; t++) {
    const g = s.grad(w);
    v = [momentum * v[0] - lr * g[0], momentum * v[1] - lr * g[1]];
    w = [w[0] + v[0], w[1] + v[1]];
    const L = s.f(w);
    path.push(w);
    losses.push(L);
    if (!Number.isFinite(L) || L > 1e6) {
      diverged = true;
      break;
    }
  }
  return { path, losses, diverged };
}

/** The minimum closest to a point. */
export function nearestMinimum(s: Surface, p: P) {
  let best = s.minima[0];
  let d = Infinity;
  for (const m of s.minima) {
    const dm = Math.hypot(p[0] - m[0], p[1] - m[1]);
    if (dm < d) {
      d = dm;
      best = m;
    }
  }
  return { minimum: best, distance: d, index: s.minima.indexOf(best) };
}
