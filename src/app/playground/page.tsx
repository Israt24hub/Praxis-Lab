import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { interactiveRegistry } from "@/components/lessons/interactive-registry";
import { ExperimentCatalog } from "@/components/playground/experiment-catalog";
import { Container, PageHeader, PhaseNote } from "@/components/ui/layout";
import { StatusTag } from "@/components/ui/status-tag";
import { getExperiments, getPaths } from "@/lib/content";

export const metadata: Metadata = {
  title: "AI Playground",
  description: "Interactive experiments that show what happens inside a model. Live experiments compute in your browser.",
};

export default async function PlaygroundPage() {
  const [experiments, paths] = await Promise.all([getExperiments(), getPaths()]);
  const pathTitles = Object.fromEntries(paths.map((p) => [p.slug, p.title]));
  const live = experiments.filter((e) => e.status === "live" && e.component && interactiveRegistry[e.component]);
  const planned = experiments.filter((e) => e.status !== "live");

  return (
    <>
      <PageHeader
        title="AI Playground"
        lead="Change a value and watch what the model does with it. Live experiments run real computations in your browser; everything else is labelled as planned."
      >
        <PhaseNote>
          {live.length} experiments are live. Each one also appears inside its lesson, with guidance on what to try. Larger
          explorers, including 3D architecture views, are planned for later phases.
        </PhaseNote>
      </PageHeader>

      {live.map((exp, i) => {
        const Component = interactiveRegistry[exp.component!];
        return (
          <section
            key={exp.id}
            id={exp.id}
            aria-labelledby={`${exp.id}-heading`}
            className={i > 0 ? "border-t border-line py-12 sm:py-16" : "py-12 sm:py-16"}
          >
            <Container>
              <div className="mb-8 max-w-prose">
                <StatusTag kind="live" />
                <h2 id={`${exp.id}-heading`} className="mt-3 text-3xl sm:text-4xl">
                  {exp.title}
                </h2>
                <p className="mt-3 text-lg text-fg-muted">{exp.summary}</p>
                {exp.lesson ? (
                  <Link
                    href={`/learn/${exp.lesson.pathSlug}/${exp.lesson.topicSlug}`}
                    className="mt-3 inline-flex items-center gap-2 font-semibold text-link underline underline-offset-4"
                  >
                    <BookOpen aria-hidden className="size-4" />
                    Open the lesson for this experiment
                  </Link>
                ) : null}
              </div>
              <Component />
            </Container>
          </section>
        );
      })}

      <section aria-labelledby="planned-heading" className="border-t border-line py-12 sm:py-16">
        <Container>
          <div className="mb-8 max-w-prose">
            <h2 id="planned-heading" className="text-3xl sm:text-4xl">
              Planned experiments
            </h2>
            <p className="mt-3 text-lg text-fg-muted">
              What the Playground is being built towards. Nothing below works yet; each will be marked when it does.
            </p>
          </div>
          <ExperimentCatalog experiments={planned} pathTitles={pathTitles} />
        </Container>
      </section>
    </>
  );
}
