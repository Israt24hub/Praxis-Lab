import { Check, Eye, FlaskConical, Hammer, Minus } from "lucide-react";
import Link from "next/link";

import { ForwardPassDiagram } from "@/components/diagrams/forward-pass-diagram";
import { PathMap } from "@/components/diagrams/path-map";
import { ConceptExplorer } from "@/components/learn/concept-explorer";
import { PathRow } from "@/components/learn/path-row";
import { WorkflowSummary } from "@/components/project-lab/workflow";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import { StatusTag } from "@/components/ui/status-tag";
import { site } from "@/config/site";
import { getConcepts, getPaths, getPricing, getResearch, getWorkflow } from "@/lib/content";

const approach = [
  {
    Icon: Eye,
    title: "See it",
    body: "Lessons that show what a model does with each number, at a beginner or technical level.",
    href: "/learn/ml-foundations/learning-from-data",
    link: "Start the first lesson",
  },
  {
    Icon: FlaskConical,
    title: "Change it",
    body: "Experiments in your browser: move a weight and watch the output respond.",
    href: "/playground",
    link: "AI Playground",
  },
  {
    Icon: Hammer,
    title: "Build it",
    body: "A full project workflow, from research question to a paper that matches your experiments.",
    href: "/project-lab",
    link: "Project Lab",
  },
];

export default async function HomePage() {
  const [paths, concepts, workflow, research, pricing] = await Promise.all([
    getPaths(),
    getConcepts(),
    getWorkflow(),
    getResearch(),
    getPricing(),
  ]);
  const pathTitles = Object.fromEntries(paths.map((p) => [p.slug, p.title]));

  return (
    <>
      {/* A. Hero */}
      <section aria-labelledby="hero-heading" className="border-b border-line pb-16 pt-12 sm:pb-20 sm:pt-16">
        <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-14">
          <div>
            <h1 id="hero-heading" className="max-w-[16ch] text-display">
              {site.tagline}
            </h1>
            <p className="mt-6 text-xl text-fg sm:text-2xl">Learn the theory. Explore the process. Build something real.</p>
            <p className="mt-4 max-w-prose text-lg text-fg-muted">
              Lessons with experiments that compute in your browser, a complete project workflow, and a guide to writing
              research that reports exactly what you did.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/learn">Start learning</ButtonLink>
              <ButtonLink href="/playground" variant="secondary">
                Explore the AI Lab
              </ButtonLink>
            </div>
          </div>
          <ForwardPassDiagram />
        </Container>
      </section>

      <section aria-label="How you learn here" className="border-b border-line">
        <Container>
          <ul className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
            {approach.map(({ Icon, title, body, href, link }) => (
              <li key={title} className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
                <p className="flex items-center gap-3 text-xl font-bold">
                  <Icon aria-hidden className="size-5 text-link" />
                  {title}
                </p>
                <p className="mt-2 text-fg-muted">{body}</p>
                <Link href={href} className="mt-3 inline-block text-sm font-bold underline decoration-line-strong underline-offset-4 hover:decoration-link">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* B. Learning paths */}
      <Section
        id="paths"
        title="Eight paths, and the order to take them in"
        intro="Each path says where it takes you and what you need first. Start with Path A or B; the map shows what each one unlocks."
        action={<ButtonLink href="/learn" variant="secondary">Browse all paths</ButtonLink>}
      >
        <div className="mb-10 hidden rounded-panel border border-line bg-sunken p-6 md:block">
          <PathMap paths={paths} />
        </div>
        <div className="grid gap-x-12 md:grid-cols-2">
          {paths.map((path) => (
            <PathRow key={path.slug} path={path} titles={pathTitles} />
          ))}
        </div>
      </Section>

      {/* C. Learn by visualizing */}
      <Section
        id="visualize"
        className="border-t border-line"
        title="Learn by looking inside"
        intro="A preview of the explanations in each path. These diagrams use example values to show the mechanism; live versions you can edit are on the Playground roadmap."
      >
        <ConceptExplorer concepts={concepts} pathTitles={pathTitles} />
      </Section>

      {/* D. From theory to real projects */}
      <Section
        id="projects"
        className="border-t border-line"
        title="From theory to a real project"
        intro="The Project Lab walks one machine learning project through fifteen steps, from a research question to a reproducible result. Preprocessing, splitting and evaluation get as much attention as the model."
        action={<ButtonLink href="/project-lab" variant="secondary">Open the Project Lab</ButtonLink>}
      >
        <WorkflowSummary phases={workflow.phases} steps={workflow.steps} />
        <p className="mt-5 text-sm text-fg-muted">
          The underlined step has a complete guide with code and a checklist. The others are outlined.
        </p>
      </Section>

      {/* E. Research and paper writing */}
      <Section
        id="research"
        className="border-t border-line"
        title="From a research question to a paper"
        intro="For learners who want to go further: find a gap, design fair experiments, and write a paper that reports exactly what was done."
        action={<ButtonLink href="/research" variant="secondary">Research & Papers</ButtonLink>}
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <ol className="space-y-6">
              {[
                ["A question worth answering", "Read until you can name what isn’t known yet, and why it matters."],
                ["An experiment someone can repeat", "Baselines, ablations, fixed splits and logged runs — including the ones that didn’t work."],
                ["A paper that matches the evidence", "Every number traces to a run, every citation to a source you have read."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-sm font-bold text-fg-muted">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-xl">{title}</h3>
                    <p className="mt-1 text-fg-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 max-w-prose border-l-2 border-primary pl-4 text-fg">
              Never invent citations, results, datasets or contributions. A paper must describe experiments that were
              actually run.
            </p>
          </div>
          <div className="rounded-panel border border-line bg-sunken p-6 sm:p-8">
            <p className="font-bold">A typical ML paper, in reading order</p>
            <ol className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {research.paperSections.map((s, i) => (
                <li key={s.id} className="flex gap-3 border-b border-line py-2.5">
                  <span className="w-5 text-right text-sm tabular-nums text-fg-faint">{i + 1}</span>
                  <span>{s.title}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-fg-muted">Structure varies by venue and field; always follow the venue’s template.</p>
          </div>
        </div>
      </Section>

      {/* F. Free versus Premium */}
      <Section
        id="pricing"
        className="border-t border-line"
        title="Free to learn. Premium for deeper tools, later."
        intro="Pricing isn’t set and nothing is for sale. This is the intended split between free and premium."
        action={<ButtonLink href="/pricing" variant="secondary">Pricing details</ButtonLink>}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {pricing.plans.map((plan) => (
            <div
              key={plan.id}
              className={
                plan.id === "free"
                  ? "rounded-panel border-2 border-primary p-6 sm:p-8"
                  : "rounded-panel border border-dashed border-line-strong p-6 sm:p-8"
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-2xl">{plan.name}</h3>
                <StatusTag kind={plan.id} label={plan.status} />
              </div>
              <p className="mt-3 text-fg-muted">{plan.summary}</p>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex gap-3">
                    {plan.id === "free" ? (
                      <Check aria-hidden className="mt-1 size-4 shrink-0 text-link" />
                    ) : (
                      <Minus aria-hidden className="mt-1 size-4 shrink-0 text-fg-faint" />
                    )}
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
