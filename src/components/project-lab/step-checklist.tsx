"use client";

import { useState } from "react";

import { features } from "@/config/features";

export function StepChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const done = checked.filter(Boolean).length;

  return (
    <div className="rounded-panel border border-line bg-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-bold">
          {done} of {items.length} checked
        </p>
        {!features.accounts ? (
          <p className="text-sm text-fg-faint">Ticks aren’t saved yet. Saved progress comes with accounts.</p>
        ) : null}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden>
        <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${(done / items.length) * 100}%` }} />
      </div>
      <ul className="mt-5 space-y-1">
        {items.map((item, i) => (
          <li key={item}>
            <label className="flex cursor-pointer gap-3 rounded-control px-2 py-2 hover:bg-page">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => setChecked((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                className="mt-1 size-4 shrink-0 accent-[var(--color-primary)]"
              />
              <span className={checked[i] ? "text-fg-muted line-through decoration-line-strong" : "text-fg"}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
