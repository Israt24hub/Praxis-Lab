/*
 * Polynomial least squares with an optional penalty, for the overfitting lab.
 *
 * The polynomial is written in the Chebyshev basis T₀…T_d on [−1, 1]. It describes
 * exactly the same curves as powers of x, but the equations are far better
 * conditioned, so a degree-11 fit is computed accurately. With penalty λ > 0 the
 * fit minimises  mean squared error + λ · Σ_{k≥1} c_k²  (the constant term is not penalised).
 */

export interface PolyFit {
  degree: number;
  coef: number[];
}

/** T_0(x) … T_d(x). */
export function chebyshevRow(x: number, degree: number) {
  const row = new Array<number>(degree + 1);
  row[0] = 1;
  if (degree >= 1) row[1] = x;
  for (let k = 2; k <= degree; k++) row[k] = 2 * x * row[k - 1] - row[k - 2];
  return row;
}

export function evaluate(fit: PolyFit, x: number) {
  const row = chebyshevRow(x, fit.degree);
  let s = 0;
  for (let k = 0; k <= fit.degree; k++) s += fit.coef[k] * row[k];
  return s;
}

/** Solves A·c = rhs with Gaussian elimination and partial pivoting. A is modified. */
function solve(A: number[][], rhs: number[]) {
  const n = rhs.length;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    [A[col], A[pivot]] = [A[pivot], A[col]];
    [rhs[col], rhs[pivot]] = [rhs[pivot], rhs[col]];
    const d = A[col][col];
    if (Math.abs(d) < 1e-14) throw new Error("singular system");
    for (let r = col + 1; r < n; r++) {
      const f = A[r][col] / d;
      if (f === 0) continue;
      for (let c = col; c < n; c++) A[r][c] -= f * A[col][c];
      rhs[r] -= f * rhs[col];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = rhs[r];
    for (let c = r + 1; c < n; c++) s -= A[r][c] * x[c];
    x[r] = s / A[r][r];
  }
  return x;
}

export function fitPolynomial(xs: number[], ys: number[], degree: number, penalty = 0): PolyFit {
  const m = degree + 1;
  const A = Array.from({ length: m }, () => new Array<number>(m).fill(0));
  const rhs = new Array<number>(m).fill(0);
  for (let i = 0; i < xs.length; i++) {
    const row = chebyshevRow(xs[i], degree);
    for (let a = 0; a < m; a++) {
      rhs[a] += row[a] * ys[i];
      for (let b = 0; b < m; b++) A[a][b] += row[a] * row[b];
    }
  }
  // Penalty scaled by n, so λ means the same thing for 12 and 48 points.
  for (let k = 1; k < m; k++) A[k][k] += penalty * xs.length;
  return { degree, coef: solve(A, rhs) };
}

export function meanSquaredError(fit: PolyFit, xs: number[], ys: number[]) {
  let s = 0;
  for (let i = 0; i < xs.length; i++) s += (evaluate(fit, xs[i]) - ys[i]) ** 2;
  return s / xs.length;
}
