import Link from "next/link";

import { StatusTag } from "@/components/ui/status-tag";
import { features } from "@/config/features";
import type { Experiment } from "@/types/content";

interface Props {
  experiments: Experiment[];
  pathTitles: Record<string, string>;
}

/** Lower-cases the first letter unless the word is an acronym such as "LoRA". */
function lowerFirst(text: string) {
  return /^[A-Z][a-z]/.test(text) ? text[0].toLowerCase() + text.slice(1) : text;
}

/** Planned experiments. Live ones are rendered separately on the Playground page. */
export function ExperimentCatalog({ experiments, pathTitles }: Props) {
  if (experiments.length === 0) {
    return <p className="text-fg-muted">No further experiments are planned yet.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {experiments.map((exp) => {
        const needs3d = exp.renderer === "3d" && !features.threeD;
        return (
          <li key={exp.id} className="flex flex-col rounded-panel border border-line p-6">
            <div className="flex flex-wrap gap-2">
              <StatusTag kind={exp.status === "live" ? "live" : "planned"} />
              <StatusTag kind={exp.access} />
              {needs3d ? <StatusTag kind="3d" /> : null}
            </div>
            <h3 className="mt-4 text-xl">{exp.title}</h3>
            <p className="mt-2 text-fg-muted">{exp.summary}</p>
            <p className="mt-4 text-sm text-fg-muted">
              <span className="font-bold text-fg">You’ll change: </span>
              {exp.interactions.map(lowerFirst).join(", ")}
            </p>
            <p className="mt-auto pt-5 text-sm">
              <Link href={`/learn/${exp.pathSlug}`} className="text-fg-muted underline decoration-line-strong underline-offset-4 hover:text-fg hover:decoration-link">
                {pathTitles[exp.pathSlug]}
              </Link>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
