import type { Metadata } from "next";

import { Workflow } from "@/components/project-lab/workflow";
import { ButtonLink } from "@/components/ui/button";
import { Container, PageHeader, PhaseNote } from "@/components/ui/layout";
import { getWorkflow } from "@/lib/content";

export const metadata: Metadata = {
  title: "Project Lab",
  description:
    "A fifteen-step workflow for a complete machine learning project, from research question to paper, with a full guide to leak-free data splitting.",
};

export default async function ProjectLabPage() {
  const { phases, steps, preprocessingByDataType } = await getWorkflow();
  const guided = steps.find((s) => s.hasGuide);

  return (
    <>
      <PageHeader
        title="Project Lab"
        lead="A complete machine learning project in fifteen steps — from the question you are asking to a repository and paper someone else can check. Each step ends with something concrete in hand."
      >
        <div className="flex flex-col gap-5">
          <PhaseNote>
            Every step is outlined. Step {guided?.number}, splitting data without leakage, has the full guide with a
            diagram, code, common mistakes and a checklist — the format every step will follow.
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
        <Container>
          <div className="max-w-prose">
            <h2 id="preprocessing-heading" className="text-3xl sm:text-4xl">
              Preprocessing depends on your data
            </h2>
            <p className="mt-4 text-lg text-chalk-muted">
              There is no universal recipe. What step 5 involves depends on the problem, the data type and the model.
              One rule holds everywhere: anything that learns from the data — an imputer, a scaler, a vocabulary — is
              fitted on training data only.
            </p>
          </div>
          <div className="mt-8 overflow-x-auto rounded-panel border border-line" tabIndex={0} role="region" aria-label="Preprocessing by data type">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <thead className="bg-board-deep">
                <tr>
                  <th scope="col" className="w-48 px-5 py-3 font-bold">When you have</th>
                  <th scope="col" className="px-5 py-3 font-bold">Common approaches</th>
                  <th scope="col" className="px-5 py-3 font-bold">Watch for</th>
                </tr>
              </thead>
              <tbody>
                {preprocessingByDataType.map((row) => (
                  <tr key={row.dataType} className="border-t border-line align-top">
                    <th scope="row" className="px-5 py-4 font-bold">{row.dataType}</th>
                    <td className="px-5 py-4 text-chalk-muted">{row.approaches}</td>
                    <td className="px-5 py-4 text-chalk-muted">{row.watchFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>
    </>
  );
}
