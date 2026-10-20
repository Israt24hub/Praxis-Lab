"use client";

import { useId, useState } from "react";

import { cx } from "@/lib/cx";
import type { Block } from "@/types/content";

import { Blocks } from "./rich-text";

type Level = "beginner" | "technical";

/** The same concept explained twice; the learner chooses the depth. */
export function ExplanationToggle({ beginner, technical }: { beginner: Block[]; technical: Block[] }) {
  const [level, setLevel] = useState<Level>("beginner");
  const name = useId();

  return (
    <div>
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">Explanation depth</legend>
        {(
          [
            ["beginner", "Beginner explanation"],
            ["technical", "Technical explanation"],
          ] as const
        ).map(([value, label]) => (
          <label
            key={value}
            className={cx(
              "cursor-pointer rounded-full border px-4 py-1.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
              level === value ? "border-primary bg-primary text-on-primary" : "border-line-strong text-fg-muted hover:text-fg",
            )}
          >
            <input type="radio" name={name} value={value} checked={level === value} onChange={() => setLevel(value)} className="sr-only" />
            {label}
          </label>
        ))}
      </fieldset>
      <div aria-live="polite" className="mt-5">
        <Blocks blocks={level === "beginner" ? beginner : technical} />
      </div>
    </div>
  );
}
