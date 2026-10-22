/*
 * Small deterministic random number generators for the labs. A lab that uses
 * randomness must give the same result for the same seed, in the browser and in
 * the tests, so lessons can quote its numbers.
 */

/** mulberry32: a fast 32-bit generator. Returns a function giving numbers in [0, 1). */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random integer in [0, n). */
export function randInt(rand: () => number, n: number) {
  return Math.floor(rand() * n);
}

/** Fisher–Yates shuffle of a copy of the array. */
export function shuffled<T>(items: readonly T[], rand: () => number) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rand, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * A pseudo-random bit determined by three integers, without any state: the same
 * (seed, a, b) always gives the same bit. Used to give every (feature, row) pair of
 * a large simulated dataset its value without storing the dataset.
 */
export function hashBit(seed: number, a: number, b: number) {
  let h = fmix32(seed ^ 0x9e3779b9);
  h = fmix32(h ^ a);
  h = fmix32(h ^ b);
  return h & 1;
}

/** MurmurHash3's finaliser: every input bit affects every output bit. */
function fmix32(x: number) {
  let h = x >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
