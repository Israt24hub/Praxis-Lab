import type { Metadata } from "next";

import { ExperimentCatalog } from "@/components/playground/experiment-catalog";
import { NeuronLab } from "@/components/playground/neuron-lab";
import { Container, PageHeader, PhaseNote } from "@/components/ui/layout";
import { StatusTag } from "@/components/ui/status-tag";
import { getExperiments, getPaths } from "@/lib/content";

export const metadata: Metadata = {
  title: "AI Playground",
  description: "Interactive experiments that show what happens inside a model. One runs in your browser today.",
};

export default async function PlaygroundPage() {
  const [experiments, paths] = await Promise.all([getExperiments(), getPaths()]);
  const pathTitles = Object.fromEntries(paths.map((p) => [p.slug, p.title]));
  const live = experiments.find((e) => e.status === "live" && e.id === "single-neuron");
  const planned = experiments.filter((e) => e.status !== "live");

  return (
    <>
      <PageHeader
        title="AI Playground"
        lead="Change a value, watch what the model does with it. Experiments here either run real computations in your browser or are clearly labelled as planned."
      >
        <PhaseNote>
          One experiment is live. Larger explorers — including 3D architecture views — are planned for later phases.
        </PhaseNote>
      </PageHeader>

      {live ? (
        <section aria-labelledby="neuron-heading" className="py-12 sm:py-16">
          <Container>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-prose">
                <StatusTag kind="live" />
                <h2 id="neuron-heading" className="mt-3 text-3xl sm:text-4xl">
                  {live.title}
                </h2>
                <p className="mt-3 text-lg text-chalk-muted">
                  Every unit in a neural network does this: multiply each input by a weight, add a bias, and pass the sum
                  through an activation function. Training is the process of finding good weights and biases; here you
                  set them yourself.
                </p>
              </div>
            </div>
            <NeuronLab />
          </Container>
        </section>
      ) : null}

      <section aria-labelledby="planned-heading" className="border-t border-line py-12 sm:py-16">
        <Container>
          <div className="mb-8 max-w-prose">
            <h2 id="planned-heading" className="text-3xl sm:text-4xl">
              Planned experiments
            </h2>
            <p className="mt-3 text-lg text-chalk-muted">
              What the Playground is being built towards. Nothing below works yet; each will be marked when it does.
            </p>
          </div>
          <ExperimentCatalog experiments={planned} pathTitles={pathTitles} />
        </Container>
      </section>
    </>
  );
}
