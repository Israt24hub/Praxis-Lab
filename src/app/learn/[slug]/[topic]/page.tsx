import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CurriculumNav } from "@/components/lessons/curriculum-nav";
import { LessonPage } from "@/components/lessons/lesson-page";
import { RichText } from "@/components/lessons/rich-text";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { StatusTag } from "@/components/ui/status-tag";
import { getPaths, getTopic, getTopicParams } from "@/lib/content";
import type { LearningPath, Topic } from "@/types/content";

/* See learn/[slug]/page.tsx: unknown topics must return a real 404. */
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  return getTopicParams();
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]/[topic]">): Promise<Metadata> {
  const { slug, topic } = await params;
  const data = await getTopic(slug, topic);
  if (!data) return { title: "Topic not found" };
  return { title: data.topic.title, description: data.lesson?.summary ?? data.topic.summary };
}

function PlannedTopic({
  path,
  topic,
  prev,
  next,
  completeInPath,
}: {
  path: LearningPath;
  topic: Topic;
  prev: Topic | null;
  next: Topic | null;
  completeInPath: Topic[];
}) {
  return (
    <article className="min-w-0">
      <header className="rounded-panel bg-sage p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/learn/${path.slug}`} className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-link hover:underline">
            Path {path.code}: {path.title}
          </Link>
          <StatusTag kind="planned" label="Planned lesson" />
        </div>
        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{topic.title}</h1>
        <p className="mt-4 max-w-prose text-lg text-fg-muted">{topic.summary}</p>
      </header>

      <div className="mt-6 flex gap-3 rounded-panel border border-line bg-surface p-5">
        <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-fg-muted" />
        <p className="text-fg-muted">
          This lesson hasn’t been written yet. This page shows what it will cover and where it fits, so you can plan ahead or
          learn the topic elsewhere in the meantime.
        </p>
      </div>

      <section aria-labelledby="outcomes" className="mt-10">
        <h2 id="outcomes" className="text-3xl">
          What the lesson will cover
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-lg text-fg-muted marker:text-fg-faint">
          {topic.outcomes.map((o) => (
            <li key={o}>
              <RichText text={o} />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-fg-faint">
          Like every complete lesson, it will include an explanation at two levels, a worked example, an experiment, code, an
          exercise and a quiz.
        </p>
      </section>

      <section aria-labelledby="meanwhile" className="mt-10">
        <h2 id="meanwhile" className="text-3xl">
          In the meantime
        </h2>
        <ul className="mt-4 space-y-3">
          {topic.seeAlso ? (
            <li>
              <Link href={topic.seeAlso.href} className="font-semibold text-link underline underline-offset-4">
                {topic.seeAlso.label}
              </Link>
              <span className="text-fg-muted"> covers this topic on the site already.</span>
            </li>
          ) : null}
          {completeInPath.map((t) => (
            <li key={t.slug}>
              <Link href={`/learn/${path.slug}/${t.slug}`} className="font-semibold text-link underline underline-offset-4">
                {t.title}
              </Link>
              <span className="text-fg-muted"> is a complete lesson in this path.</span>
            </li>
          ))}
          <li>
            <Link href={`/learn/${path.slug}`} className="font-semibold text-link underline underline-offset-4">
              The Path {path.code} overview
            </Link>
            <span className="text-fg-muted"> lists every topic and the path’s prerequisites.</span>
          </li>
        </ul>
      </section>

      <nav aria-label="Topics in this path" className="mt-14 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`/learn/${path.slug}/${prev.slug}`} className="rounded-control p-2 hover:bg-mist">
            <span className="flex items-center gap-2 text-sm text-fg-muted">
              <ArrowLeft aria-hidden className="size-4" />
              Previous topic
            </span>
            <span className="mt-1 block font-semibold">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/learn/${path.slug}/${next.slug}`} className="rounded-control p-2 hover:bg-mist sm:text-right">
            <span className="flex items-center gap-2 text-sm text-fg-muted sm:justify-end">
              Next topic
              <ArrowRight aria-hidden className="size-4" />
            </span>
            <span className="mt-1 block font-semibold">{next.title}</span>
          </Link>
        ) : (
          <Link href={`/learn/${path.slug}`} className={buttonStyles("secondary", "justify-self-end")}>
            Back to Path {path.code}
          </Link>
        )}
      </nav>
    </article>
  );
}

export default async function TopicPage({ params }: PageProps<"/learn/[slug]/[topic]">) {
  const { slug, topic: topicSlug } = await params;
  const [data, paths] = await Promise.all([getTopic(slug, topicSlug), getPaths()]);
  if (!data) notFound();
  const { path, topic, prev, next, lesson } = data;

  const topicTitles = Object.fromEntries(paths.flatMap((p) => p.topics.map((t) => [`${p.slug}/${t.slug}`, t.title])));

  return (
    <Container className="grid gap-10 py-10 sm:py-14 xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-12">
      <div className="hidden xl:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8">
          <CurriculumNav paths={paths} currentPath={path.slug} currentTopic={topic.slug} />
        </div>
      </div>
      <div className="min-w-0">
        <details className="mb-6 rounded-panel border border-line bg-surface xl:hidden">
          <summary className="cursor-pointer px-4 py-3 font-semibold">Curriculum: Path {path.code}</summary>
          <div className="border-t border-line p-3">
            <CurriculumNav paths={paths} currentPath={path.slug} currentTopic={topic.slug} />
          </div>
        </details>
        {lesson ? (
          <LessonPage lesson={lesson} path={path} topic={topic} topicTitles={topicTitles} />
        ) : (
          <PlannedTopic
            path={path}
            topic={topic}
            prev={prev}
            next={next}
            completeInPath={path.topics.filter((t) => t.lessonId && t.slug !== topic.slug)}
          />
        )}
      </div>
    </Container>
  );
}
