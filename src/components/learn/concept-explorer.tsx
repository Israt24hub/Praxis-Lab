"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";

import { conceptDiagrams } from "@/components/diagrams/concept-diagrams";
import { cx } from "@/lib/cx";
import type { Concept } from "@/types/content";

interface Props {
  concepts: Concept[];
  pathTitles: Record<string, string>;
}

/** Accessible tabs: arrow keys move between concepts, Home/End jump to the ends. */
export function ConceptExplorer({ concepts, pathTitles }: Props) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (concepts.length === 0) {
    return <p className="text-fg-muted">No concepts are published yet.</p>;
  }

  const concept = concepts[active];
  const Diagram = conceptDiagrams[concept.id];

  function focusTab(index: number) {
    const next = (index + concepts.length) % concepts.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const keys: Record<string, () => void> = {
      ArrowDown: () => focusTab(active + 1),
      ArrowRight: () => focusTab(active + 1),
      ArrowUp: () => focusTab(active - 1),
      ArrowLeft: () => focusTab(active - 1),
      Home: () => focusTab(0),
      End: () => focusTab(concepts.length - 1),
    };
    const handler = keys[event.key];
    if (handler) {
      event.preventDefault();
      handler();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-10">
      <div
        role="tablist"
        aria-label="Concepts"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible"
      >
        {concepts.map((c, i) => {
          const selected = i === active;
          return (
            <button
              key={c.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`concept-tab-${c.id}`}
              aria-selected={selected}
              aria-controls={`concept-panel-${c.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={onKeyDown}
              className={cx(
                "flex shrink-0 items-baseline gap-3 rounded-control border px-4 py-3 text-left transition-colors duration-150",
                selected
                  ? "border-primary bg-surface text-fg"
                  : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
              )}
            >
              <span className={cx("text-sm tabular-nums", selected ? "text-link" : "text-fg-faint")}>{i + 1}</span>
              <span className="font-bold">{c.title}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`concept-panel-${concept.id}`}
        aria-labelledby={`concept-tab-${concept.id}`}
        className="min-w-0 rounded-panel border border-line bg-surface p-4 sm:p-7"
      >
        <figure className="rounded-control border border-line bg-sunken p-3 sm:p-5">
          <div className="diagram-scroll" tabIndex={0} role="region" aria-label={`Diagram: ${concept.title}`}>
            <Diagram />
          </div>
          <figcaption className="mt-3 flex gap-2 text-sm text-fg-faint">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>Illustration, not a running model. {concept.caveat}</span>
          </figcaption>
        </figure>
        <div className="mt-6 grid gap-x-10 gap-y-2 px-1 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
          <h3 className="text-2xl leading-snug">{concept.question}</h3>
          <div>
          {concept.explanation.map((paragraph, i) => (
            <p key={paragraph.slice(0, 24)} className={i === 0 ? "text-fg-muted xl:mt-1" : "mt-4 text-fg-muted"}>
              {paragraph}
            </p>
          ))}
          <p className="mt-5 text-sm text-fg-muted">
            Covered in{" "}
            <Link href={`/learn/${concept.pathSlug}`} className="font-bold text-fg underline decoration-line-strong underline-offset-4 hover:decoration-link">
              {pathTitles[concept.pathSlug] ?? "its learning path"}
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
