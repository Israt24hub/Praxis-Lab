import type { ReactElement } from "react";

import type { ConceptId } from "@/types/content";

/*
 * Explanatory 2D diagrams for the six "Learn by visualizing" concepts.
 * All use the shared .dg-* classes from globals.css. Values are illustrative
 * except the convolution, whose feature map is computed from the input shown.
 */

function ArrowMarker({ id, color = "var(--color-fg-muted)" }: { id: string; color?: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill={color} />
      </marker>
    </defs>
  );
}

function DataToPrediction() {
  const raw = ["age: 41", "job: technician", "contacted: no", "month: may"];
  const vector = ["0.37", "0", "1", "0", "…", "1"];
  return (
    <svg viewBox="0 0 600 270" className="h-auto w-full" role="img" aria-label="A raw record is preprocessed into a numeric feature vector, the model maps it to an output probability.">
      <ArrowMarker id="dp-arrow" />
      <text x={12} y={30} className="dg-label">raw record</text>
      <rect x={12} y={42} width={150} height={128} rx={8} className="dg-node" />
      {raw.map((line, i) => (
        <text key={line} x={26} y={72 + i * 26} className="dg-mono">{line}</text>
      ))}

      <line x1={168} y1={106} x2={214} y2={106} className="dg-line" markerEnd="url(#dp-arrow)" />
      <text x={192} y={128} textAnchor="middle" className="dg-label">scale,</text>
      <text x={192} y={144} textAnchor="middle" className="dg-label">encode</text>

      <text x={222} y={30} className="dg-label">feature vector x</text>
      {vector.map((v, i) => (
        <g key={`${v}-${i}`}>
          <rect x={222} y={42 + i * 22} width={78} height={22} className="dg-node" />
          <text x={261} y={57 + i * 22} textAnchor="middle" className="dg-mono">{v}</text>
        </g>
      ))}

      <line x1={306} y1={106} x2={352} y2={106} className="dg-line" markerEnd="url(#dp-arrow)" />

      <text x={360} y={30} className="dg-label">model</text>
      <rect x={360} y={72} width={110} height={68} rx={8} fill="var(--color-sunken)" stroke="var(--dg-hl)" strokeWidth={2} />
      <text x={415} y={111} textAnchor="middle" className="dg-mono">f(x; θ)</text>
      <text x={415} y={164} textAnchor="middle" className="dg-label">θ learned</text>
      <text x={415} y={180} textAnchor="middle" className="dg-label">in training</text>

      <line x1={476} y1={106} x2={506} y2={106} className="dg-line" markerEnd="url(#dp-arrow)" />

      <text x={512} y={30} className="dg-label">prediction</text>
      <rect x={512} y={72} width={80} height={68} rx={8} className="dg-node" />
      <text x={552} y={100} textAnchor="middle" className="dg-label">P(yes)</text>
      <text x={552} y={123} textAnchor="middle" className="dg-label-strong">0.23</text>

      <line x1={12} y1={232} x2={592} y2={232} className="dg-grid" />
      <text x={12} y={256} className="dg-label">New records go through the same preprocessing, fitted on training data only.</text>
    </svg>
  );
}

function LearningWeights() {
  const k = 0.003;
  const wMin = 330;
  const yOf = (x: number) => 222 - k * (x - wMin) ** 2;
  const curve = Array.from({ length: 49 }, (_, i) => 80 + i * 10)
    .map((x, i) => `${i === 0 ? "M" : "L"}${x} ${yOf(x).toFixed(1)}`)
    .join(" ");
  // Gradient descent on a quadratic shrinks the distance to the minimum by a constant factor.
  const factor = 0.55;
  const ws = [110];
  for (let i = 0; i < 3; i++) ws.push(wMin - (wMin - ws[i]) * factor);
  const slope = -2 * k * (ws[0] - wMin);
  const y0 = yOf(ws[0]);

  return (
    <svg viewBox="0 0 600 290" className="h-auto w-full" role="img" aria-label="A bowl-shaped loss curve. Starting from a weight far from the minimum, each gradient step moves the weight closer to the minimum.">
      <ArrowMarker id="lw-arrow" color="var(--dg-hl)" />
      <ArrowMarker id="lw-axis" />
      <line x1={60} y1={240} x2={575} y2={240} className="dg-line" markerEnd="url(#lw-axis)" />
      <line x1={60} y1={240} x2={60} y2={22} className="dg-line" markerEnd="url(#lw-axis)" />
      <text x={575} y={264} textAnchor="end" className="dg-label">weight w</text>
      <text x={70} y={22} className="dg-label">loss L(w)</text>

      <path d={curve} className="dg-fg" />

      <line
        x1={ws[0] - 30}
        y1={y0 - slope * 30}
        x2={ws[0] + 30}
        y2={y0 + slope * 30}
        stroke="var(--color-fg-muted)"
        strokeDasharray="4 4"
        strokeWidth={1.5}
      />
      <text x={ws[0] + 16} y={y0 - 10} className="dg-label">slope = ∂L/∂w</text>

      {ws.slice(0, -1).map((w, i) => (
        <line
          key={w}
          x1={w}
          y1={yOf(w)}
          x2={ws[i + 1] - 4}
          y2={yOf(ws[i + 1]) - 3}
          className="dg-accent"
          markerEnd="url(#lw-arrow)"
        />
      ))}
      {ws.map((w, i) => (
        <g key={`p-${w}`}>
          <circle cx={w} cy={yOf(w)} r={6} fill={i === 0 ? "var(--dg-ink)" : "var(--dg-hl)"} />
          <text x={w} y={262} textAnchor="middle" className="dg-mono">w{i}</text>
          <line x1={w} y1={244} x2={w} y2={236} className="dg-line" />
        </g>
      ))}
      <text x={wMin} y={262} textAnchor="middle" className="dg-label">min</text>

      <text x={350} y={52} textAnchor="middle" className="dg-mono" style={{ fontSize: 16 }}>w ← w − η · ∂L/∂w</text>
      <text x={350} y={76} textAnchor="middle" className="dg-label">η = learning rate (step size)</text>
    </svg>
  );
}

function ImageFeatures() {
  // 6×6 image: dark left half (0), bright right half (1) — a vertical edge.
  const image = Array.from({ length: 6 }, () => [0, 0, 0, 1, 1, 1]);
  const kernel = [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1],
  ];
  // Valid cross-correlation (what deep-learning libraries call convolution).
  const fmap = Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 4 }, (_, c) =>
      kernel.reduce((sum, row, i) => sum + row.reduce((s, kv, j) => s + kv * image[r + i][c + j], 0), 0),
    ),
  );
  const ic = 25;
  const kc = 30;
  const fc = 30;
  const win = { r: 0, c: 1 };

  return (
    <svg viewBox="0 0 600 270" className="h-auto w-full" role="img" aria-label="A 6 by 6 image with a vertical edge is convolved with a 3 by 3 vertical-edge kernel, producing a 4 by 4 feature map that is bright only where the edge is.">
      <text x={20} y={34} className="dg-label">input image (6×6)</text>
      {image.map((row, r) =>
        row.map((v, c) => (
          <rect
            key={`i-${r}-${c}`}
            x={20 + c * ic}
            y={48 + r * ic}
            width={ic}
            height={ic}
            fill={v ? "var(--dg-pixel-light)" : "var(--dg-pixel-dark)"}
            stroke="var(--color-line)"
          />
        )),
      )}
      <rect x={20 + win.c * ic} y={48 + win.r * ic} width={ic * 3} height={ic * 3} fill="none" stroke="var(--dg-hl)" strokeWidth={2.5} />

      <text x={196} y={130} textAnchor="middle" className="dg-label-strong" style={{ fontSize: 22 }}>∗</text>

      <text x={226} y={34} className="dg-label">kernel (3×3)</text>
      {kernel.map((row, r) =>
        row.map((v, c) => (
          <g key={`k-${r}-${c}`}>
            <rect x={226 + c * kc} y={78 + r * kc} width={kc} height={kc} className="dg-node" />
            <text x={226 + c * kc + kc / 2} y={78 + r * kc + 20} textAnchor="middle" className="dg-mono">{v}</text>
          </g>
        )),
      )}

      <text x={356} y={130} textAnchor="middle" className="dg-label-strong" style={{ fontSize: 22 }}>=</text>

      <text x={384} y={34} className="dg-label">feature map (4×4)</text>
      {fmap.map((row, r) =>
        row.map((v, c) => (
          <g key={`f-${r}-${c}`}>
            <rect
              x={384 + c * fc}
              y={63 + r * fc}
              width={fc}
              height={fc}
              fill={v > 0 ? "var(--dg-hl)" : "var(--color-surface)"}
              stroke="var(--color-line)"
            />
            <text
              x={384 + c * fc + fc / 2}
              y={63 + r * fc + 20}
              textAnchor="middle"
              className="dg-mono"
              style={{ fill: v > 0 ? "var(--dg-on-hl)" : "var(--color-fg-muted)" }}
            >
              {v}
            </text>
          </g>
        )),
      )}
      <rect x={384 + win.c * fc} y={63 + win.r * fc} width={fc} height={fc} fill="none" stroke="var(--dg-ink)" strokeWidth={2.5} />

      <text x={20} y={228} className="dg-label">Multiply the outlined patch by the kernel cell by cell, then add up:</text>
      <text x={20} y={248} className="dg-label">the sum is the outlined value. The map is high only at the edge.</text>
    </svg>
  );
}

function TokensEmbeddings() {
  const tokens = ["un", "believ", "ably", "good"];
  const ids = ["348", "9112", "2307", "1695"];
  const vectors = [
    [0.12, -0.48, 0.31, 0.05, -0.2],
    [0.44, 0.1, -0.36, 0.27, 0.08],
    [-0.15, 0.22, 0.09, -0.41, 0.33],
    [0.38, 0.17, -0.29, 0.21, 0.12],
  ];
  const colX = (i: number) => 128 + i * 116;
  const w = 104;

  return (
    <svg viewBox="0 0 600 300" className="h-auto w-full" role="img" aria-label="The text unbelievably good is split into four tokens, each mapped to an integer ID, and each ID is looked up as a vector of numbers.">
      <ArrowMarker id="te-arrow" />
      <text x={20} y={30} className="dg-label">text</text>
      <text x={128} y={30} className="dg-label-strong">“unbelievably good”</text>

      <text x={20} y={80} className="dg-label">tokens</text>
      {tokens.map((t, i) => (
        <g key={t}>
          <rect x={colX(i)} y={58} width={w} height={34} rx={6} fill="var(--color-sunken)" stroke="var(--dg-hl)" strokeWidth={1.75} />
          <text x={colX(i) + w / 2} y={80} textAnchor="middle" className="dg-mono">{t}</text>
          <line x1={colX(i) + w / 2} y1={96} x2={colX(i) + w / 2} y2={108} className="dg-line" markerEnd="url(#te-arrow)" />
          <text x={colX(i) + w / 2} y={128} textAnchor="middle" className="dg-mono">{ids[i]}</text>
          <line x1={colX(i) + w / 2} y1={136} x2={colX(i) + w / 2} y2={148} className="dg-line" markerEnd="url(#te-arrow)" />
          {vectors[i].map((v, j) => (
            <g key={`${t}-${j}`}>
              <rect x={colX(i)} y={154 + j * 24} width={w} height={24} className="dg-node" />
              <text x={colX(i) + w / 2} y={171 + j * 24} textAnchor="middle" className="dg-mono">
                {v.toFixed(2).replace("-", "−")}
              </text>
            </g>
          ))}
        </g>
      ))}
      <text x={20} y={128} className="dg-label">token ID</text>
      <text x={20} y={172} className="dg-label">embedding</text>
      <text x={20} y={190} className="dg-label">vector</text>
      <text x={20} y={292} className="dg-label">5 dimensions shown; real models use hundreds to thousands.</text>
    </svg>
  );
}

function Attention() {
  const rows: Array<[string, number]> = [
    ["The", 0.03],
    ["animal", 0.52],
    ["didn’t", 0.03],
    ["cross", 0.04],
    ["the", 0.02],
    ["street", 0.14],
    ["because", 0.03],
    ["it", 0.1],
    ["was", 0.03],
    ["tired", 0.06],
  ];
  const scale = 640;
  return (
    <svg viewBox="0 0 600 320" className="h-auto w-full" role="img" aria-label="Attention weights from the token it to each token in the sentence. The largest weight, 0.52, goes to animal.">
      <text x={20} y={26} className="dg-label">attention weights from the query token</text>
      <text x={268} y={26} className="dg-label-strong">“it”</text>
      {rows.map(([token, weight], i) => {
        const y = 46 + i * 24;
        const isQuery = token === "it";
        const isTop = token === "animal";
        return (
          <g key={`${token}-${i}`}>
            <text x={118} y={y + 15} textAnchor="end" className={isQuery || isTop ? "dg-label-strong" : "dg-label"}>
              {token}
            </text>
            <rect
              x={132}
              y={y + 3}
              width={Math.max(weight * scale, 2)}
              height={16}
              rx={3}
              fill={isTop ? "var(--dg-hl)" : "var(--color-line-strong)"}
            />
            <text x={132 + weight * scale + 8} y={y + 15} className="dg-mono">
              {weight.toFixed(2)}
            </text>
          </g>
        );
      })}
      <text x={20} y={312} className="dg-label">Softmax makes the weights sum to 1. “it” then becomes a weighted mix of every token’s value.</text>
    </svg>
  );
}

function FineTuning() {
  const layers = ["Head", "Layer 4", "Layer 3", "Layer 2", "Layer 1"];
  const y = (i: number) => 56 + i * 42;
  return (
    <svg viewBox="0 0 600 310" className="h-auto w-full" role="img" aria-label="Left: a pretrained model with four layers and a head. Right: the same layers frozen, with small trainable LoRA adapters beside each layer and a new trainable task head.">
      <ArrowMarker id="ft-arrow" />
      <text x={30} y={36} className="dg-label">pretrained on general data</text>
      {layers.map((name, i) => (
        <g key={`l-${name}`}>
          <rect x={30} y={y(i)} width={160} height={32} rx={6} className="dg-node" />
          <text x={110} y={y(i) + 21} textAnchor="middle" className="dg-label">{name}</text>
        </g>
      ))}

      <line x1={208} y1={160} x2={330} y2={160} className="dg-line" markerEnd="url(#ft-arrow)" />
      <text x={269} y={148} textAnchor="middle" className="dg-label">+ task data</text>

      <text x={346} y={36} className="dg-label">fine-tuned with LoRA</text>
      {layers.map((name, i) => {
        const isHead = i === 0;
        return (
          <g key={`r-${name}`}>
            <rect
              x={346}
              y={y(i)}
              width={160}
              height={32}
              rx={6}
              fill={isHead ? "var(--dg-hl)" : "var(--color-sunken)"}
              stroke={isHead ? "var(--dg-hl)" : "var(--color-line-strong)"}
              strokeDasharray={isHead ? undefined : "4 3"}
              strokeWidth={1.5}
            />
            <text
              x={426}
              y={y(i) + 21}
              textAnchor="middle"
              className="dg-label"
              style={isHead ? { fill: "var(--dg-on-hl)", fontWeight: 700 } : undefined}
            >
              {isHead ? "New task head" : `${name}, frozen`}
            </text>
            {!isHead ? (
              <g>
                <rect x={514} y={y(i) + 4} width={56} height={24} rx={5} fill="none" stroke="var(--dg-hl)" strokeWidth={2} />
                <text x={542} y={y(i) + 21} textAnchor="middle" className="dg-label" style={{ fill: "var(--dg-hl)" }}>LoRA</text>
              </g>
            ) : null}
          </g>
        );
      })}

      <rect x={30} y={282} width={14} height={14} rx={3} fill="var(--dg-hl)" />
      <text x={52} y={294} className="dg-label">trainable</text>
      <rect x={140} y={282} width={14} height={14} rx={3} fill="none" stroke="var(--color-line-strong)" strokeDasharray="4 3" />
      <text x={162} y={294} className="dg-label">frozen (unchanged)</text>
    </svg>
  );
}

export const conceptDiagrams: Record<ConceptId, () => ReactElement> = {
  "data-to-prediction": DataToPrediction,
  "learning-weights": LearningWeights,
  "image-features": ImageFeatures,
  "tokens-embeddings": TokensEmbeddings,
  attention: Attention,
  "fine-tuning": FineTuning,
};
