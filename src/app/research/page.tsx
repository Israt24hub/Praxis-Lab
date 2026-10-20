import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PaperOutline } from "@/components/research/paper-outline";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, PhaseNote, Section } from "@/components/ui/layout";
import { getResearch } from "@/lib/content";

export const metadata: Metadata = {
  title: "Research & Papers",
  description:
    "The research lifecycle, a paper-writing roadmap and a sample paper outline for machine learning projects — with honest reporting at the centre.",
};

export default async function ResearchPage() {
  const { researchStages, writingRoadmap, honestReporting, sampleOutline, paperSections } = await getResearch();

  return (
    <>
      <PageHeader
        title="Research & Papers"
        lead="How to go from a question to a reproducible experiment and a paper that says exactly what you did — no more, no less."
      >
        <PhaseNote>
          This section has the overview, writing roadmap and a sample outline. Interactive checklists and section
          templates are planned.
        </PhaseNote>
      </PageHeader>

      <Section
        id="lifecycle"
        title="The research lifecycle"
        intro="Nine stages. In practice you loop back — a surprising result sends you to the literature again — but each stage should leave something written down."
      >
        <ol className="grid gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-3">
          {researchStages.map((s) => (
            <li key={s.number} className="flex flex-col bg-board p-6">
              <span className="text-sm tabular-nums text-chalk-faint">Stage {s.number}</span>
              <h3 className="mt-1 text-xl leading-snug">{s.title}</h3>
              <p className="mt-2 text-chalk-muted">{s.summary}</p>
              <p className="mt-auto pt-4 text-sm">
                <span className="font-bold">Produces: </span>
                <span className="text-chalk-muted">{s.produces}</span>
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="roadmap"
        className="border-t border-line"
        title="A paper-writing roadmap"
        intro="Papers are read from abstract to conclusion, but are easier to write honestly in a different order: evidence first, framing last."
      >
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          <ol className="relative space-y-6 border-l border-line-strong pl-8">
            {writingRoadmap.map((r, i) => (
              <li key={r.title} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[45px] top-0 grid size-[26px] place-items-center rounded-full border border-line-strong bg-board text-sm text-chalk-muted"
                >
                  {i + 1}
                </span>
                <h3 className="text-lg">{r.title}</h3>
                <p className="mt-1 text-chalk-muted">{r.detail}</p>
              </li>
            ))}
          </ol>
          <div className="self-start rounded-panel border-2 border-accent p-6 sm:p-8">
            <h3 className="flex items-center gap-2 text-xl">
              <ShieldCheck aria-hidden className="size-5 text-accent" />
              Honest reporting
            </h3>
            <p className="mt-2 text-chalk-muted">A paper must accurately reflect experiments that were actually performed.</p>
            <ul className="mt-5 space-y-4">
              {honestReporting.map((rule) => (
                <li key={rule} className="border-t border-line pt-4">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        id="outline"
        className="border-t border-line"
        title="Sample structured paper outline"
        intro={
          <p>
            A worked outline for a study that continues the{" "}
              <Link href="/project-lab/split-without-leakage" className="text-chalk underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                Project Lab leakage guide
              </Link>
              .
          </p>
        }
      >
        <div className="mb-8 max-w-3xl rounded-panel border border-line bg-board-raised p-6">
          <p className="text-sm text-chalk-muted">Working title</p>
          <p className="mt-1 text-xl font-bold leading-snug">{sampleOutline.title}</p>
          <p className="mt-4 text-sm text-chalk-muted">Research question</p>
          <p className="mt-1">{sampleOutline.question}</p>
          <p className="mt-4 text-sm text-chalk-faint">{sampleOutline.note}</p>
        </div>
        <PaperOutline sections={paperSections} />
        <p className="mt-6 max-w-prose text-chalk-muted">
          This is a common structure for empirical ML papers, not a universal one. Venues and fields differ: some
          merge Results and Discussion, place Related Work near the end, require ethics or broader-impact statements,
          or set strict page limits. Always follow the venue’s own template and author guidelines.
        </p>
        <div className="mt-8">
          <ButtonLink href="/learn/research-paper-writing" variant="secondary">
            See the research and paper-writing path
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
