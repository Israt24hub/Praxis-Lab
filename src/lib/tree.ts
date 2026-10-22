/*
 * Classification trees (CART with Gini impurity) and random forests for the
 * "Decision trees and ensemble methods" lab. Two classes, numeric features.
 *
 * The single tree follows scikit-learn's DecisionTreeClassifier: thresholds halfway
 * between neighbouring values, the split that most reduces weighted Gini impurity,
 * and a node is split until it is pure, reaches the depth limit or cannot be split.
 * When two splits are exactly as good, this code keeps the first one found (feature
 * order, then the lowest threshold); scikit-learn picks among such ties at random,
 * so very deep trees can differ slightly between the two.
 */
import { mulberry32, shuffled } from "./rng.ts";

export interface TreeNode {
  /** Training examples of class 0 and class 1 that reach this node. */
  counts: [number, number];
  depth: number;
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

export interface TreeOptions {
  maxDepth?: number;
  /** For forests: consider this many randomly chosen features at each split. Omit to consider all. */
  maxFeatures?: number;
  rand?: () => number;
}

const EPS = 1e-12;

function grow(X: number[][], y: number[], idx: number[], depth: number, opts: TreeOptions): TreeNode {
  let c1 = 0;
  for (const i of idx) c1 += y[i];
  const c0 = idx.length - c1;
  const node: TreeNode = { counts: [c0, c1], depth };
  if ((opts.maxDepth !== undefined && depth >= opts.maxDepth) || c0 === 0 || c1 === 0 || idx.length < 2) return node;

  const nFeatures = X[0].length;
  let features = Array.from({ length: nFeatures }, (_, f) => f);
  if (opts.maxFeatures !== undefined && opts.rand) features = shuffled(features, opts.rand);
  const limit = opts.maxFeatures ?? nFeatures;

  let best: { score: number; feature: number; threshold: number } | null = null;
  let used = 0;
  for (const f of features) {
    if (used >= limit) break;
    const order = idx.slice().sort((a, b) => X[a][f] - X[b][f]);
    const first = X[order[0]][f];
    const last = X[order[order.length - 1]][f];
    if (last <= first + 1e-7) continue; // constant here: does not count towards the limit, as in scikit-learn
    used++;
    const n = order.length;
    let l1 = 0;
    for (let i = 1; i < n; i++) {
      l1 += y[order[i - 1]];
      const lo = X[order[i - 1]][f];
      const hi = X[order[i]][f];
      if (hi <= lo + 1e-7) continue;
      const nl = i;
      const nr = n - i;
      const r1 = c1 - l1;
      // Minimising weighted Gini impurity is the same as maximising this sum.
      const score = (l1 * l1 + (nl - l1) ** 2) / nl + (r1 * r1 + (nr - r1) ** 2) / nr;
      if (!best || score > best.score + EPS) best = { score, feature: f, threshold: (lo + hi) / 2 };
    }
  }
  if (!best) return node;

  const left: number[] = [];
  const right: number[] = [];
  for (const i of idx) (X[i][best.feature] <= best.threshold ? left : right).push(i);
  return {
    ...node,
    feature: best.feature,
    threshold: best.threshold,
    left: grow(X, y, left, depth + 1, opts),
    right: grow(X, y, right, depth + 1, opts),
  };
}

export function fitTree(X: number[][], y: number[], opts: TreeOptions = {}) {
  return grow(
    X,
    y,
    X.map((_, i) => i),
    0,
    opts,
  );
}

function leafOf(node: TreeNode, x: number[]) {
  let n = node;
  while (n.left && n.right && n.feature !== undefined && n.threshold !== undefined) n = x[n.feature] <= n.threshold ? n.left : n.right;
  return n;
}

/** Fraction of class-1 training examples in the leaf that x falls into. */
export function treeProba(node: TreeNode, x: number[]) {
  const { counts } = leafOf(node, x);
  return counts[1] / (counts[0] + counts[1]);
}

/** Majority class of the leaf (ties go to class 0, as in scikit-learn). */
export function treePredict(node: TreeNode, x: number[]) {
  const { counts } = leafOf(node, x);
  return counts[1] > counts[0] ? 1 : 0;
}

/** The questions asked on the way from the root to x's leaf. */
export function tracePath(node: TreeNode, x: number[]) {
  const steps: { feature: number; threshold: number; value: number; goesLeft: boolean }[] = [];
  let n = node;
  while (n.left && n.right && n.feature !== undefined && n.threshold !== undefined) {
    const goesLeft = x[n.feature] <= n.threshold;
    steps.push({ feature: n.feature, threshold: n.threshold, value: x[n.feature], goesLeft });
    n = goesLeft ? n.left : n.right;
  }
  return { steps, leaf: n };
}

export function countLeaves(node: TreeNode): number {
  return node.left && node.right ? countLeaves(node.left) + countLeaves(node.right) : 1;
}

export function treeDepth(node: TreeNode): number {
  return node.left && node.right ? 1 + Math.max(treeDepth(node.left), treeDepth(node.right)) : 0;
}

/**
 * A random forest: each tree is grown to full depth on a bootstrap sample (n draws
 * with replacement), considering one randomly chosen feature at each split
 * (scikit-learn's default for classification is √(number of features), here √2 → 1).
 * The forest's probability is the average of its trees' leaf probabilities.
 */
export function fitForest(X: number[][], y: number[], nTrees: number, seed: number) {
  const rand = mulberry32(seed);
  const maxFeatures = Math.max(1, Math.floor(Math.sqrt(X[0].length)));
  const trees: TreeNode[] = [];
  for (let t = 0; t < nTrees; t++) {
    const idx = Array.from({ length: X.length }, () => Math.floor(rand() * X.length));
    const Xb = idx.map((i) => X[i]);
    const yb = idx.map((i) => y[i]);
    trees.push(fitTree(Xb, yb, { maxFeatures, rand }));
  }
  return trees;
}

export function forestProba(trees: TreeNode[], x: number[]) {
  let s = 0;
  for (const t of trees) s += treeProba(t, x);
  return s / trees.length;
}

export function forestPredict(trees: TreeNode[], x: number[]) {
  return forestProba(trees, x) > 0.5 ? 1 : 0;
}

export function accuracyOf(predict: (x: number[]) => number, X: number[][], y: number[]) {
  let correct = 0;
  X.forEach((x, i) => {
    if (predict(x) === y[i]) correct++;
  });
  return correct / X.length;
}
