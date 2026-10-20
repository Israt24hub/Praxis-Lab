import { ArrowLeft, FlaskConical, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { Container, PageHeader, PhaseNote } from "@/components/ui/layout";
import { StatusTag } from "@/components/ui/status-tag";
import { getExperiments, getPath, getPaths } from "@/lib/content";

/*
 * Render the whole page before responding, so unknown slugs reach notFound()
 * before streaming starts and get a real 404 status.
 */
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const paths = await getPaths();
  return paths.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const path = await getPath(slug);
  return path ? { title: path.title, description: path.destination } : { title: "Path not found" };
}

const levelLabel = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

export default async function PathPage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const [path, paths, experiments] = await Promise.all([getPath(slug), getPaths(), getExperiments()]);
  if (!path) notFound();

  const titles = Object.fromEntries(paths.map((p) => [p.slug, p.title]));
  const unlocks = paths.filter((p) => p.prerequisitePaths.includes(path.slug));
  const related = experiments.filter((e) => e.pathSlug === path.slug);

  return (
    <>
      <PageHeader
        context={
          <Link href="/learn" className="inline-flex items-center gap-2 rounded hover:text-chalk">
            <ArrowLeft aria-hidden className="size-4" />
            All learning paths
          </Link>
        }
        title={path.title}
        lead={path.summary}
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-chalk-muted">
          <span>{levelLabel[path.level]}</span>
          <span aria-hidden className="h-3.5 w-px bg-line-strong" />
          <span>{path.modules.length} modules</span>
          <StatusTag kind="outline" />
        </div>
      </PageHeader>

      <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div>
          <section aria-labelledby="destination">
            <h2 id="destination" className="text-2xl">Where this path takes you</h2>
            <p className="mt-3 max-w-prose text-xl leading-relaxed">{path.destination}</p>
          </section>

          <section aria-labelledby="modules" className="mt-12">
            <h2 id="modules" className="text-2xl">Modules</h2>
            <p className="mt-2 text-chalk-muted">Lessons for these modules are being written.</p>
            <ol className="mt-5 border-t border-line">
              {path.modules.map((m, i) => (
                <li key={m.title} className="grid grid-cols-[2rem_1fr] gap-x-3 border-b border-line py-5 sm:grid-cols-[2.5rem_1fr_auto]">
                  <span className="pt-0.5 text-sm tabular-nums text-chalk-faint">{i + 1}</span>
                  <div>
                    <h3 className="text-lg">{m.title}</h3>
                    <p className="mt-1 text-chalk-muted">{m.summary}</p>
                  </div>
                  <div className="col-start-2 mt-3 sm:col-start-3 sm:mt-0">
                    <StatusTag kind={m.access} />
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="capstone" className="mt-12">
            <h2 id="capstone" className="text-2xl">The project you finish with</h2>
            <p className="mt-3 max-w-prose text-chalk-muted">{path.capstone}</p>
            <p className="mt-4">
              <Link href="/project-lab" className="font-bold underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                See how projects are structured in the Project Lab
              </Link>
            </p>
          </section>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-panel border border-line bg-board-raised p-6">
            <h2 className="text-lg">Before you start</h2>
            <ul className="mt-3 space-y-2 text-chalk-muted">
              {path.prerequisitePaths.map((pre) => (
                <li key={pre}>
                  <Link href={`/learn/${pre}`} className="text-chalk underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                    {titles[pre]}
                  </Link>{" "}
                  path
                </li>
              ))}
              {path.prerequisiteSkills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            {unlocks.length > 0 ? (
              <>
                <h2 className="mt-6 text-lg">Unlocks next</h2>
                <ul className="mt-3 space-y-2">
                  {unlocks.map((u) => (
                    <li key={u.slug}>
                      <Link href={`/learn/${u.slug}`} className="underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                        {u.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <div className="rounded-panel border border-dashed border-line-strong p-6">
            <h2 className="flex items-center gap-2 text-lg">
              <Lock aria-hidden className="size-4 text-chalk-muted" />
              Planned premium extras
            </h2>
            <ul className="mt-3 space-y-2 text-chalk-muted">
              {path.premiumExtras.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>

          {related.length > 0 ? (
            <div>
              <h2 className="flex items-center gap-2 text-lg">
                <FlaskConical aria-hidden className="size-4 text-accent" />
                Related experiments
              </h2>
              <ul className="mt-3 space-y-2">
                {related.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center gap-2">
                    <span>{e.title}</span>
                    <StatusTag kind={e.status === "live" ? "live" : "planned"} />
                  </li>
                ))}
              </ul>
              <ButtonLink href="/playground" variant="quiet" className="mt-3 text-sm">
                Go to the AI Playground
              </ButtonLink>
            </div>
          ) : null}

          <PhaseNote>Lessons aren’t published yet. This page shows the syllabus so you can plan ahead.</PhaseNote>
        </aside>
      </Container>
    </>
  );
}
