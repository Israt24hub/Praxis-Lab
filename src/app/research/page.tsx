import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { StepChecklist } from "@/components/project-lab/step-checklist";
import { PaperOutline } from "@/components/research/paper-outline";
import { RichText } from "@/components/lessons/rich-text";
import { ButtonLink } from "@/components/ui/button";
import { Container, PageHeader, PhaseNote, Section } from "@/components/ui/layout";
import { getResearch } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Research & Papers",
  description:
    "The research lifecycle, a paper-writing roadmap and a sample paper outline for machine learning projects — with honest reporting at the centre.",
  path: "/research",
});

export default async function ResearchPage() {
  const {
    researchStages,
    writingRoadmap,
    honestReporting,
    sampleOutline,
    paperSections,
    claimTypes,
    writingExamples,
    reproducibilityChecklist,
  } = await getResearch();

  const sections = [
    { id: "lifecycle", label: "Lifecycle" },
    { id: "roadmap", label: "Writing roadmap" },
    { id: "claims", label: "Findings, hypotheses, limitations" },
    { id: "writing", label: "Clear academic writing" },
    { id: "outline", label: "Paper outline" },
    { id: "reproducibility", label: "Reproducibility checklist" },
  ];

  return (
    <>
      <PageHeader
        title="Research & Papers"
        lead="How to go from a question to a reproducible experiment and a paper that says exactly what you did — no more, no less."
      >
        <PhaseNote>
          Work through the sections in order, or jump to the one you need. Path H in the curriculum will turn each into a
          full lesson.
        </PhaseNote>
      </PageHeader>

      <nav aria-label="Research sections" className="sticky top-16 z-30 border-b border-line bg-page/95 backdrop-blur-sm">
        <Container>
          <ol className="flex gap-1 overflow-x-auto py-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block whitespace-nowrap rounded-control px-3 py-1.5 text-sm text-fg-muted hover:bg-mist hover:text-fg">
                  <span className="mr-1.5 text-fg-faint">{i + 1}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </Container>
      </nav>

      <Section
        id="lifecycle"
        title="The research lifecycle"
        intro="Nine stages. In practice you loop back — a surprising result sends you to the literature again — but each stage should leave something written down."
      >
        <ol className="grid gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-3">
          {researchStages.map((s) => (
            <li key={s.number} className="flex flex-col bg-surface p-6">
              <span className="text-sm tabular-nums text-fg-faint">Stage {s.number}</span>
              <h3 className="mt-1 text-xl leading-snug">{s.title}</h3>
              <p className="mt-2 text-fg-muted">{s.summary}</p>
              <p className="mt-auto pt-4 text-sm">
                <span className="font-bold">Produces: </span>
                <span className="text-fg-muted">{s.produces}</span>
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
                  className="absolute -left-[45px] top-0 grid size-[26px] place-items-center rounded-full border border-line-strong bg-page text-sm text-fg-muted"
                >
                  {i + 1}
                </span>
                <h3 className="text-lg">{r.title}</h3>
                <p className="mt-1 text-fg-muted">{r.detail}</p>
              </li>
            ))}
          </ol>
          <div className="self-start rounded-panel border-2 border-primary p-6 sm:p-8">
            <h3 className="flex items-center gap-2 text-xl">
              <ShieldCheck aria-hidden className="size-5 text-link" />
              Honest reporting
            </h3>
            <p className="mt-2 text-fg-muted">A paper must accurately reflect experiments that were actually performed.</p>
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
        id="claims"
        className="border-t border-line"
        title="Findings, hypotheses and limitations"
        intro="Every sentence in a results or discussion section is one of three kinds of statement. Readers trust a paper that keeps them apart."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {claimTypes.map((c) => (
            <div key={c.kind} className="flex flex-col rounded-panel border border-line bg-surface p-6">
              <h3 className="font-display text-2xl font-medium">{c.kind}</h3>
              <p className="mt-2 text-fg-muted">{c.definition}</p>
              <p className="mt-4 text-sm">
                <span className="font-semibold">Sounds like: </span>
                <span className="text-fg-muted">{c.signals}</span>
              </p>
              <p className="mt-4 rounded-control bg-sunken p-3 text-sm text-fg">
                <RichText text={c.example} />
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-prose text-fg-muted">
          Bracketed values mark where measured results go. A hypothesis is not a weakness — but presenting one as a finding is.
        </p>
      </Section>

      <Section
        id="writing"
        className="border-t border-line"
        title="Clear academic writing"
        intro="Precise writing makes claims checkable. Each pair shows a common problem and a clearer version."
      >
        <ol className="space-y-4">
          {writingExamples.map((w) => (
            <li key={w.problem} className="rounded-panel border border-line bg-surface p-5 sm:p-6">
              <h3 className="text-lg">{w.problem}</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-control border border-dashed border-highlight p-4">
                  <p className="text-xs font-semibold text-highlight-text">Unclear</p>
                  <p className="mt-1 text-fg-muted">{w.weak}</p>
                </div>
                <div className="rounded-control border border-primary bg-mist p-4">
                  <p className="text-xs font-semibold text-link">Clearer</p>
                  <p className="mt-1 text-fg">{w.better}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-fg-muted">{w.why}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="outline"
        className="border-t border-line"
        title="Sample structured paper outline"
        intro={
          <p>
            A worked outline for a study that continues the{" "}
              <Link href="/project-lab/split-without-leakage" className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-link">
                Project Lab leakage guide
              </Link>
              .
          </p>
        }
      >
        <div className="mb-8 max-w-3xl rounded-panel border border-line bg-surface p-6">
          <p className="text-sm text-fg-muted">Working title</p>
          <p className="mt-1 text-xl font-bold leading-snug">{sampleOutline.title}</p>
          <p className="mt-4 text-sm text-fg-muted">Research question</p>
          <p className="mt-1">{sampleOutline.question}</p>
          <p className="mt-4 text-sm text-fg-faint">{sampleOutline.note}</p>
        </div>
        <PaperOutline sections={paperSections} />
        <p className="mt-6 max-w-prose text-fg-muted">
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
      <Section
        id="reproducibility"
        className="border-t border-line"
        title="Reproducibility checklist"
        intro="Go through this before submitting a paper or publishing a repository. If an item is not true yet, the paper is not finished."
      >
        <div className="max-w-3xl">
          <StepChecklist items={reproducibilityChecklist} />
        </div>
      </Section>
    </>
  );
}
