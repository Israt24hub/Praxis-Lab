/** Train / validation / test split and what each part is allowed to touch. */
export function SplitDiagram() {
  const segments = [
    { label: "Training", share: "70%", x: 20, w: 392, fill: "var(--color-fg-muted)", text: "var(--color-page)" },
    { label: "Validation", share: "15%", x: 412, w: 84, fill: "var(--color-line-strong)", text: "var(--dg-ink)" },
    { label: "Test", share: "15%", x: 496, w: 84, fill: "var(--dg-hl)", text: "var(--dg-on-hl)" },
  ];
  return (
    <svg viewBox="0 0 600 250" className="h-auto w-full" role="img" aria-label="The dataset is split into 70 percent training, 15 percent validation and 15 percent test. Preprocessing and model fitting use training data only; validation is used for tuning; the test set is used once at the end.">
      <defs>
        <marker id="sd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-fg-muted)" />
        </marker>
      </defs>
      <text x={20} y={26} className="dg-label">full dataset, split once before anything is fitted</text>
      {segments.map((s) => (
        <g key={s.label}>
          <rect x={s.x} y={40} width={s.w} height={46} fill={s.fill} stroke="var(--color-sunken)" strokeWidth={2} />
          <text x={s.x + s.w / 2} y={60} textAnchor="middle" style={{ fill: s.text, fontSize: 13, fontWeight: 700 }}>
            {s.label}
          </text>
          <text x={s.x + s.w / 2} y={77} textAnchor="middle" style={{ fill: s.text, fontSize: 12.5 }}>
            {s.share}
          </text>
        </g>
      ))}

      <line x1={216} y1={92} x2={216} y2={128} className="dg-line" markerEnd="url(#sd-arrow)" />
      <rect x={96} y={134} width={240} height={58} rx={8} className="dg-node" />
      <text x={216} y={158} textAnchor="middle" className="dg-label-strong">fit preprocessing + model</text>
      <text x={216} y={178} textAnchor="middle" className="dg-label">scalers, encoders, weights</text>

      <line x1={454} y1={92} x2={454} y2={128} className="dg-line" markerEnd="url(#sd-arrow)" />
      <text x={454} y={150} textAnchor="middle" className="dg-label-strong">tune</text>
      <text x={454} y={168} textAnchor="middle" className="dg-label">compare models,</text>
      <text x={454} y={184} textAnchor="middle" className="dg-label">pick settings</text>

      <line x1={538} y1={92} x2={538} y2={210} stroke="var(--dg-hl)" strokeWidth={1.5} strokeDasharray="4 4" markerEnd="url(#sd-arrow)" />
      <text x={580} y={234} textAnchor="end" className="dg-label">evaluate once, at the end</text>
    </svg>
  );
}
