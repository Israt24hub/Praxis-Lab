/*
 * k-means, feature standardisation and two-feature PCA for the clustering labs.
 * Pure functions, shared by the browser labs and the tests.
 */
import { mulberry32 } from "./rng.ts";

export type Vec = number[];

/** Standardise each column to mean 0 and standard deviation 1 (population SD, like scikit-learn's StandardScaler). */
export function standardize(rows: Vec[]) {
  const d = rows[0].length;
  const n = rows.length;
  const mean = Array.from({ length: d }, (_, j) => rows.reduce((s, r) => s + r[j], 0) / n);
  const sd = Array.from({ length: d }, (_, j) => Math.sqrt(rows.reduce((s, r) => s + (r[j] - mean[j]) ** 2, 0) / n) || 1);
  return {
    rows: rows.map((r) => r.map((v, j) => (v - mean[j]) / sd[j])),
    mean,
    sd,
    /** Map a point from standardised units back to the original units. */
    unscale: (v: Vec) => v.map((x, j) => x * sd[j] + mean[j]),
  };
}

function dist2(a: Vec, b: Vec) {
  let s = 0;
  for (let j = 0; j < a.length; j++) s += (a[j] - b[j]) ** 2;
  return s;
}

/** Initial centres: k different data points chosen at random with the given seed. */
export function initCentres(rows: Vec[], k: number, seed: number): Vec[] {
  const rand = mulberry32(seed);
  const idx = rows.map((_, i) => i);
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(rand() * (idx.length - i));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, k).map((i) => rows[i].slice());
}

/** Assignment step: each point joins its nearest centre (ties go to the lower-numbered centre). */
export function assign(rows: Vec[], centres: Vec[]) {
  return rows.map((r) => {
    let best = 0;
    let bestD = Infinity;
    centres.forEach((c, i) => {
      const d = dist2(r, c);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  });
}

/** Update step: each centre moves to the mean of its points. A centre with no points stays where it is. */
export function update(rows: Vec[], labels: number[], centres: Vec[]) {
  return centres.map((c, i) => {
    const members = rows.filter((_, n) => labels[n] === i);
    if (members.length === 0) return c.slice();
    return c.map((_, j) => members.reduce((s, r) => s + r[j], 0) / members.length);
  });
}

/** Sum of squared distances from each point to its own centre (scikit-learn calls it inertia). */
export function inertia(rows: Vec[], labels: number[], centres: Vec[]) {
  return rows.reduce((s, r, n) => s + dist2(r, centres[labels[n]]), 0);
}

export interface KMeansResult {
  centres: Vec[];
  labels: number[];
  inertia: number;
  /** Number of assign-and-update rounds until nothing changed. */
  iterations: number;
}

/** Lloyd's algorithm from given starting centres, until the assignment stops changing. */
export function lloyd(rows: Vec[], start: Vec[], maxIter = 300): KMeansResult {
  let centres = start.map((c) => c.slice());
  let labels = assign(rows, centres);
  let iterations = 0;
  for (let it = 0; it < maxIter; it++) {
    centres = update(rows, labels, centres);
    iterations++;
    const next = assign(rows, centres);
    const changed = next.some((l, i) => l !== labels[i]);
    labels = next;
    if (!changed) break;
  }
  return { centres, labels, inertia: inertia(rows, labels, centres), iterations };
}

/** k-means from one random start. */
export function kmeans(rows: Vec[], k: number, seed: number) {
  return lloyd(rows, initCentres(rows, k, seed));
}

/** Run k-means from several random starts (seeds 1…starts) and keep the lowest inertia, as scikit-learn's n_init does. */
export function kmeansBest(rows: Vec[], k: number, starts = 10) {
  let best: KMeansResult | null = null;
  for (let s = 1; s <= starts; s++) {
    const r = kmeans(rows, k, s);
    if (!best || r.inertia < best.inertia - 1e-9) best = r;
  }
  return best as KMeansResult;
}

/**
 * Principal components of two-feature data, from the 2 × 2 covariance matrix.
 * Components are unit vectors, sorted by variance; each is signed so that its
 * largest entry is positive. Explained-variance ratios sum to 1.
 */
export function pca2(rows: Vec[]) {
  const n = rows.length;
  const mx = rows.reduce((s, r) => s + r[0], 0) / n;
  const my = rows.reduce((s, r) => s + r[1], 0) / n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const [x, y] of rows) {
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
    sxy += (x - mx) * (y - my);
  }
  sxx /= n - 1;
  syy /= n - 1;
  sxy /= n - 1;
  const tr = sxx + syy;
  const disc = Math.sqrt(((sxx - syy) / 2) ** 2 + sxy ** 2);
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  // Eigenvector for eigenvalue l: (l − syy, sxy), unless the features are uncorrelated.
  const signed = (v: Vec): Vec => {
    const len = Math.hypot(v[0], v[1]);
    const u = [v[0] / len, v[1] / len];
    const big = Math.abs(u[0]) >= Math.abs(u[1]) ? u[0] : u[1];
    return big < 0 ? [-u[0], -u[1]] : u;
  };
  const first: Vec = Math.abs(sxy) > 1e-12 ? signed([l1 - syy, sxy]) : sxx >= syy ? [1, 0] : [0, 1];
  const second: Vec = signed([-first[1], first[0]]);
  return {
    mean: [mx, my],
    variances: [l1, l2],
    ratios: [l1 / tr, l2 / tr],
    components: [first, second],
  };
}

/**
 * Agreement between clusters and known groups: for each cluster, count the points
 * from its most common group. Returns that count (out of all points).
 */
export function purity(labels: number[], groups: number[]) {
  const byCluster = new Map<number, Map<number, number>>();
  labels.forEach((l, i) => {
    const m = byCluster.get(l) ?? new Map<number, number>();
    m.set(groups[i], (m.get(groups[i]) ?? 0) + 1);
    byCluster.set(l, m);
  });
  let total = 0;
  for (const m of byCluster.values()) total += Math.max(...m.values());
  return total;
}

/**
 * Agreement when clusters and groups are matched one to one (the best of all
 * matchings): how many points are in the cluster matched to their own group.
 * For up to 6 clusters, all matchings are checked.
 */
export function matchedAgreement(labels: number[], groups: number[]) {
  const k = Math.max(...labels, ...groups) + 1;
  const table = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  labels.forEach((l, i) => table[l][groups[i]]++);
  let best = 0;
  const used = new Array<boolean>(k).fill(false);
  const search = (c: number, sum: number) => {
    if (c === k) {
      best = Math.max(best, sum);
      return;
    }
    for (let g = 0; g < k; g++) {
      if (used[g]) continue;
      used[g] = true;
      search(c + 1, sum + table[c][g]);
      used[g] = false;
    }
  };
  search(0, 0);
  return best;
}
