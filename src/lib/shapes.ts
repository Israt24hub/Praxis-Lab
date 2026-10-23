/*
 * NumPy's shape rules for elementwise operations (broadcasting), matrix
 * multiplication (@) and reshape, for the "Vectors, matrices and tensors" lab.
 * Results and error messages for + and @ follow NumPy 2.x exactly; the tests
 * compare them with output captured from NumPy (tests/fixtures/numpy-shapes.json).
 */

export type Shape = number[];

export type ShapeResult = { ok: true; shape: Shape; note?: string } | { ok: false; error: string };

/** NumPy's own way of printing a shape: (3,4), (3,) and (). */
export function fmtShape(s: Shape) {
  return s.length === 1 ? `(${s[0]},)` : `(${s.join(",")})`;
}

/** The same shape written for people: (3, 4). */
export function showShape(s: Shape) {
  return s.length === 1 ? `(${s[0]},)` : `(${s.join(", ")})`;
}

export const size = (s: Shape) => s.reduce((a, b) => a * b, 1);

/** Broadcast two shapes: align from the right; each pair must be equal or contain a 1. */
export function broadcast(a: Shape, b: Shape): ShapeResult {
  const n = Math.max(a.length, b.length);
  const out: Shape = [];
  for (let i = 0; i < n; i++) {
    const da = a[a.length - n + i] ?? 1;
    const db = b[b.length - n + i] ?? 1;
    if (da !== db && da !== 1 && db !== 1) {
      return { ok: false, error: `ValueError: operands could not be broadcast together with shapes ${fmtShape(a)} ${fmtShape(b)} ` };
    }
    out.push(da === 1 ? db : da);
  }
  return { ok: true, shape: out };
}

/** One row of the alignment table: the two sizes in a column, right-aligned, and what happens. */
export function broadcastColumns(a: Shape, b: Shape) {
  const n = Math.max(a.length, b.length);
  return Array.from({ length: n }, (_, i) => {
    const da = i - (n - a.length) >= 0 ? a[i - (n - a.length)] : null;
    const db = i - (n - b.length) >= 0 ? b[i - (n - b.length)] : null;
    const ea = da ?? 1;
    const eb = db ?? 1;
    const ok = ea === eb || ea === 1 || eb === 1;
    const stretched = ok && ea !== eb ? (ea === 1 ? "a" : "b") : null;
    return { a: da, b: db, ok, result: ok ? (ea === 1 ? eb : ea) : null, stretched };
  });
}

const SIG = "(n?,k),(k,m?)->(n?,m?)";

/** a @ b, with NumPy's rules: 1-D operands are promoted and the added axis removed; leading axes broadcast. */
export function matmul(a: Shape, b: Shape): ShapeResult {
  for (const [i, s] of [a, b].entries()) {
    if (s.length === 0) {
      return { ok: false, error: `ValueError: matmul: Input operand ${i} does not have enough dimensions (has 0, gufunc core with signature ${SIG} requires 1)` };
    }
  }
  const ka = a[a.length - 1];
  const kb = b.length === 1 ? b[0] : b[b.length - 2];
  if (ka !== kb) {
    return {
      ok: false,
      error: `ValueError: matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature ${SIG} (size ${kb} is different from ${ka})`,
    };
  }
  const batchA = a.length > 2 ? a.slice(0, -2) : [];
  const batchB = b.length > 2 ? b.slice(0, -2) : [];
  const batch = broadcast(batchA, batchB);
  const n = a.length >= 2 ? [a[a.length - 2]] : [];
  const m = b.length >= 2 ? [b[b.length - 1]] : [];
  if (!batch.ok) {
    const remap = (s: Shape) => `${fmtShape(s)}->(${[...s.slice(0, -2), "newaxis", "newaxis"].join(",")})`;
    return {
      ok: false,
      error: `ValueError: operands could not be broadcast together with remapped shapes [original->remapped]: ${remap(a)} ${remap(b)}  and requested shape ${fmtShape([...n, ...m])}`,
    };
  }
  return { ok: true, shape: [...batch.shape, ...n, ...m] };
}

/**
 * reshape with at most one −1 (“work this size out”). The error text is our own
 * plain explanation; NumPy prints −1 dimensions in an unusual way.
 */
export function reshape(s: Shape, target: Shape): ShapeResult {
  const unknown = target.filter((d) => d === -1).length;
  if (unknown > 1) return { ok: false, error: "Only one dimension can be −1 (“work it out”)." };
  const total = size(s);
  const known = target.filter((d) => d !== -1).reduce((x, y) => x * y, 1);
  if (unknown === 1) {
    if (known === 0 || total % known !== 0) {
      return { ok: false, error: `${total.toLocaleString("en-US")} elements cannot be split into groups of ${known.toLocaleString("en-US")}.` };
    }
    return { ok: true, shape: target.map((d) => (d === -1 ? total / known : d)) };
  }
  if (known !== total) {
    return { ok: false, error: `ValueError: cannot reshape array of size ${total} into shape ${fmtShape(target)}` };
  }
  return { ok: true, shape: target.slice() };
}

/** Values 0…n−1 laid out in a nested array of the given shape (row-major, as NumPy does). */
export function arange(shape: Shape): unknown {
  let i = 0;
  const build = (d: number): unknown => (d === shape.length ? i++ : Array.from({ length: shape[d] }, () => build(d + 1)));
  return build(0);
}

/** Transpose a nested array by a permutation of its axes, like numpy.transpose. */
export function transpose(values: unknown, shape: Shape, axes: number[]) {
  const get = (idx: number[]) => idx.reduce<unknown>((v, k) => (v as unknown[])[k], values);
  const newShape = axes.map((a) => shape[a]);
  const build = (prefix: number[]): unknown =>
    prefix.length === newShape.length
      ? get(axes.map((_, j) => prefix[axes.indexOf(j)]))
      : Array.from({ length: newShape[prefix.length] }, (_, k) => build([...prefix, k]));
  return { values: build([]), shape: newShape };
}
