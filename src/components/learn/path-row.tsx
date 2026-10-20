import Link from "next/link";

import type { LearningPath } from "@/types/content";

const levelLabel = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

interface Props {
  path: LearningPath;
  titles: Record<string, string>;
  headingLevel?: "h3" | "h2";
}

/** One learning path in brief: where it leads and what you need first. */
export function PathRow({ path, titles, headingLevel = "h3" }: Props) {
  const Heading = headingLevel;
  const complete = path.topics.filter((t) => t.lessonId).length;

  return (
    <article className="flex flex-col gap-3 border-t border-line py-7">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
        <span className="font-semibold text-link">Path {path.code}</span>
        <span aria-hidden className="h-3.5 w-px bg-line-strong" />
        <span>{levelLabel[path.level]}</span>
        <span aria-hidden className="h-3.5 w-px bg-line-strong" />
        <span>
          {path.topics.length} topics{complete ? `, ${complete} complete` : ""}
        </span>
      </div>
      <Heading className="font-display text-2xl font-medium leading-snug">
        <Link href={`/learn/${path.slug}`} className="rounded hover:text-link hover:underline hover:underline-offset-4">
          {path.title}
        </Link>
      </Heading>
      <p className="text-fg">
        <span className="text-fg-muted">You’ll be able to: </span>
        {path.destination}
      </p>
      <p className="text-fg-muted">
        <span className="font-semibold text-fg">Before you start: </span>
        {path.prerequisitePaths.map((slug, i) => (
          <span key={slug}>
            {i > 0 ? ", " : null}
            <Link href={`/learn/${slug}`} className="text-link underline underline-offset-4">
              {titles[slug] ?? slug}
            </Link>
          </span>
        ))}
        {path.prerequisitePaths.length > 0 && path.prerequisiteSkills.length > 0 ? "; " : null}
        {path.prerequisiteSkills.join("; ")}
      </p>
    </article>
  );
}
