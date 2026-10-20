/*
 * Content accessors. Pages import from here, never from src/content directly,
 * so local mock data can be swapped for a CMS or API by changing only this file.
 * Functions are async and cached ("use cache") to match that future shape.
 */
import { concepts } from "@/content/concepts";
import { experiments } from "@/content/experiments";
import { splitGuide } from "@/content/guides/split-without-leakage";
import { plans, pricingFaq } from "@/content/pricing";
import { phases, preprocessingByDataType, steps } from "@/content/project-lab";
import { paths } from "@/content/paths";
import {
  honestReporting,
  paperSections,
  researchStages,
  sampleOutline,
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
  return { phases, steps, preprocessingByDataType };
}

export async function getStepGuide(slug: string) {
  "use cache";
  const step = steps.find((s) => s.slug === slug && s.hasGuide);
  if (!step) return null;
  // Only one guide exists in Phase 1; future guides register here.
  const guide = slug === splitGuide.stepSlug ? splitGuide : null;
  return guide ? { step, guide } : null;
}

export async function getResearch() {
  "use cache";
  return { researchStages, writingRoadmap, honestReporting, sampleOutline, paperSections };
}

export async function getPricing() {
  "use cache";
  return { plans, pricingFaq };
}

export type SplitGuide = typeof splitGuide;
