import { AlertTriangle } from "lucide-react";

import { SplitDiagram } from "@/components/diagrams/split-diagram";
import { StepChecklist } from "@/components/project-lab/step-checklist";
import { CodeBlock } from "@/components/ui/code-block";
import type { SplitGuide } from "@/lib/content";

export const splitGuideSections = [
  { id: "roles", label: "What each split is for" },
  { id: "strategies", label: "Choosing a split" },
  { id: "leakage", label: "Five kinds of leakage" },
  { id: "code", label: "Code: a leak-free pipeline" },
  { id: "mistakes", label: "Mistakes that cause leakage" },
  { id: "checklist", label: "Checklist" },
];

/** The long-form guide for step 6, rendered below the step template. */
export function SplitGuideBody({ guide }: { guide: SplitGuide }) {
  return (
    <>
      <section aria-labelledby="roles" className="scroll-mt-24">
        <h2 id="roles" className="text-3xl">What each split is for</h2>
        <figure className="mt-6 rounded-panel border border-line bg-sunken p-4 sm:p-6">
          <div className="diagram-scroll" tabIndex={0} role="region" aria-label="Diagram: data splits">
            <SplitDiagram />
          </div>
        </figure>
        <dl className="mt-8 space-y-5">
          {guide.roles.map((r) => (
            <div key={r.name} className="grid gap-1 sm:grid-cols-[11.5rem_1fr] sm:gap-6">
              <dt className="font-bold">
                {r.name} <span className="font-normal text-fg-muted">{r.share}</span>
              </dt>
              <dd className="text-fg-muted">{r.job}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-fg-muted">{guide.ratioNote}</p>
      </section>

      <section aria-labelledby="strategies" className="scroll-mt-24">
        <h2 id="strategies" className="text-3xl">Choosing a split</h2>
        <p className="mt-3 text-fg-muted">The right split mirrors how the model will be used. Random splitting is only correct when rows are independent.</p>
        <div className="mt-6 overflow-x-auto rounded-panel border border-line" tabIndex={0} role="region" aria-label="Split strategies">
          <table className="w-full min-w-[38rem] border-collapse text-left">
            <thead className="bg-sunken">
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
                  <td className="px-5 py-4 text-fg-muted">{s.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="leakage" className="scroll-mt-24">
        <h2 id="leakage" className="text-3xl">Five kinds of leakage</h2>
        <p className="mt-3 text-fg-muted">
          Leakage means information reaches training that would not be available when the model is used for real.
          It makes results look better than they are, and it is easy to miss because nothing crashes.
        </p>
        <ol className="mt-6 space-y-4">
          {guide.leakageTypes.map((l, i) => (
            <li key={l.name} className="rounded-panel border border-line p-5 sm:p-6">
              <h3 className="text-xl">
                <span className="mr-2 text-fg-faint">{i + 1}.</span>
                {l.name}
              </h3>
              <p className="mt-2 text-fg-muted">{l.description}</p>
              <p className="mt-3">
                <span className="font-bold text-link">Prevent it: </span>
                {l.fix}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="code" className="scroll-mt-24">
        <h2 id="code" className="text-3xl">Code: a leak-free pipeline</h2>
        <p className="mt-3 text-fg-muted">
          The UCI Bank Marketing dataset (file <code className="code-inline">bank-additional-full.csv</code>) with
          scikit-learn. The order is what matters: split, then fit everything inside a pipeline on training data,
          then evaluate once.
        </p>
        <div className="mt-6">
          <CodeBlock code={guide.code} label="split_and_evaluate.py" language="Python" />
        </div>
        <ul className="mt-5 list-disc space-y-2 pl-5 text-fg-muted marker:text-line-strong">
          {guide.codeNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="mistakes" className="scroll-mt-24">
        <h2 id="mistakes" className="text-3xl">Mistakes that cause leakage</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {guide.mistakes.map((m) => (
            <li key={m} className="flex gap-3 rounded-control border border-line p-4">
              <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="checklist" className="scroll-mt-24">
        <h2 id="checklist" className="text-3xl">Checklist</h2>
        <p className="mt-3 text-fg-muted">Go through this before you look at any test-set number.</p>
        <div className="mt-6">
          <StepChecklist items={guide.checklist} />
        </div>
      </section>

    </>
  );
}
