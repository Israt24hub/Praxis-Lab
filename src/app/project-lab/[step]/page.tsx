import { AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, BookOpen, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Blocks, RichText } from "@/components/lessons/rich-text";
import { SplitGuideBody, splitGuideSections } from "@/components/project-lab/split-guide";
import { CodeBlock } from "@/components/ui/code-block";
import { Container } from "@/components/ui/layout";
import { StatusTag } from "@/components/ui/status-tag";
import { getStep, getWorkflow } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

/* Unknown steps must reach notFound() before streaming, for a real 404. */
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const { steps } = await getWorkflow();
  return steps.map((s) => ({ step: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/project-lab/[step]">): Promise<Metadata> {
  const { step } = await params;
  const data = await getStep(step);
  return data ? pageMetadata({ title: `Step ${data.step.number}: ${data.step.title}`, description: data.step.summary, path: `/project-lab/${data.step.slug}` }) : { title: "Step not found" };
}

export default async function StepPage({ params }: PageProps<"/project-lab/[step]">) {
  const { step: slug } = await params;
  const [data, workflow] = await Promise.all([getStep(slug), getWorkflow()]);
  if (!data) notFound();
  const { step, guide, prev, next, total } = data;
  const phase = workflow.phases.find((p) => p.id === step.phase);
  const phaseIndex = workflow.phases.findIndex((p) => p.id === step.phase);

  const onThisPage = [
    { id: "purpose", label: "Purpose" },
    { id: "input-output", label: "Input and output" },
    { id: "tools", label: "Tools" },
    { id: "step-mistakes", label: "Common mistakes" },
    ...(step.details || step.examples ? [{ id: "in-depth", label: "In depth" }] : []),
    ...(guide ? splitGuideSections : []),
    { id: "next-step", label: "Leads to" },
  ];

  return (
    <Container className="py-10 sm:py-14">
      <Link href="/project-lab" className="inline-flex items-center gap-2 rounded text-fg-muted hover:text-fg">
        <ArrowLeft aria-hidden className="size-4" />
        Project Lab
      </Link>

      <header className="mt-6 rounded-panel bg-mist p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-surface px-3 py-1 font-medium text-link">
            Step {step.number} of {total}
          </span>
          <span className="rounded-full bg-surface px-3 py-1 text-fg-muted">
            Phase {phaseIndex + 1}: {phase?.title}
          </span>
          {guide ? <StatusTag kind="complete" label="Full guide" /> : <StatusTag kind="outline" label="Core outline" />}
        </div>
        <h1 className="mt-4 max-w-4xl text-4xl leading-tight sm:text-5xl">{step.title}</h1>
        <p className="mt-4 max-w-prose text-lg text-fg-muted">{guide ? guide.lead : step.summary}</p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-sm font-semibold">On this page</p>
            <ol className="mt-3 space-y-2 border-l border-line text-sm">
              {onThisPage.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-4 text-fg-muted hover:border-primary hover:text-fg">
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <article className="min-w-0 max-w-3xl space-y-14">
          <section id="purpose" aria-labelledby="purpose-h" className="scroll-mt-24">
            <h2 id="purpose-h" className="text-3xl">
              Purpose
            </h2>
            <p className="mt-3 text-lg text-fg-muted">
              <RichText text={step.purpose} />
            </p>
          </section>

          <section id="input-output" aria-labelledby="io-h" className="scroll-mt-24">
            <h2 id="io-h" className="text-3xl">
              Input and output
            </h2>
            <div className="mt-5 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-panel border border-line bg-surface p-5">
                <p className="text-sm font-semibold text-fg-muted">You start with</p>
                <p className="mt-2 text-fg">
                  <RichText text={step.input} />
                </p>
              </div>
              <div className="grid place-items-center text-fg-faint" aria-hidden>
                <ArrowRight className="hidden size-6 md:block" />
                <ArrowDown className="size-6 md:hidden" />
              </div>
              <div className="rounded-panel border-2 border-primary bg-surface p-5">
                <p className="text-sm font-semibold text-link">You finish with</p>
                <p className="mt-2 text-fg">
                  <RichText text={step.output} />
                </p>
              </div>
            </div>
          </section>

          <section id="tools" aria-labelledby="tools-h" className="scroll-mt-24">
            <h2 id="tools-h" className="text-3xl">
              Tools
            </h2>
            <ul className="mt-4 space-y-2">
              {step.tools.map((t) => (
                <li key={t} className="flex gap-3 text-fg-muted">
                  <Wrench aria-hidden className="mt-1 size-4 shrink-0 text-fg-faint" />
                  <span>
                    <RichText text={t} />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section id="step-mistakes" aria-labelledby="mistakes-h" className="scroll-mt-24">
            <h2 id="mistakes-h" className="text-3xl">
              Common mistakes
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {step.mistakes.map((m) => (
                <li key={m} className="flex gap-3 rounded-control border border-line bg-surface p-4">
                  <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-highlight-text" />
                  <span>
                    <RichText text={m} />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {step.details || step.examples ? (
            <section id="in-depth" aria-labelledby="depth-h" className="scroll-mt-24">
              <h2 id="depth-h" className="text-3xl">
                In depth
              </h2>
              {step.details ? <Blocks blocks={step.details} className="mt-4" /> : null}
              {step.examples ? (
                <div className="mt-6 space-y-6">
                  {step.examples.map((ex) => (
                    <div key={ex.label}>
                      <CodeBlock code={ex.code} label={ex.label} language={ex.language} />
                      <p className="mt-2 text-sm text-fg-muted">
                        <RichText text={ex.note} />
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {guide ? (
            <div className="space-y-16">
              <SplitGuideBody guide={guide} />
            </div>
          ) : null}

          <section id="next-step" aria-labelledby="next-h" className="scroll-mt-24 rounded-panel bg-sage p-6">
            <h2 id="next-h" className="text-2xl">
              Leads to
            </h2>
            <p className="mt-2 text-fg-muted">
              <RichText text={step.next} />
            </p>
            {next ? (
              <Link href={`/project-lab/${next.slug}`} className="mt-3 inline-flex items-center gap-2 font-semibold text-link underline underline-offset-4">
                Step {next.number}: {next.title}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            ) : (
              <Link href="/research" className="mt-3 inline-flex items-center gap-2 font-semibold text-link underline underline-offset-4">
                <BookOpen aria-hidden className="size-4" />
                Continue to Research & Papers
              </Link>
            )}
          </section>

          <nav aria-label="Workflow steps" className="grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
            {prev ? (
              <Link href={`/project-lab/${prev.slug}`} className="rounded-control p-2 hover:bg-mist">
                <span className="flex items-center gap-2 text-sm text-fg-muted">
                  <ArrowLeft aria-hidden className="size-4" />
                  Previous: step {prev.number}
                </span>
                <span className="mt-1 block font-semibold">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/project-lab/${next.slug}`} className="rounded-control p-2 hover:bg-mist sm:text-right">
                <span className="flex items-center gap-2 text-sm text-fg-muted sm:justify-end">
                  Next: step {next.number}
                  <ArrowRight aria-hidden className="size-4" />
                </span>
                <span className="mt-1 block font-semibold">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        </article>
      </div>
    </Container>
  );
}
