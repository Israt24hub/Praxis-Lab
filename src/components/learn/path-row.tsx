import Link from "next/link";

import type { LearningPath } from "@/types/content";

const levelLabel = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

interface Props {
  path: LearningPath;
  titles: Record<string, string>;
  headingLevel?: "h3" | "h2";
  /** Single-column layout for tighter grids such as the homepage. */
  compact?: boolean;
}

/** One learning path as a row: destination first, then what you need before starting. */
export function PathRow({ path, titles, headingLevel = "h3", compact = false }: Props) {
  const Heading = headingLevel;
  const freeModules = path.modules.filter((m) => m.access === "free").length;

  return (
    <article
      className={
        compact
          ? "flex flex-col gap-3 border-t border-line py-7"
          : "grid gap-x-10 gap-y-4 border-t border-line py-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      }
    >
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-chalk-muted">
          <span>{levelLabel[path.level]}</span>
          <span aria-hidden className="h-3.5 w-px bg-line-strong" />
          <span>
            {path.modules.length} modules, {freeModules} free
          </span>
        </div>
        <Heading className="mt-2 text-2xl leading-snug">
          <Link href={`/learn/${path.slug}`} className="rounded hover:underline hover:decoration-accent hover:underline-offset-4">
            {path.title}
          </Link>
        </Heading>
        <p className="mt-3 text-chalk">
          <span className="text-chalk-muted">You’ll be able to: </span>
          {path.destination}
        </p>
      </div>

      {compact ? (
        <p className="text-chalk-muted">
          <span className="font-bold text-chalk">Before you start: </span>
          {path.prerequisitePaths.map((slug, i) => (
            <span key={slug}>
              {i > 0 ? ", " : null}
              <Link href={`/learn/${slug}`} className="text-chalk underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                {titles[slug] ?? slug}
              </Link>
            </span>
          ))}
          {path.prerequisitePaths.length > 0 && path.prerequisiteSkills.length > 0 ? "; " : null}
          {path.prerequisiteSkills.join("; ")}
        </p>
      ) : (
      <div className="md:pt-7">
        <p className="text-sm font-bold text-chalk">Before you start</p>
        <ul className="mt-2 space-y-1.5 text-chalk-muted">
          {path.prerequisitePaths.map((slug) => (
            <li key={slug}>
              <Link href={`/learn/${slug}`} className="text-chalk underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                {titles[slug] ?? slug}
              </Link>{" "}
              path
            </li>
          ))}
          {path.prerequisiteSkills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>
      )}
    </article>
  );
}
