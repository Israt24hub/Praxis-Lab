import { BookOpen, Clock, FlaskConical, GraduationCap, Lightbulb, ListChecks, Target } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { CodeBlock } from "@/components/ui/code-block";
import { StatusTag } from "@/components/ui/status-tag";
import type { LearningPath, Lesson, Topic } from "@/types/content";

import { ExplanationToggle } from "./explanation-toggle";
import { interactiveRegistry } from "./interactive-registry";
import { Quiz } from "./quiz";
import { Blocks, RichText } from "./rich-text";

const levelLabel = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

const sectionGroups = [
  { id: "overview", label: "Overview" },
  { id: "concept", label: "Concept" },
  { id: "experiment", label: "Experiment" },
  { id: "code", label: "Code" },
  { id: "practice", label: "Practice" },
  { id: "resources", label: "Resources" },
  { id: "teaching", label: "For teachers" },
];

function LessonSection({ id, title, children, step }: { id: string; title: string; children: ReactNode; step?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28">
      {step ? <p className="text-sm text-fg-faint">{step}</p> : null}
      <h2 id={`${id}-h`} className="text-[1.75rem] leading-tight sm:text-3xl">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 mt-10 text-xl text-fg first:mt-0">{children}</h3>;
}

interface Props {
  lesson: Lesson;
  path: LearningPath;
  topic: Topic;
  topicTitles: Record<string, string>;
}

export function LessonPage({ lesson, path, topic, topicTitles }: Props) {
  const Interactive = interactiveRegistry[lesson.interactive.component];

  return (
    <article className="min-w-0">
      {/* Header, after the design board: a calm panel with the essentials. */}
      <header className="rounded-panel bg-mist p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/learn/${path.slug}`}
            className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-link hover:underline"
          >
            Path {path.code}: {path.title}
          </Link>
          <StatusTag kind="complete" />
        </div>
        <h1 className="mt-4 text-[2.1rem] leading-[1.12] sm:text-5xl">{lesson.title}</h1>
        <p className="mt-4 max-w-prose text-lg text-fg-muted">{lesson.summary}</p>
      </header>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-panel border border-line bg-surface p-5">
          <p className="flex items-center gap-2 font-semibold">
            <Target aria-hidden className="size-4 text-link" />
            Learning objectives
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-fg-muted marker:text-fg-faint">
            {lesson.objectives.map((o) => (
              <li key={o}>
                <RichText text={o} />
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-panel border border-line bg-surface p-5">
          <p className="flex items-center gap-2 font-semibold">
            <Clock aria-hidden className="size-4 text-link" />
            Estimated time
          </p>
          <p className="mt-3 text-fg-muted">
            {lesson.minutes[0]}–{lesson.minutes[1]} minutes
          </p>
          <p className="mt-1 text-xs text-fg-faint">A planning guide, not a measurement.</p>
        </div>
        <div className="rounded-panel border border-line bg-surface p-5">
          <p className="flex items-center gap-2 font-semibold">
            <GraduationCap aria-hidden className="size-4 text-link" />
            Level
          </p>
          <p className="mt-3">
            <span className="rounded-full bg-mist px-3 py-1 text-sm font-medium text-fg">{levelLabel[lesson.level]}</span>
          </p>
        </div>
      </div>

      {/* Section navigation styled as tabs; links jump within the page. */}
      <nav
        aria-label="Lesson sections"
        className="sticky top-16 z-30 -mx-5 mt-6 border-b border-line bg-page/95 px-5 py-2 backdrop-blur-sm sm:mx-0 sm:px-0"
      >
        <ul className="flex gap-1 overflow-x-auto">
          {sectionGroups.map((g) => (
            <li key={g.id}>
              <a
                href={`#${g.id}`}
                className="block whitespace-nowrap rounded-control px-3 py-1.5 text-sm text-fg-muted hover:bg-mist hover:text-fg"
              >
                {g.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 space-y-20">
        <LessonSection id="overview" title="Overview">
          <SubHeading>Before you start</SubHeading>
          <ul className="list-disc space-y-1.5 pl-5 text-fg-muted marker:text-fg-faint">
            {lesson.prerequisites.map((p) => (
              <li key={p.label}>
                {p.href ? (
                  <Link href={p.href} className="text-link underline underline-offset-4">
                    {p.label}
                  </Link>
                ) : (
                  p.label
                )}
              </li>
            ))}
          </ul>
          <SubHeading>Introduction</SubHeading>
          <Blocks blocks={lesson.intro} />
          <SubHeading>Why this exists</SubHeading>
          <Blocks blocks={lesson.why} />
        </LessonSection>

        <LessonSection id="concept" title="The concept">
          <ExplanationToggle beginner={lesson.explanation.beginner} technical={lesson.explanation.technical} />

          <SubHeading>Analogy: {lesson.analogy.title}</SubHeading>
          <Blocks blocks={lesson.analogy.blocks} />

          <SubHeading>Worked example: {lesson.workedExample.title}</SubHeading>
          <Blocks blocks={lesson.workedExample.blocks} />

          {lesson.math ? (
            <>
              <SubHeading>The mathematics</SubHeading>
              <Blocks blocks={lesson.math.blocks} />
              <div className="mt-5 overflow-x-auto rounded-panel border border-line bg-surface" tabIndex={0} role="region" aria-label="Notation">
                <table className="w-full text-left text-[0.95rem]">
                  <caption className="px-4 pt-3 text-left text-sm font-semibold">Notation</caption>
                  <tbody>
                    {lesson.math.notation.map((n) => (
                      <tr key={n.symbol} className="border-t border-line first:border-t-0">
                        <th scope="row" className="math w-28 px-4 py-2 align-top font-normal text-fg sm:w-40">
                          {n.symbol}
                        </th>
                        <td className="px-4 py-2 text-fg-muted">
                          <RichText text={n.meaning} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          <SubHeading>{lesson.process.title}</SubHeading>
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {lesson.process.steps.map((s, i) => (
              <li key={s.title} className="rounded-panel border border-line bg-surface p-4">
                <span className="grid size-7 place-items-center rounded-full bg-mist text-sm font-semibold text-fg">{i + 1}</span>
                <p className="mt-2 font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-fg-muted">
                  <RichText text={s.text} />
                </p>
              </li>
            ))}
          </ol>
        </LessonSection>

        <LessonSection id="experiment" title="Experiment">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <StatusTag kind={lesson.interactive.kind === "computation" ? "live" : "simulation"} />
          </div>
          <p className="max-w-prose text-fg-muted">
            <RichText text={lesson.interactive.intro} />
          </p>
          <div className="mt-6">{Interactive ? <Interactive /> : <p className="text-danger">This experiment could not be loaded.</p>}</div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-panel border border-line bg-surface p-5">
              <p className="flex items-center gap-2 font-semibold">
                <FlaskConical aria-hidden className="size-4 text-link" />
                Try this
              </p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-fg-muted marker:text-fg-faint">
                {lesson.interactive.tryThis.map((t) => (
                  <li key={t}>
                    <RichText text={t} />
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-panel border border-line bg-surface p-5">
              <p className="flex items-center gap-2 font-semibold">
                <ListChecks aria-hidden className="size-4 text-link" />
                What you should see
              </p>
              <dl className="mt-3 space-y-3">
                {lesson.interactive.expect.map((e) => (
                  <div key={e.action}>
                    <dt className="text-sm font-semibold text-fg">
                      <RichText text={e.action} />
                    </dt>
                    <dd className="text-sm text-fg-muted">
                      <RichText text={e.result} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </LessonSection>

        <LessonSection id="code" title="Implementation">
          <CodeBlock code={lesson.code.source} label={lesson.code.label} language={lesson.code.language} />
          {lesson.code.output ? (
            <div className="mt-4 rounded-panel border border-line bg-sunken p-4">
              <p className="text-sm font-semibold">{lesson.code.output.label}</p>
              <pre className="mt-2 overflow-x-auto text-[0.875rem] text-fg">{lesson.code.output.text}</pre>
              <p className="mt-2 text-sm text-fg-muted">
                <RichText text={lesson.code.output.note} />
              </p>
            </div>
          ) : null}

          <SubHeading>Line by line</SubHeading>
          <dl className="space-y-3">
            {lesson.code.walkthrough.map((w) => (
              <div key={w.lines} className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-4">
                <dt className="font-mono text-sm text-fg-faint">lines {w.lines}</dt>
                <dd className="text-fg-muted">
                  <RichText text={w.text} />
                </dd>
              </div>
            ))}
          </dl>

          <SubHeading>Input and output shapes</SubHeading>
          <div className="overflow-x-auto rounded-panel border border-line bg-surface" tabIndex={0} role="region" aria-label="Array shapes">
            <table className="w-full min-w-[30rem] text-left text-[0.95rem]">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-2.5">Name</th>
                  <th scope="col" className="px-4 py-2.5">Shape</th>
                  <th scope="col" className="px-4 py-2.5">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {lesson.code.shapes.map((s) => (
                  <tr key={s.name} className="border-t border-line first:border-t-0">
                    <td className="px-4 py-2 font-mono text-fg">{s.name}</td>
                    <td className="px-4 py-2 font-mono text-fg">{s.shape}</td>
                    <td className="px-4 py-2 text-fg-muted">
                      <RichText text={s.meaning} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LessonSection>

        <LessonSection id="practice" title="Apply and practise">
          <SubHeading>Where this is used</SubHeading>
          <ul className="grid gap-3 md:grid-cols-3">
            {lesson.useCases.map((u) => (
              <li key={u.title} className="rounded-panel border border-line bg-surface p-4">
                <p className="font-semibold">{u.title}</p>
                <p className="mt-1 text-sm text-fg-muted">
                  <RichText text={u.text} />
                </p>
              </li>
            ))}
          </ul>

          <SubHeading>Mistakes, limitations and misconceptions</SubHeading>
          <ul className="space-y-3">
            {lesson.mistakes.map((m) => (
              <li key={m.title} className="rounded-panel border border-line bg-surface p-4">
                <p className="text-xs font-semibold text-highlight-text">
                  {m.kind === "mistake" ? "Common mistake" : m.kind === "limitation" ? "Limitation" : "Misconception"}
                </p>
                <p className="mt-1 font-semibold">{m.title}</p>
                <p className="mt-1 text-fg-muted">
                  <RichText text={m.text} />
                </p>
              </li>
            ))}
          </ul>

          <SubHeading>Exercise</SubHeading>
          <div className="rounded-panel border border-line bg-surface p-5">
            <Blocks blocks={lesson.exercise.prompt} />
            <div className="mt-5 space-y-2">
              {lesson.exercise.hints.map((h, i) => (
                <details key={h} className="rounded-control border border-line px-4 py-2">
                  <summary className="cursor-pointer text-sm font-semibold">
                    <Lightbulb aria-hidden className="mr-2 inline size-4 text-link" />
                    Hint {i + 1}
                  </summary>
                  <p className="mt-2 text-fg-muted">
                    <RichText text={h} />
                  </p>
                </details>
              ))}
              <details className="rounded-control border border-primary px-4 py-2">
                <summary className="cursor-pointer text-sm font-semibold text-link">Show the worked solution</summary>
                <Blocks blocks={lesson.exercise.solution} className="mt-3" />
              </details>
            </div>
          </div>

          <SubHeading>Knowledge check</SubHeading>
          <Quiz questions={lesson.quiz} />
        </LessonSection>

        <LessonSection id="resources" title="Resources and next steps">
          <SubHeading>Glossary</SubHeading>
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {lesson.glossary.map((g) => (
              <div key={g.term} className="border-t border-line pt-3">
                <dt className="font-semibold">{g.term}</dt>
                <dd className="text-sm text-fg-muted">
                  <RichText text={g.definition} />
                </dd>
              </div>
            ))}
          </dl>

          <SubHeading>References</SubHeading>
          <ul className="space-y-3">
            {lesson.references.map((r) => (
              <li key={r.title} className="flex gap-3">
                <BookOpen aria-hidden className="mt-1 size-4 shrink-0 text-fg-faint" />
                <div>
                  {r.url ? (
                    <a href={r.url} className="font-semibold text-link underline underline-offset-4" rel="noreferrer" target="_blank">
                      {r.title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <p className="font-semibold">{r.title}</p>
                  )}
                  <p className="text-sm text-fg-muted">{r.source}</p>
                  <p className="text-sm text-fg-muted">
                    <RichText text={r.note} />
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <SubHeading>Suggested next lessons</SubHeading>
          <ul className="grid gap-3 md:grid-cols-3">
            {lesson.next.map((n) => (
              <li key={`${n.pathSlug}/${n.topicSlug}`}>
                <Link
                  href={`/learn/${n.pathSlug}/${n.topicSlug}`}
                  className="block h-full rounded-panel border border-line bg-surface p-4 hover:border-primary"
                >
                  <span className="font-semibold text-link">{topicTitles[`${n.pathSlug}/${n.topicSlug}`] ?? n.topicSlug}</span>
                  <span className="mt-1 block text-sm text-fg-muted">
                    <RichText text={n.reason} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </LessonSection>

        <LessonSection id="teaching" title="For teachers">
          <p className="max-w-prose text-fg-muted">
            Notes for using this lesson in a class. Students can read them too — knowing the common misconceptions helps.
          </p>
          <SubHeading>Teaching notes</SubHeading>
          <ul className="list-disc space-y-1.5 pl-5 text-fg-muted marker:text-fg-faint">
            {lesson.teaching.notes.map((n) => (
              <li key={n}>
                <RichText text={n} />
              </li>
            ))}
          </ul>
          <SubHeading>Classroom demonstration</SubHeading>
          <p className="text-fg-muted">
            <RichText text={lesson.teaching.demo} />
          </p>
          <SubHeading>Discussion questions</SubHeading>
          <ol className="list-decimal space-y-1.5 pl-5 text-fg-muted marker:text-fg-faint">
            {lesson.teaching.discussion.map((d) => (
              <li key={d}>
                <RichText text={d} />
              </li>
            ))}
          </ol>
          <SubHeading>Misconceptions to listen for</SubHeading>
          <ul className="list-disc space-y-1.5 pl-5 text-fg-muted marker:text-fg-faint">
            {lesson.teaching.misconceptions.map((m) => (
              <li key={m}>
                <RichText text={m} />
              </li>
            ))}
          </ul>
          <SubHeading>Challenge problem</SubHeading>
          <div className="rounded-panel border border-line bg-surface p-5">
            <p className="text-fg">
              <RichText text={lesson.teaching.challenge.prompt} />
            </p>
            <details className="mt-4 rounded-control border border-line px-4 py-2">
              <summary className="cursor-pointer text-sm font-semibold text-link">Show an answer</summary>
              <Blocks blocks={lesson.teaching.challenge.answer} className="mt-3" />
            </details>
          </div>
        </LessonSection>
      </div>

      <p className="mt-16 border-t border-line pt-6 text-sm text-fg-faint">
        {topic.title} is lesson {path.topics.findIndex((t) => t.slug === topic.slug) + 1} of {path.topics.length} in Path {path.code}.
      </p>
    </article>
  );
}
