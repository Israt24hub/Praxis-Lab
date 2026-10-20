import { ArrowLeft, CheckCircle2, Circle, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CurriculumNav } from "@/components/lessons/curriculum-nav";
import { Container } from "@/components/ui/layout";
import { getPath, getPaths } from "@/lib/content";

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
  return path ? { title: `Path ${path.code}: ${path.title}`, description: path.destination } : { title: "Path not found" };
}

const levelLabel = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

export default async function PathPage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const [path, paths] = await Promise.all([getPath(slug), getPaths()]);
  if (!path) notFound();

  const titles = Object.fromEntries(paths.map((p) => [p.slug, p.title]));
  const unlocks = paths.filter((p) => p.prerequisitePaths.includes(path.slug));
  const complete = path.topics.filter((t) => t.lessonId).length;

  return (
    <Container className="grid gap-10 py-10 sm:py-14 xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-12">
      <div className="hidden xl:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8">
          <CurriculumNav paths={paths} currentPath={path.slug} />
        </div>
      </div>

      <div className="min-w-0">
        <Link href="/learn" className="inline-flex items-center gap-2 rounded text-fg-muted hover:text-fg">
          <ArrowLeft aria-hidden className="size-4" />
          The curriculum
        </Link>

        <header className="mt-6 rounded-panel bg-mist p-6 sm:p-8">
          <p className="text-sm font-semibold text-link">
            Path {path.code}, {levelLabel[path.level]}
          </p>
          <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{path.title}</h1>
          <p className="mt-4 max-w-prose text-lg text-fg-muted">{path.summary}</p>
          <p className="mt-6 max-w-prose text-lg text-fg">
            <span className="font-semibold">Where it takes you: </span>
            {path.destination}
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section aria-labelledby="topics">
            <h2 id="topics" className="text-3xl">
              Topics
            </h2>
            <p className="mt-2 text-fg-muted">
              {path.topics.length} topics, {complete} complete. Every topic opens its own page; planned pages say what the lesson will cover.
            </p>
            <ol className="mt-6 border-t border-line">
              {path.topics.map((t, i) => (
                <li key={t.slug} className="border-b border-line">
                  <Link href={`/learn/${path.slug}/${t.slug}`} className="grid grid-cols-[2rem_1fr] gap-x-3 py-5 hover:bg-mist sm:grid-cols-[2.5rem_1fr_auto] sm:px-2">
                    <span className="pt-0.5 text-sm tabular-nums text-fg-faint">{i + 1}</span>
                    <span>
                      <span className="block text-lg font-semibold text-fg">{t.title}</span>
                      <span className="mt-1 block text-fg-muted">{t.summary}</span>
                    </span>
                    <span
                      className={
                        t.lessonId
                          ? "col-start-2 mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-success sm:col-start-3 sm:mt-0"
                          : "col-start-2 mt-2 inline-flex items-center gap-1.5 text-sm text-fg-faint sm:col-start-3 sm:mt-0"
                      }
                    >
                      {t.lessonId ? <CheckCircle2 aria-hidden className="size-4" /> : <Circle aria-hidden className="size-4" />}
                      {t.lessonId ? "Complete lesson" : "Planned"}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>

            <h2 className="mt-12 text-2xl">The project you finish with</h2>
            <p className="mt-3 max-w-prose text-fg-muted">{path.capstone}</p>
            <Link href="/project-lab" className="mt-3 inline-block font-semibold text-link underline underline-offset-4">
              How projects are structured in the Project Lab
            </Link>
          </section>

          <aside aria-label="Path details" className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-panel border border-line bg-surface p-5">
              <h2 className="font-sans text-lg font-semibold">Before you start</h2>
              <ul className="mt-3 space-y-2 text-fg-muted">
                {path.prerequisitePaths.map((pre) => (
                  <li key={pre}>
                    <Link href={`/learn/${pre}`} className="text-link underline underline-offset-4">
                      {titles[pre]}
                    </Link>
                  </li>
                ))}
                {path.prerequisiteSkills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              {unlocks.length > 0 ? (
                <>
                  <h2 className="mt-6 font-sans text-lg font-semibold">Unlocks next</h2>
                  <ul className="mt-3 space-y-2">
                    {unlocks.map((u) => (
                      <li key={u.slug}>
                        <Link href={`/learn/${u.slug}`} className="text-link underline underline-offset-4">
                          {u.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
            <div className="rounded-panel border border-dashed border-line-strong p-5">
              <h2 className="flex items-center gap-2 font-sans text-lg font-semibold">
                <Lock aria-hidden className="size-4 text-fg-muted" />
                Planned premium extras
              </h2>
              <ul className="mt-3 space-y-2 text-fg-muted">
                {path.premiumExtras.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </Container>
  );
}
