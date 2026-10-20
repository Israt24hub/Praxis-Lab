"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyState = "idle" | "copied" | "failed";

export function CodeBlock({ code, label, language }: { code: string; label: string; language: string }) {
  const [state, setState] = useState<CopyState>("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2500);
  }

  return (
    <figure className="overflow-hidden rounded-panel border border-line bg-sunken">
      <figcaption className="flex items-center justify-between gap-4 border-b border-line px-4 py-2 text-sm text-fg-muted">
        <span>
          {label} <span className="text-fg-faint">({language})</span>
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-fg hover:bg-surface"
        >
          {state === "copied" ? (
            <Check aria-hidden className="size-4" />
          ) : (
            <Copy aria-hidden className="size-4" />
          )}
          {state === "copied" ? "Copied" : "Copy code"}
        </button>
      </figcaption>
      <pre
        tabIndex={0}
        aria-label={`${label} code`}
        className="overflow-x-auto p-4 text-[0.875rem] leading-relaxed text-fg sm:p-5"
      >
        <code>{code}</code>
      </pre>
      <p role="status" className="px-4 pb-2 text-sm text-danger empty:hidden">
        {state === "failed" ? "Couldn’t copy automatically. Select the code and copy it manually." : ""}
      </p>
    </figure>
  );
}
