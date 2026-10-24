/*
 * The 8×8 handwritten digits used by the Computer Vision labs: the UCI "Optical Recognition of
 * Handwritten Digits" test set as shipped with scikit-learn (E. Alpaydin & C. Kaynak, 1998,
 * CC BY 4.0, doi:10.24432/C50P49). The file public/datasets/digits-8x8.json is made by
 * tests/fixtures/make_digits.py, with a fixed stratified 70/30 train/test split.
 */
export interface DigitsFile {
  pixels: string;
  labels: string;
  split: string;
  maxValue: number;
}

export interface Digits {
  /** Pixel values 0–16, row by row (64 per image), as stored in the dataset. */
  raw: Uint8Array[];
  /** The same images scaled to 0–1, the network's input. */
  images: Float64Array[];
  labels: number[];
  isTest: boolean[];
  train: number[];
  test: number[];
}

export const DIGITS_URL = "/datasets/digits-8x8.json";
export const DIGITS_CREDIT = "UCI Optical Recognition of Handwritten Digits (E. Alpaydin & C. Kaynak, 1998), CC BY 4.0";

export function parseDigits(file: DigitsFile): Digits {
  const n = file.labels.length;
  const raw: Uint8Array[] = [];
  const images: Float64Array[] = [];
  for (let i = 0; i < n; i++) {
    const r = new Uint8Array(64);
    for (let j = 0; j < 64; j++) r[j] = parseInt(file.pixels[i * 64 + j], 17);
    raw.push(r);
    images.push(Float64Array.from(r, (v) => v / file.maxValue));
  }
  const labels = Array.from(file.labels, Number);
  const isTest = Array.from(file.split, (s) => s === "v");
  return {
    raw,
    images,
    labels,
    isTest,
    train: labels.map((_, i) => i).filter((i) => !isTest[i]),
    test: labels.map((_, i) => i).filter((i) => isTest[i]),
  };
}

let cache: Promise<Digits> | null = null;

/** Fetches and parses the digits once per page; later calls share the same promise. */
export function loadDigits(): Promise<Digits> {
  cache ??= fetch(DIGITS_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`Could not load the digits (${r.status})`);
      return r.json() as Promise<DigitsFile>;
    })
    .then(parseDigits)
    .catch((e) => {
      cache = null;
      throw e;
    });
  return cache;
}
