/*
 * A small generated colour image and the standard steps that turn it into model input, for the
 * "Image representation and tensors" lab. The image is drawn by formula (sky, sun, house, grass),
 * so it is the same everywhere and needs no file. Values follow torchvision's conventions.
 */
export const SIZE = 16;

/** The scene as 8-bit RGB, stored height × width × channels (HWC), as image files decode. */
export function makeScene(): Uint8Array {
  const img = new Uint8Array(SIZE * SIZE * 3);
  const put = (x: number, y: number, rgb: [number, number, number]) => img.set(rgb, (y * SIZE + x) * 3);
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      if (y < 10) {
        // Sky, lighter towards the horizon.
        put(x, y, [70 + 9 * y, 130 + 7 * y, 200 + 3 * y]);
        if ((x - 11.5) ** 2 + (y - 3.5) ** 2 <= 6.5) put(x, y, [250, 205, 60]);
      } else put(x, y, [60 + ((x + y) % 3) * 8, 140 + ((x * 7 + y) % 4) * 6, 70]);
    }
  for (let y = 8; y <= 12; y++) for (let x = 3; x <= 7; x++) put(x, y, y === 8 ? [120, 70, 40] : [200, 60, 50]);
  for (let y = 11; y <= 12; y++) put(5, y, [70, 45, 35]);
  put(4, 9, [235, 235, 200]);
  put(6, 9, [235, 235, 200]);
  return img;
}

export type Channel = 0 | 1 | 2;

/** Index of one value in memory for each layout. */
export const indexHWC = (y: number, x: number, c: number, w = SIZE, ch = 3) => (y * w + x) * ch + c;
export const indexCHW = (y: number, x: number, c: number, h = SIZE, w = SIZE) => c * h * w + y * w + x;

/** HWC bytes → CHW floats in [0, 1], as torchvision's ToTensor does. */
export function toTensor(hwc: Uint8Array, h = SIZE, w = SIZE): Float64Array {
  const out = new Float64Array(3 * h * w);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let c = 0; c < 3; c++) out[indexCHW(y, x, c, h, w)] = hwc[indexHWC(y, x, c, w)] / 255;
  return out;
}

/** The per-channel statistics of ImageNet that torchvision's pretrained models expect. */
export const IMAGENET_MEAN = [0.485, 0.456, 0.406];
export const IMAGENET_STD = [0.229, 0.224, 0.225];

export const normalize = (v: number, c: Channel) => (v - IMAGENET_MEAN[c]) / IMAGENET_STD[c];

/** Greyscale by the ITU-R BT.601 weights that torchvision's rgb_to_grayscale uses. */
export const GREY = [0.2989, 0.587, 0.114];
export const grey = (r: number, g: number, b: number) => GREY[0] * r + GREY[1] * g + GREY[2] * b;

/** Average-pool an HWC image by a factor f (16 → 8 → 4), the simplest way to lower resolution. */
export function downsample(hwc: Uint8Array, f: number, size = SIZE): { data: Float64Array; size: number } {
  const n = size / f;
  const out = new Float64Array(n * n * 3);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      for (let c = 0; c < 3; c++) {
        let s = 0;
        for (let a = 0; a < f; a++) for (let b = 0; b < f; b++) s += hwc[indexHWC(y * f + a, x * f + b, c, size)];
        out[indexHWC(y, x, c, n)] = s / (f * f);
      }
  return { data: out, size: n };
}

/** Bytes needed for an image tensor. */
export const tensorBytes = (h: number, w: number, c: number, bytesPerValue: number, batch = 1) => batch * h * w * c * bytesPerValue;
