/*
 * Output size and receptive field through a stack of convolution / pooling layers, for the
 * "Pooling and CNN architectures" lab. For each layer with kernel k, stride s and padding p:
 *   size  ← ⌊(size + 2p − k) / s⌋ + 1
 *   field ← field + (k − 1) × jump        (how many input pixels one output can see, per side)
 *   jump  ← jump × s                      (input pixels between neighbouring outputs)
 * Residual shortcuts do not enlarge the field, so a ResNet's is that of its longest path.
 */
export interface Layer {
  name: string;
  k: number;
  s: number;
  p: number;
}

export function trace(layers: readonly Layer[], input: number) {
  let size = input;
  let field = 1;
  let jump = 1;
  return layers.map((l) => {
    size = Math.floor((size + 2 * l.p - l.k) / l.s) + 1;
    field += (l.k - 1) * jump;
    jump *= l.s;
    return { ...l, size, field, jump };
  });
}

const conv = (name: string, k = 3, s = 1, p = 1): Layer => ({ name, k, s, p });
const stage = (n: number, s: number): Layer[] => [conv(`layer${n}: block 1, conv 1${s > 1 ? " (stride 2)" : ""}`, 3, s), conv(`layer${n}: block 1, conv 2`), conv(`layer${n}: block 2, conv 1`), conv(`layer${n}: block 2, conv 2`)];

export const PRESETS: Record<string, { label: string; input: number; layers: Layer[] }> = {
  course: {
    label: "This course’s digit CNN",
    input: 8,
    layers: [conv("conv 3 × 3", 3, 1, 0), { name: "max-pool 2 × 2", k: 2, s: 2, p: 0 }],
  },
  stacked: {
    label: "Three 3 × 3 convolutions (VGG style)",
    input: 32,
    layers: [conv("conv 3 × 3"), conv("conv 3 × 3"), conv("conv 3 × 3"), { name: "max-pool 2 × 2", k: 2, s: 2, p: 0 }],
  },
  resnet18: {
    label: "ResNet-18 (main path)",
    input: 224,
    layers: [{ name: "conv1: 7 × 7, stride 2", k: 7, s: 2, p: 3 }, { name: "max-pool 3 × 3, stride 2", k: 3, s: 2, p: 1 }, ...stage(1, 1), ...stage(2, 2), ...stage(3, 2), ...stage(4, 2)],
  },
};
