/*
 * Binary classification metrics for the threshold lab. Scores are integers in
 * hundredths (0–100) so thresholds compare exactly; a case is predicted positive
 * when score ≥ threshold. Definitions match scikit-learn's.
 */

export interface Confusion {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export function confusionAt(positive: number[], negative: number[], threshold: number): Confusion {
  const tp = positive.filter((s) => s >= threshold).length;
  const fp = negative.filter((s) => s >= threshold).length;
  return { tp, fp, fn: positive.length - tp, tn: negative.length - fp };
}

export function rates(c: Confusion) {
  const total = c.tp + c.fp + c.fn + c.tn;
  const predictedPos = c.tp + c.fp;
  const precision = predictedPos === 0 ? null : c.tp / predictedPos;
  const recall = c.tp / (c.tp + c.fn);
  const f1 = precision === null || precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return {
    accuracy: (c.tp + c.tn) / total,
    precision,
    recall,
    specificity: c.tn / (c.tn + c.fp),
    falsePositiveRate: c.fp / (c.tn + c.fp),
    f1,
  };
}

/** Distinct thresholds from high to low, each with its confusion matrix. */
function sweep(positive: number[], negative: number[]) {
  const thresholds = [...new Set([...positive, ...negative])].sort((a, b) => b - a);
  return thresholds.map((t) => ({ threshold: t, ...confusionAt(positive, negative, t) }));
}

/** ROC curve points (FPR, TPR), from (0, 0) to (1, 1). */
export function rocCurve(positive: number[], negative: number[]) {
  const pts = [{ fpr: 0, tpr: 0 }];
  for (const c of sweep(positive, negative)) pts.push({ fpr: c.fp / negative.length, tpr: c.tp / positive.length });
  return pts;
}

/** Area under the ROC curve by the trapezoid rule (ties count half, as in scikit-learn). */
export function rocAuc(positive: number[], negative: number[]) {
  const pts = rocCurve(positive, negative);
  let area = 0;
  for (let i = 1; i < pts.length; i++) area += ((pts[i].fpr - pts[i - 1].fpr) * (pts[i].tpr + pts[i - 1].tpr)) / 2;
  return area;
}

/** Precision–recall points (recall, precision), one per distinct threshold. */
export function prCurve(positive: number[], negative: number[]) {
  return sweep(positive, negative).map((c) => ({ recall: c.tp / positive.length, precision: c.tp / (c.tp + c.fp) }));
}

/** Average precision: Σ (R_n − R_{n−1}) · P_n, the same step-wise definition scikit-learn uses. */
export function averagePrecision(positive: number[], negative: number[]) {
  let prev = 0;
  let ap = 0;
  for (const p of prCurve(positive, negative)) {
    ap += (p.recall - prev) * p.precision;
    prev = p.recall;
  }
  return ap;
}
