/*
 * Content integrity tests. Run with `npm test` (Node's built-in test runner,
 * no extra dependencies). They catch broken cross-references in the content.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { concepts } from "../src/content/concepts.ts";
import { experiments } from "../src/content/experiments.ts";
import { splitGuide } from "../src/content/guides/split-without-leakage.ts";
import { lessons } from "../src/content/lessons/index.ts";
import { paths } from "../src/content/paths.ts";
import { phases, steps } from "../src/content/project-lab.ts";
import { paperSections, researchStages } from "../src/content/research.ts";

const pathSlugs = new Set(paths.map((p) => p.slug));
const topicKeys = new Set(paths.flatMap((p) => p.topics.map((t) => `${p.slug}/${t.slug}`)));

describe("curriculum", () => {
  it("has the eight paths A–H with unique slugs", () => {
    assert.deepEqual(
      paths.map((p) => p.code),
      ["A", "B", "C", "D", "E", "F", "G", "H"],
    );
    assert.equal(pathSlugs.size, paths.length);
  });

  it("lists every roadmap topic (60) with unique slugs inside each path", () => {
    assert.equal(topicKeys.size, 60);
    for (const p of paths) {
      assert.equal(new Set(p.topics.map((t) => t.slug)).size, p.topics.length, p.slug);
    }
  });

  it("only references existing paths as prerequisites", () => {
    for (const path of paths) {
      for (const pre of path.prerequisitePaths) {
        assert.ok(pathSlugs.has(pre), `${path.slug} -> unknown prerequisite ${pre}`);
        assert.notEqual(pre, path.slug);
      }
    }
  });

  it("gives every topic a summary and outcomes so planned pages are never empty", () => {
    for (const p of paths) {
      for (const t of p.topics) {
        assert.ok(t.summary.length > 20, `${p.slug}/${t.slug}`);
        assert.ok(t.outcomes.length >= 2, `${p.slug}/${t.slug}`);
      }
    }
  });
});

describe("lessons", () => {
  const published = paths.flatMap((p) => p.topics.filter((t) => t.lessonId).map((t) => ({ p, t })));

  it("every lessonId points to a lesson for the same path and topic", () => {
    assert.ok(published.length >= 2);
    for (const { p, t } of published) {
      const lesson = lessons[t.lessonId!];
      assert.ok(lesson, `missing lesson ${t.lessonId}`);
      assert.equal(lesson.pathSlug, p.slug);
      assert.equal(lesson.topicSlug, t.slug);
    }
  });

  it("every complete lesson fills the template", () => {
    for (const lesson of Object.values(lessons)) {
      const id = lesson.id;
      assert.ok(lesson.objectives.length >= 3, id);
      assert.ok(lesson.intro.length && lesson.why.length, id);
      assert.ok(lesson.explanation.beginner.length && lesson.explanation.technical.length, id);
      assert.ok(lesson.process.steps.length >= 3, id);
      assert.ok(lesson.interactive.tryThis.length && lesson.interactive.expect.length, id);
      assert.ok(lesson.code.source.length > 50 && lesson.code.shapes.length, id);
      assert.ok(lesson.mistakes.length >= 3, id);
      assert.ok(lesson.exercise.hints.length && lesson.exercise.solution.length, id);
      assert.ok(lesson.quiz.length >= 4, id);
      assert.ok(lesson.glossary.length >= 5, id);
      assert.ok(lesson.teaching.discussion.length && lesson.teaching.misconceptions.length, id);
    }
  });

  it("quiz answers point at a real option", () => {
    for (const lesson of Object.values(lessons)) {
      for (const q of lesson.quiz) {
        assert.ok(q.answer >= 0 && q.answer < q.options.length, `${lesson.id}: ${q.question}`);
      }
    }
  });

  it("next-lesson and prerequisite links resolve", () => {
    for (const lesson of Object.values(lessons)) {
      for (const n of lesson.next) assert.ok(topicKeys.has(`${n.pathSlug}/${n.topicSlug}`), `${lesson.id} -> ${n.topicSlug}`);
      for (const pre of lesson.prerequisites) {
        if (pre.href?.startsWith("/learn/")) {
          assert.ok(topicKeys.has(pre.href.replace("/learn/", "")), `${lesson.id} -> ${pre.href}`);
        }
      }
    }
  });
});

describe("concepts and experiments", () => {
  it("link to existing paths and lessons", () => {
    for (const item of [...concepts, ...experiments]) {
      assert.ok(pathSlugs.has(item.pathSlug), `${item.title} -> ${item.pathSlug}`);
    }
    for (const e of experiments) {
      if (e.lesson) assert.ok(topicKeys.has(`${e.lesson.pathSlug}/${e.lesson.topicSlug}`), e.id);
      if (e.status === "live") assert.ok(e.component, `${e.id} is live but has no component`);
    }
  });

  it("has six concepts and unique experiment ids", () => {
    assert.equal(concepts.length, 6);
    assert.equal(new Set(experiments.map((e) => e.id)).size, experiments.length);
  });
});

describe("project lab workflow", () => {
  it("has 15 steps numbered 1..15 in order", () => {
    assert.deepEqual(
      steps.map((s) => s.number),
      Array.from({ length: 15 }, (_, i) => i + 1),
    );
  });

  it("assigns every step to a known phase", () => {
    const phaseIds = new Set(phases.map((p) => p.id));
    for (const step of steps) assert.ok(phaseIds.has(step.phase), step.slug);
  });

  it("gives every step its template fields", () => {
    for (const s of steps) {
      assert.ok(s.purpose && s.input && s.output && s.next, s.slug);
      assert.ok(s.tools.length > 0 && s.mistakes.length > 0, s.slug);
    }
  });

  it("has the full guide on step 6", () => {
    assert.equal(steps[5].slug, splitGuide.stepSlug);
  });
});

describe("research", () => {
  it("lists the nine lifecycle stages and the ten paper sections", () => {
    assert.equal(researchStages.length, 9);
    assert.deepEqual(
      paperSections.map((s) => s.title),
      [
        "Abstract",
        "Introduction",
        "Related Work",
        "Methodology",
        "Experimental Setup",
        "Results",
        "Discussion",
        "Limitations",
        "Conclusion",
        "References",
      ],
    );
  });

  it("never puts concrete numeric results in the sample outline", () => {
    // Placeholders must be bracketed; a bare percentage would look like a real result.
    for (const section of paperSections) {
      assert.doesNotMatch(section.example, /\d+(\.\d+)?\s?%/, section.id);
    }
  });
});
