import type { Metadata } from "next";
import Link from "next/link";

import { Workflow } from "@/components/project-lab/workflow";
import { ButtonLink } from "@/components/ui/button";
import { Container, PageHeader, PhaseNote } from "@/components/ui/layout";
import { getWorkflow } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Project Lab",
  description:
    "A fifteen-step workflow for a complete machine learning project, from research question to paper, with a full guide to leak-free data splitting.",
  path: "/project-lab",
});

export default async function ProjectLabPage() {
  const { phases, steps } = await getWorkflow();
  const guided = steps.find((s) => s.hasGuide);

  return (
    <>
      <PageHeader
        title="Project Lab"
        lead="A complete machine learning project in fifteen steps — from the question you are asking to a repository and paper someone else can check. Each step ends with something concrete in hand."
      >
        <div className="flex flex-col gap-5">
          <PhaseNote>
            Every step has its own page with its purpose, input, output, tools, common mistakes and how it leads to the next.
            Step {guided?.number}, splitting data without leakage, also has a full guide with a diagram, code and a checklist.
          </PhaseNote>
          {guided ? (
            <div>
              <ButtonLink href={`/project-lab/${guided.slug}`}>Read the step {guided.number} guide</ButtonLink>
            </div>
          ) : null}
        </div>
      </PageHeader>

      <Container className="py-12 sm:py-16">
        <Workflow phases={phases} steps={steps} />
      </Container>

      <section aria-labelledby="preprocessing-heading" className="border-t border-line py-12 sm:py-16">
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div className="max-w-prose">
            <h2 id="preprocessing-heading" className="text-3xl sm:text-4xl">
              Preprocessing depends on your data
            </h2>
            <p className="mt-4 text-lg text-fg-muted">
              There is no universal recipe. Step 5 shows preprocessing for tabular data, text and images, with code for each.
              Step 6 explains leakage; step 11 covers class imbalance and choosing a metric. One rule holds everywhere:
              anything that learns from the data is fitted on training data only.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              ["clean-and-preprocess", "Step 5", "Tabular, text and image preprocessing"],
              ["split-without-leakage", "Step 6", "Splits and the five kinds of leakage"],
              ["evaluate-on-test", "Step 11", "Imbalance, metrics and the untouched test set"],
            ].map(([slug, label, text]) => (
              <li key={slug}>
                <Link href={`/project-lab/${slug}`} className="block h-full rounded-panel border border-line bg-surface p-4 hover:border-primary">
                  <span className="text-sm font-semibold text-link">{label}</span>
                  <span className="mt-1 block text-fg">{text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
