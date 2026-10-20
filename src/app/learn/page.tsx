import type { Metadata } from "next";

import { PathMap } from "@/components/diagrams/path-map";
import { PathBrowser } from "@/components/learn/path-browser";
import { Container, PageHeader, PhaseNote } from "@/components/ui/layout";
import { getPaths } from "@/lib/content";

export const metadata: Metadata = {
  title: "Learn",
  description: "Seven learning paths from machine learning foundations to LLMs, fine-tuning and research writing.",
};

export default async function LearnPage() {
  const paths = await getPaths();

  return (
    <>
      <PageHeader
        title="Learning paths"
        lead="Seven paths from your first model to writing a research paper. Each one states where it takes you, what you need before starting, and the project you finish with."
      >
        <PhaseNote>
          Syllabi are published; lessons are being written. Every path’s core modules will be free.
        </PhaseNote>
      </PageHeader>
      <Container className="py-12 sm:py-16">
        <h2 className="sr-only">Prerequisite map</h2>
        <div className="mb-12 hidden rounded-panel border border-line bg-board-deep p-6 md:block">
          <PathMap paths={paths} />
        </div>
        <PathBrowser paths={paths} />
      </Container>
    </>
  );
}
