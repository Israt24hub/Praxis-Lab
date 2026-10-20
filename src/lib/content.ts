/*
 * Content accessors. Pages import from here, never from src/content directly,
 * so local mock data can be swapped for a CMS or API by changing only this file.
 * Functions are async and cached ("use cache") to match that future shape.
 */
import { concepts } from "@/content/concepts";
import { experiments } from "@/content/experiments";
import { splitGuide } from "@/content/guides/split-without-leakage";
import { plans, pricingFaq } from "@/content/pricing";
import { phases, steps } from "@/content/project-lab";
import { lessons } from "@/content/lessons";
import { paths } from "@/content/paths";
import {
  claimTypes,
  honestReporting,
  paperSections,
  reproducibilityChecklist,
  researchStages,
  sampleOutline,
  writingExamples,
  writingRoadmap,
} from "@/content/research";

export async function getPaths() {
  "use cache";
  return paths;
}

export async function getPath(slug: string) {
  "use cache";
  return paths.find((p) => p.slug === slug) ?? null;
}

/** A topic with its path, neighbours and lesson (null while the lesson is planned). */
export async function getTopic(pathSlug: string, topicSlug: string) {
  "use cache";
  const path = paths.find((p) => p.slug === pathSlug);
  const index = path ? path.topics.findIndex((t) => t.slug === topicSlug) : -1;
  if (!path || index === -1) return null;
  const topic = path.topics[index];
  return {
    path,
    topic,
    index,
    prev: path.topics[index - 1] ?? null,
    next: path.topics[index + 1] ?? null,
    lesson: topic.lessonId ? (lessons[topic.lessonId] ?? null) : null,
  };
}

export async function getTopicParams() {
  "use cache";
  return paths.flatMap((p) => p.topics.map((t) => ({ slug: p.slug, topic: t.slug })));
}

export async function getConcepts() {
  "use cache";
  return concepts;
}

export async function getExperiments() {
  "use cache";
  return experiments;
}

export async function getWorkflow() {
  "use cache";
  return { phases, steps };
}

/** A workflow step with its neighbours and, for step 6, the long-form guide. */
export async function getStep(slug: string) {
  "use cache";
  const index = steps.findIndex((s) => s.slug === slug);
  if (index === -1) return null;
  const step = steps[index];
  // Long-form guides register here as they are written.
  const guide = step.hasGuide && slug === splitGuide.stepSlug ? splitGuide : null;
  return { step, guide, prev: steps[index - 1] ?? null, next: steps[index + 1] ?? null, total: steps.length };
}

export async function getResearch() {
  "use cache";
  return {
    researchStages,
    writingRoadmap,
    honestReporting,
    sampleOutline,
    paperSections,
    claimTypes,
    writingExamples,
    reproducibilityChecklist,
  };
}

export async function getPricing() {
  "use cache";
  return { plans, pricingFaq };
}

export type SplitGuide = typeof splitGuide;
