"use client";

import { CheckCircle2, Circle, Search, X } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import type { LearningPath, Level } from "@/types/content";

const levels: Array<{ value: Level | "all"; label: string }> = [
  { value: "all", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const levelLabel = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

function words(query: string) {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

function matchesAll(text: string, q: string[]) {
  const t = text.toLowerCase();
  return q.every((w) => t.includes(w));
}

/** The whole curriculum, searchable down to individual topics. */
export function PathBrowser({ paths }: { paths: LearningPath[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Level | "all">("all");
  const [completeOnly, setCompleteOnly] = useState(false);
  const searchId = useId();
  const q = words(query);

  const results = paths
    .filter((p) => level === "all" || p.level === level)
    .map((p) => {
      const pathMatches = q.length > 0 && matchesAll(`${p.title} ${p.summary} ${p.destination}`, q);
      const topics = p.topics.filter(
        (t) =>
          (!completeOnly || t.lessonId) &&
          (q.length === 0 || pathMatches || matchesAll(`${t.title} ${t.summary} ${t.outcomes.join(" ")}`, q)),
      );
      return { path: p, topics };
    })
    .filter((r) => r.topics.length > 0);

  const topicCount = results.reduce((n, r) => n + r.topics.length, 0);
  const totalTopics = paths.reduce((n, p) => n + p.topics.length, 0);
  const filtered = q.length > 0 || level !== "all" || completeOnly;

  function reset() {
    setQuery("");
    setLevel("all");
    setCompleteOnly(false);
  }

  return (
    <div>
      <div className="flex flex-col gap-5 rounded-panel border border-line bg-surface p-5 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-sm">
          <label htmlFor={searchId} className="text-sm font-semibold">
            Search topics
          </label>
          <div className="relative mt-2">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-faint" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. attention, leakage, gradient"
              className="w-full rounded-control border border-line-strong bg-page py-2.5 pl-9 pr-3 text-fg placeholder:text-fg-faint"
            />
          </div>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold">Level</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {levels.map((l) => (
              <label
                key={l.value}
                className={cx(
                  "cursor-pointer rounded-control border px-3 py-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                  level === l.value ? "border-primary bg-mist text-fg" : "border-line-strong text-fg-muted hover:text-fg",
                )}
              >
                <input type="radio" name="level" value={l.value} checked={level === l.value} onChange={() => setLevel(l.value)} className="sr-only" />
                {l.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={completeOnly}
            onChange={(e) => setCompleteOnly(e.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Complete lessons only
        </label>
      </div>

      <p role="status" className="mt-5 text-sm text-fg-muted">
        {filtered ? `${topicCount} of ${totalTopics} topics match.` : `${totalTopics} topics in ${paths.length} paths.`}
      </p>

      {results.length > 0 ? (
        <ol className="mt-4 space-y-6">
          {results.map(({ path, topics }) => (
            <li key={path.slug} className="rounded-panel border border-line bg-surface">
              <div className="flex flex-col gap-3 border-b border-line p-5 sm:p-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm text-fg-muted">
                    <span className="font-semibold text-link">Path {path.code}</span>
                    <span className="mx-2 text-line-strong" aria-hidden>
                      |
                    </span>
                    {levelLabel[path.level]}
                  </p>
                  <h2 className="mt-1 text-2xl sm:text-3xl">
                    <Link href={`/learn/${path.slug}`} className="hover:text-link hover:underline hover:underline-offset-4">
                      {path.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-fg-muted">{path.destination}</p>
                </div>
                <Link href={`/learn/${path.slug}`} className={buttonStyles("secondary", "shrink-0 px-4 py-2 text-sm")}>
                  Path overview
                </Link>
              </div>
              <ol className="grid gap-px bg-line sm:grid-cols-2">
                {topics.map((t) => (
                  <li key={t.slug} className="bg-surface">
                    <Link href={`/learn/${path.slug}/${t.slug}`} className="flex h-full gap-3 px-5 py-4 hover:bg-mist sm:px-6">
                      {t.lessonId ? (
                        <CheckCircle2 aria-hidden className="mt-1 size-4 shrink-0 text-success" />
                      ) : (
                        <Circle aria-hidden className="mt-1 size-4 shrink-0 text-fg-faint" />
                      )}
                      <span>
                        <span className="block font-semibold text-fg">{t.title}</span>
                        <span className="block text-sm text-fg-muted">{t.summary}</span>
                        <span className={cx("mt-1 block text-xs font-semibold", t.lessonId ? "text-success" : "text-fg-faint")}>
                          {t.lessonId ? "Complete lesson" : "Planned"}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-4 rounded-panel border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="text-lg font-semibold">No topics match {query.trim() ? `“${query.trim()}”` : "these filters"}.</p>
          <p className="mt-2 text-fg-muted">Try a broader word, or clear the filters to see the whole curriculum.</p>
          <button type="button" onClick={reset} className={buttonStyles("secondary", "mt-6")}>
            <X aria-hidden className="size-4" />
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
