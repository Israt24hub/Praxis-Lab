import type { Metadata } from "next";
import Link from "next/link";

import { PathMap } from "@/components/diagrams/path-map";
import { PathBrowser } from "@/components/learn/path-browser";
import { Container, PageHeader, PhaseNote } from "@/components/ui/layout";
import { getPaths } from "@/lib/content";

export const metadata: Metadata = {
  title: "Learn",
  description: "The Praxis Lab curriculum: eight learning paths from mathematics and machine learning to LLMs, engineering and research writing.",
};

export default async function LearnPage() {
  const paths = await getPaths();
  const topics = paths.flatMap((p) => p.topics.map((t) => ({ path: p, topic: t })));
  const complete = topics.filter((t) => t.topic.lessonId);

  return (
    <>
      <PageHeader
        title="The curriculum"
        lead="Eight paths, from the mathematics behind models to writing a research paper. Every topic has its own page; the ones marked complete are full lessons with an experiment, code, exercises and a quiz."
      >
        <PhaseNote>
          {complete.length} of {topics.length} lessons are complete, each with an experiment that computes in your browser.
          The rest are planned and say what they will cover. Complete lessons:
        </PhaseNote>
        <ul className="mt-4 flex max-w-4xl flex-wrap gap-2">
          {complete.map((c) => (
            <li key={c.topic.slug}>
              <Link
                href={`/learn/${c.path.slug}/${c.topic.slug}`}
                className="inline-block rounded-full border border-line bg-surface px-3 py-1 text-sm text-link hover:border-primary"
              >
                {c.topic.title}
              </Link>
            </li>
          ))}
        </ul>
      </PageHeader>
      <Container className="py-12 sm:py-16">
        <h2 className="sr-only">Prerequisite map</h2>
        <div className="mb-12 hidden rounded-panel border border-line bg-sunken p-6 md:block">
          <PathMap paths={paths} />
        </div>
        <PathBrowser paths={paths} />
      </Container>
    </>
  );
}
