import { BookOpen } from "lucide-react";
import Link from "next/link";

import type { WorkflowPhase, WorkflowStep } from "@/types/content";

interface Props {
  phases: WorkflowPhase[];
  steps: WorkflowStep[];
}

/** The full 15-step workflow grouped into its five phases. */
export function Workflow({ phases, steps }: Props) {
  return (
    <ol className="space-y-12">
      {phases.map((phase, pi) => {
        const phaseSteps = steps.filter((s) => s.phase === phase.id);
        return (
          <li key={phase.id} className="grid gap-6 lg:grid-cols-[16rem_1fr] lg:gap-12">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-sm text-fg-muted">
                Phase {pi + 1} of {phases.length}
              </p>
              <h2 className="mt-1 text-3xl">{phase.title}</h2>
              <p className="mt-2 text-fg-muted">{phase.summary}</p>
            </div>
            <ol className="border-l border-line-strong">
              {phaseSteps.map((step) => (
                <li key={step.slug} id={step.slug} className="relative pb-8 pl-8 last:pb-0">
                  <span
                    aria-hidden
                    className={
                      step.hasGuide
                        ? "absolute -left-[13px] top-0 grid size-[26px] place-items-center rounded-full bg-primary text-sm font-bold text-on-primary"
                        : "absolute -left-[13px] top-0 grid size-[26px] place-items-center rounded-full border border-line-strong bg-page text-sm text-fg-muted"
                    }
                  >
                    {step.number}
                  </span>
                  <h3 className="text-xl leading-snug">
                    <Link href={`/project-lab/${step.slug}`} className="hover:text-link hover:underline hover:underline-offset-4">
                      <span className="sr-only">Step {step.number}: </span>
                      {step.title}
                    </Link>
                  </h3>
                  <p className="mt-1.5 text-fg-muted">{step.summary}</p>
                  <p className="mt-2 text-sm text-fg-muted">
                    <span className="font-bold text-fg">You’ll have: </span>
                    {step.output}
                  </p>
                  <Link
                    href={`/project-lab/${step.slug}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-link underline underline-offset-4"
                  >
                    <BookOpen aria-hidden className="size-4" />
                    {step.hasGuide ? "Read the full guide" : "Open the step"}
                    <span className="sr-only">: {step.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </li>
        );
      })}
    </ol>
  );
}

/** Compact version for the homepage: phases with their step titles. */
export function WorkflowSummary({ phases, steps }: Props) {
  return (
    <ol className="grid gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-5">
      {phases.map((phase, pi) => {
        const phaseSteps = steps.filter((s) => s.phase === phase.id);
        return (
          <li key={phase.id} className="bg-surface p-5 lg:p-6">
            <p className="text-sm text-fg-muted">
              Steps {phaseSteps[0]?.number}–{phaseSteps.at(-1)?.number}
            </p>
            <h3 className="mt-1 text-xl">
              <span className="sr-only">Phase {pi + 1}: </span>
              {phase.title}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-fg-muted">
              {phaseSteps.map((s) => (
                <li key={s.slug}>
                  <Link href={`/project-lab/${s.slug}`} className={s.hasGuide ? "font-semibold text-link underline underline-offset-4" : "hover:text-fg hover:underline hover:underline-offset-4"}>
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
