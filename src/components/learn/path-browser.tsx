"use client";

import { Search, X } from "lucide-react";
import { useId, useMemo, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import type { LearningPath, Level } from "@/types/content";

import { PathRow } from "./path-row";

const levels: Array<{ value: Level | "all"; label: string }> = [
  { value: "all", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

function matches(path: LearningPath, query: string) {
  if (!query) return true;
  const haystack = [path.title, path.destination, path.summary, ...path.modules.map((m) => `${m.title} ${m.summary}`)]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function PathBrowser({ paths }: { paths: LearningPath[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Level | "all">("all");
  const searchId = useId();

  const titles = useMemo(() => Object.fromEntries(paths.map((p) => [p.slug, p.title])), [paths]);
  const results = paths.filter((p) => (level === "all" || p.level === level) && matches(p, query.trim()));
  const filtered = query.trim() !== "" || level !== "all";

  function reset() {
    setQuery("");
    setLevel("all");
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-sm">
          <label htmlFor={searchId} className="text-sm font-bold">
            Search paths and modules
          </label>
          <div className="relative mt-2">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-chalk-faint" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. attention, leakage, LoRA"
              className="w-full rounded-control border border-line-strong bg-board-deep py-2.5 pl-9 pr-3 text-chalk placeholder:text-chalk-faint"
            />
          </div>
        </div>
        <fieldset>
          <legend className="text-sm font-bold">Level</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {levels.map((l) => (
              <label
                key={l.value}
                className={cx(
                  "cursor-pointer rounded-control border px-3 py-2 text-sm transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                  level === l.value
                    ? "border-accent bg-board-raised text-chalk"
                    : "border-line-strong text-chalk-muted hover:text-chalk",
                )}
              >
                <input
                  type="radio"
                  name="level"
                  value={l.value}
                  checked={level === l.value}
                  onChange={() => setLevel(l.value)}
                  className="sr-only"
                />
                {l.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <p role="status" className="mt-6 text-sm text-chalk-muted">
        {filtered ? `${results.length} of ${paths.length} paths match.` : `${paths.length} paths.`}
      </p>

      {results.length > 0 ? (
        <div className="mt-2 border-b border-line">
          {results.map((path) => (
            <PathRow key={path.slug} path={path} titles={titles} headingLevel="h2" />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-panel border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="text-lg font-bold">No paths match {query.trim() ? `“${query.trim()}”` : "this level"}.</p>
          <p className="mt-2 text-chalk-muted">Try a broader word, or clear the filters to see every path.</p>
          <button type="button" onClick={reset} className={buttonStyles("secondary", "mt-6")}>
            <X aria-hidden className="size-4" />
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
