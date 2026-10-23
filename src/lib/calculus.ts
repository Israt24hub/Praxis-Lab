/*
 * Functions, their exact derivatives and finite-difference estimates, and a small
 * chain-rule example, for the "Derivatives and gradients" lab.
 */
export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export interface Fn {
  id: string;
  label: string;
  f: (x: number) => number;
  df: (x: number) => number;
  range: [number, number];
  yRange: [number, number];
}

export const functions: Fn[] = [
  { id: "square", label: "x²", f: (x) => x * x, df: (x) => 2 * x, range: [-3, 3], yRange: [-1, 9] },
  { id: "cubic", label: "x³ − 3x", f: (x) => x ** 3 - 3 * x, df: (x) => 3 * x * x - 3, range: [-2.5, 2.5], yRange: [-9, 9] },
  { id: "sin", label: "sin x", f: Math.sin, df: Math.cos, range: [-Math.PI, Math.PI], yRange: [-1.5, 1.5] },
  { id: "sigmoid", label: "σ(x)", f: sigmoid, df: (x) => sigmoid(x) * (1 - sigmoid(x)), range: [-6, 6], yRange: [-0.2, 1.2] },
];

/** Forward difference: the slope of the line through x and x + h. */
export const forwardDiff = (f: (x: number) => number, x: number, h: number) => (f(x + h) - f(x)) / h;

/** Central difference: through x − h and x + h. Usually far more accurate for the same h. */
export const centralDiff = (f: (x: number) => number, x: number, h: number) => (f(x + h) - f(x - h)) / (2 * h);

/**
 * One neuron and a squared-error loss: z = w·x + b, a = σ(z), L = (a − y)².
 * Returns every intermediate value and every local derivative, so the chain rule
 * can be shown one factor at a time.
 */
export function neuronChain(w: number, b: number, x: number, y: number) {
  const z = w * x + b;
  const a = sigmoid(z);
  const L = (a - y) ** 2;
  const dL_da = 2 * (a - y);
  const da_dz = a * (1 - a);
  const dz_dw = x;
  const dz_db = 1;
  return {
    z,
    a,
    L,
    dL_da,
    da_dz,
    dz_dw,
    dz_db,
    dL_dw: dL_da * da_dz * dz_dw,
    dL_db: dL_da * da_dz * dz_db,
  };
}
