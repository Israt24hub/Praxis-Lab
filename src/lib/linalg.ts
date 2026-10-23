/*
 * Two-dimensional vectors and 2 × 2 matrices for the "Linear algebra essentials"
 * lab. A matrix is written row by row: [[a, b], [c, d]].
 */
export type Vec2 = [number, number];
export type Mat2 = [[number, number], [number, number]];

export const dot = (u: readonly number[], v: readonly number[]) => u.reduce((s, x, i) => s + x * v[i], 0);
export const norm = (u: readonly number[]) => Math.sqrt(dot(u, u));

/** W x: each output entry is one row of W dotted with x. */
export const matVec = (W: Mat2, x: Vec2): Vec2 => [dot(W[0], x), dot(W[1], x)];

/** Where the basis vectors go: the columns of W. */
export const columns = (W: Mat2): [Vec2, Vec2] => [
  [W[0][0], W[1][0]],
  [W[0][1], W[1][1]],
];

/** How W scales area (negative if it also flips orientation). */
export const det = (W: Mat2) => W[0][0] * W[1][1] - W[0][1] * W[1][0];

/** The dimension of the space W maps onto: 2 (the plane), 1 (a line) or 0 (a point). */
export function rank(W: Mat2, eps = 1e-9) {
  if (Math.abs(det(W)) > eps) return 2;
  return W.flat().some((v) => Math.abs(v) > eps) ? 1 : 0;
}

/** Angle between two non-zero vectors, in degrees. */
export function angleBetween(u: Vec2, v: Vec2) {
  const c = dot(u, v) / (norm(u) * norm(v));
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}

/** Cosine similarity: the dot product of the two directions, from −1 to 1. */
export const cosine = (u: Vec2, v: Vec2) => dot(u, v) / (norm(u) * norm(v));

export const fromPolar = (length: number, degrees: number): Vec2 => [length * Math.cos((degrees * Math.PI) / 180), length * Math.sin((degrees * Math.PI) / 180)];

export const presets: { id: string; label: string; W: Mat2; note: string }[] = [
  { id: "identity", label: "Identity", W: [[1, 0], [0, 1]], note: "Leaves every vector where it is." },
  { id: "scale", label: "Stretch", W: [[2, 0], [0, 0.5]], note: "Doubles the first coordinate and halves the second. Area is unchanged (2 × 0.5 = 1)." },
  { id: "rotate", label: "Rotate 90°", W: [[0, -1], [1, 0]], note: "Turns every vector a quarter-turn anticlockwise. Lengths and areas are unchanged." },
  { id: "shear", label: "Shear", W: [[1, 1], [0, 1]], note: "Slides each point sideways in proportion to its height." },
  { id: "flip", label: "Reflect", W: [[-1, 0], [0, 1]], note: "Mirrors left and right. The determinant is negative: orientation flips." },
  { id: "collapse", label: "Collapse", W: [[1, 2], [0.5, 1]], note: "Both columns point the same way, so the whole plane is squashed onto one line. Information is lost." },
];
