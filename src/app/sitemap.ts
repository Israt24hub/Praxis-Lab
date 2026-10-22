import type { MetadataRoute } from "next";

import { site } from "@/config/site";
import { getPaths, getWorkflow } from "@/lib/content";

/*
 * Every public page, built from the same content the pages use, so new lessons
 * and steps appear here automatically. Complete lessons get a higher priority
 * than planned-lesson pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [paths, { steps }] = await Promise.all([getPaths(), getWorkflow()]);
  const url = (path: string) => `${site.url}${path}`;

  const fixed: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/learn"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/playground"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/project-lab"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/research"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/pricing"), changeFrequency: "monthly", priority: 0.3 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const pathPages: MetadataRoute.Sitemap = paths.map((p) => ({ url: url(`/learn/${p.slug}`), changeFrequency: "weekly", priority: 0.7 }));

  const topicPages: MetadataRoute.Sitemap = paths.flatMap((p) =>
    p.topics.map((t) => ({
      url: url(`/learn/${p.slug}/${t.slug}`),
      changeFrequency: t.lessonId ? "monthly" : "weekly",
      priority: t.lessonId ? 0.8 : 0.4,
    })),
  );

  const stepPages: MetadataRoute.Sitemap = steps.map((s) => ({
    url: url(`/project-lab/${s.slug}`),
    changeFrequency: "monthly",
    priority: s.hasGuide ? 0.7 : 0.5,
  }));

  return [...fixed, ...pathPages, ...topicPages, ...stepPages];
}
