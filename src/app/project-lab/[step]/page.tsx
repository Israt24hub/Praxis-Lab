import { AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SplitDiagram } from "@/components/diagrams/split-diagram";
import { StepChecklist } from "@/components/project-lab/step-checklist";
import { CodeBlock } from "@/components/ui/code-block";
import { Container, PageHeader } from "@/components/ui/layout";
import { getStepGuide, getWorkflow } from "@/lib/content";

/*
 * Render the whole page before responding, so unknown slugs reach notFound()
 * before streaming starts and get a real 404 status.
 */
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const { steps } = await getWorkflow();
  return steps.filter((s) => s.hasGuide).map((s) => ({ step: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/project-lab/[step]">): Promise<Metadata> {
  const { step } = await params;
  const data = await getStepGuide(step);
  return data ? { title: `Step ${data.step.number}: ${data.step.title}`, description: data.step.summary } : { title: "Guide not found" };
}

const sections = [
  { id: "roles", label: "What each split is for" },
  { id: "strategies", label: "Choosing a split" },
  { id: "leakage", label: "Five kinds of leakage" },
  { id: "code", label: "Code: a leak-free pipeline" },
  { id: "mistakes", label: "Common mistakes" },
  { id: "checklist", label: "Checklist" },
];

export default async function StepGuidePage({ params }: PageProps<"/project-lab/[step]">) {
  const { step: slug } = await params;
  const [data, workflow] = await Promise.all([getStepGuide(slug), getWorkflow()]);
  if (!data) notFound();
  const { step, guide } = data;
  const prev = workflow.steps.find((s) => s.number === step.number - 1);
  const next = workflow.steps.find((s) => s.number === step.number + 1);

  return (
    <>
      <PageHeader
        context={
          <Link href="/project-lab" className="inline-flex items-center gap-2 rounded hover:text-chalk">
            <ArrowLeft aria-hidden className="size-4" />
            Project Lab, step {step.number} of {workflow.steps.length}
          </Link>
        }
        title={step.title}
        lead={guide.lead}
      />

      <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-sm font-bold">On this page</p>
            <ol className="mt-3 space-y-2 border-l border-line text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-4 text-chalk-muted hover:border-accent hover:text-chalk">
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <article className="min-w-0 max-w-3xl">
          <section aria-labelledby="roles">
            <h2 id="roles" className="text-3xl">What each split is for</h2>
            <figure className="mt-6 rounded-panel border border-line bg-board-deep p-4 sm:p-6">
              <div className="diagram-scroll" tabIndex={0} role="region" aria-label="Diagram: data splits">
                <SplitDiagram />
              </div>
            </figure>
            <dl className="mt-8 space-y-5">
              {guide.roles.map((r) => (
                <div key={r.name} className="grid gap-1 sm:grid-cols-[11.5rem_1fr] sm:gap-6">
                  <dt className="font-bold">
                    {r.name} <span className="font-normal text-chalk-muted">{r.share}</span>
                  </dt>
                  <dd className="text-chalk-muted">{r.job}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-chalk-muted">{guide.ratioNote}</p>
          </section>

          <section aria-labelledby="strategies" className="mt-16">
            <h2 id="strategies" className="text-3xl">Choosing a split</h2>
            <p className="mt-3 text-chalk-muted">The right split mirrors how the model will be used. Random splitting is only correct when rows are independent.</p>
            <div className="mt-6 overflow-x-auto rounded-panel border border-line" tabIndex={0} role="region" aria-label="Split strategies">
              <table className="w-full min-w-[38rem] border-collapse text-left">
                <thead className="bg-board-deep">
                  <tr>
                    <th scope="col" className="px-5 py-3">When the data is</th>
                    <th scope="col" className="px-5 py-3">Use</th>
                    <th scope="col" className="px-5 py-3">Why</th>
                  </tr>
                </thead>
                <tbody>
                  {guide.strategies.map((s) => (
                    <tr key={s.when} className="border-t border-line align-top">
                      <td className="px-5 py-4">{s.when}</td>
                      <td className="px-5 py-4 font-bold">{s.strategy}</td>
                      <td className="px-5 py-4 text-chalk-muted">{s.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="leakage" className="mt-16">
            <h2 id="leakage" className="text-3xl">Five kinds of leakage</h2>
            <p className="mt-3 text-chalk-muted">
              Leakage means information reaches training that would not be available when the model is used for real.
              It makes results look better than they are, and it is easy to miss because nothing crashes.
            </p>
            <ol className="mt-6 space-y-4">
              {guide.leakageTypes.map((l, i) => (
                <li key={l.name} className="rounded-panel border border-line p-5 sm:p-6">
                  <h3 className="text-xl">
                    <span className="mr-2 text-chalk-faint">{i + 1}.</span>
                    {l.name}
                  </h3>
                  <p className="mt-2 text-chalk-muted">{l.description}</p>
                  <p className="mt-3">
                    <span className="font-bold text-accent">Prevent it: </span>
                    {l.fix}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="code" className="mt-16">
            <h2 id="code" className="text-3xl">Code: a leak-free pipeline</h2>
            <p className="mt-3 text-chalk-muted">
              The UCI Bank Marketing dataset (file <code className="code-inline">bank-additional-full.csv</code>) with
              scikit-learn. The order is what matters: split, then fit everything inside a pipeline on training data,
              then evaluate once.
            </p>
            <div className="mt-6">
              <CodeBlock code={guide.code} label="split_and_evaluate.py" language="Python" />
            </div>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-chalk-muted marker:text-line-strong">
              {guide.codeNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="mistakes" className="mt-16">
            <h2 id="mistakes" className="text-3xl">Common mistakes</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {guide.mistakes.map((m) => (
                <li key={m} className="flex gap-3 rounded-control border border-line p-4">
                  <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="checklist" className="mt-16">
            <h2 id="checklist" className="text-3xl">Checklist</h2>
            <p className="mt-3 text-chalk-muted">Go through this before you look at any test-set number.</p>
            <div className="mt-6">
              <StepChecklist items={guide.checklist} />
            </div>
          </section>

          <nav aria-label="Workflow steps" className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
            {prev ? (
              <Link href={`/project-lab#${prev.slug}`} className="group rounded-control p-2">
                <span className="flex items-center gap-2 text-sm text-chalk-muted">
                  <ArrowLeft aria-hidden className="size-4" />
                  Previous: step {prev.number}
                </span>
                <span className="mt-1 block font-bold group-hover:underline">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/project-lab#${next.slug}`} className="group rounded-control p-2 sm:text-right">
                <span className="flex items-center gap-2 text-sm text-chalk-muted sm:justify-end">
                  Next: step {next.number}
                  <ArrowRight aria-hidden className="size-4" />
                </span>
                <span className="mt-1 block font-bold group-hover:underline">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        </article>
      </Container>
    </>
  );
}
