import type { LearningPath } from "@/types/content";

/*
 * Prerequisite map: the learning paths as a dependency graph.
 * Columns are the depth of each path (longest prerequisite chain).
 */

const NODE_W = 204;
const NODE_H = 46;
const COL_GAP = 52;
const ROW_GAP = 18;

const shortTitles: Record<string, string> = {
  "math-foundations": "Mathematics",
  "ml-foundations": "Machine Learning",
  "deep-learning": "Deep Learning",
  "computer-vision": "Computer Vision",
  "nlp-language-models": "NLP",
  "llms-generative-ai": "Transformers & LLMs",
  "ai-engineering": "AI Engineering",
  "research-paper-writing": "Research & Writing",
};

function depthOf(slug: string, bySlug: Map<string, LearningPath>, seen = new Set<string>()): number {
  const path = bySlug.get(slug);
  if (!path || seen.has(slug) || path.prerequisitePaths.length === 0) return 0;
  seen.add(slug);
  return 1 + Math.max(...path.prerequisitePaths.map((p) => depthOf(p, bySlug, seen)));
}

export function PathMap({ paths }: { paths: LearningPath[] }) {
  const bySlug = new Map(paths.map((p) => [p.slug, p]));
  const columns: LearningPath[][] = [];
  for (const path of paths) {
    const d = depthOf(path.slug, bySlug);
    (columns[d] ??= []).push(path);
  }
  const maxRows = Math.max(...columns.map((c) => c.length));
  const height = maxRows * NODE_H + (maxRows - 1) * ROW_GAP + 40;
  const width = columns.length * NODE_W + (columns.length - 1) * COL_GAP + 4;

  const pos = new Map<string, { x: number; y: number }>();
  columns.forEach((col, ci) => {
    const colHeight = col.length * NODE_H + (col.length - 1) * ROW_GAP;
    const top = 32 + (height - 32 - colHeight) / 2;
    col.forEach((p, ri) => pos.set(p.slug, { x: 2 + ci * (NODE_W + COL_GAP), y: top + ri * (NODE_H + ROW_GAP) }));
  });

  const describe = paths
    .map((p) =>
      p.prerequisitePaths.length
        ? `${p.title} follows ${p.prerequisitePaths.map((s) => bySlug.get(s)?.title).join(" and ")}`
        : `${p.title} has no prerequisite path`,
    )
    .join(". ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={`Prerequisite map. ${describe}.`}>
      <defs>
        <marker id="pm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-line-strong)" />
        </marker>
      </defs>
      {paths.flatMap((p) =>
        p.prerequisitePaths.map((pre) => {
          const a = pos.get(pre);
          const b = pos.get(p.slug);
          if (!a || !b) return null;
          const x1 = a.x + NODE_W;
          const y1 = a.y + NODE_H / 2;
          const x2 = b.x - 2;
          const y2 = b.y + NODE_H / 2;
          const mid = (x1 + x2) / 2;
          return (
            <path
              key={`${pre}-${p.slug}`}
              d={`M${x1} ${y1} C${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
              className="dg-line"
              markerEnd="url(#pm-arrow)"
            />
          );
        }),
      )}
      {paths.map((p) => {
        const { x, y } = pos.get(p.slug)!;
        const isStart = p.prerequisitePaths.length === 0;
        return (
          <g key={p.slug}>
            {isStart ? (
              <text x={x} y={y - 10} className="dg-label">
                Start here
              </text>
            ) : null}
            <rect
              x={x}
              y={y}
              width={NODE_W}
              height={NODE_H}
              rx={8}
              fill="var(--color-surface)"
              stroke={isStart ? "var(--dg-hl)" : "var(--color-fg-muted)"}
              strokeWidth={isStart ? 2 : 1.25}
            />
            <text x={x + 14} y={y + 28} className="dg-label" style={{ fontSize: 13 }}>
              {p.code}
            </text>
            <text x={x + 34} y={y + 28} className="dg-label-strong" style={{ fontSize: 13.5 }}>
              {shortTitles[p.slug] ?? p.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
