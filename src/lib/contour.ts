/*
 * Filled contour bands for a two-parameter loss surface, drawn as one SVG path per band
 * (grid cells grouped by log-loss). Shared by the optimization and optimizer labs.
 */
export function contourBands(
  f: (p: [number, number]) => number,
  fmin: number,
  w1: [number, number],
  w2: [number, number],
  size: number,
  pad: number,
  grid = 72,
  levels = 9,
): string[] {
  const cw = (w1[1] - w1[0]) / grid;
  const ch = (w2[1] - w2[0]) / grid;
  const vals: number[] = [];
  for (let j = 0; j < grid; j++) for (let i = 0; i < grid; i++) vals.push(Math.log(f([w1[0] + (i + 0.5) * cw, w2[0] + (j + 0.5) * ch]) - fmin + 1e-3));
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const paths = Array.from({ length: levels }, () => "");
  const px = (size - 2 * pad) / grid;
  for (let j = 0; j < grid; j++)
    for (let i = 0; i < grid; i++) {
      const level = Math.min(levels - 1, Math.floor(((vals[j * grid + i] - lo) / (hi - lo)) * levels));
      paths[level] += `M${(pad + i * px).toFixed(2)} ${(size - pad - (j + 1) * px).toFixed(2)}h${px.toFixed(2)}v${px.toFixed(2)}h${(-px).toFixed(2)}Z`;
    }
  return paths;
}
