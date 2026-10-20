import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

import { cx } from "@/lib/cx";
import type { LearningPath } from "@/types/content";

interface Props {
  paths: LearningPath[];
  currentPath: string;
  currentTopic?: string;
}

/** Curriculum navigation: every path, with the current path's topics expanded. */
export function CurriculumNav({ paths, currentPath, currentTopic }: Props) {
  return (
    <nav aria-label="Curriculum">
      <ol className="space-y-1 text-sm">
        {paths.map((p) => {
          const open = p.slug === currentPath;
          return (
            <li key={p.slug}>
              <Link
                href={`/learn/${p.slug}`}
                aria-current={open && !currentTopic ? "page" : undefined}
                className={cx(
                  "flex items-baseline gap-2 rounded-control px-2 py-1.5",
                  open ? "font-semibold text-fg" : "text-fg-muted hover:bg-sunken hover:text-fg",
                )}
              >
                <span className="w-4 shrink-0 text-xs text-fg-faint">{p.code}</span>
                {p.title}
              </Link>
              {open ? (
                <ol className="mb-2 ml-4 mt-1 space-y-0.5 border-l border-line pl-2">
                  {p.topics.map((t) => {
                    const current = t.slug === currentTopic;
                    const done = Boolean(t.lessonId);
                    return (
                      <li key={t.slug}>
                        <Link
                          href={`/learn/${p.slug}/${t.slug}`}
                          aria-current={current ? "page" : undefined}
                          className={cx(
                            "flex items-start gap-2 rounded-control px-2 py-1.5 leading-snug",
                            current ? "bg-mist font-semibold text-fg" : "text-fg-muted hover:bg-sunken hover:text-fg",
                          )}
                        >
                          {done ? (
                            <CheckCircle2 aria-hidden className="mt-0.5 size-3.5 shrink-0 text-success" />
                          ) : (
                            <Circle aria-hidden className="mt-0.5 size-3.5 shrink-0 text-fg-faint" />
                          )}
                          <span>
                            {t.title}
                            <span className="sr-only">{done ? " (complete lesson)" : " (planned)"}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
