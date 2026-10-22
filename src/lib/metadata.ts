import type { Metadata } from "next";

import { site } from "@/config/site";

/*
 * Page metadata with matching link-preview fields. Next.js does not copy a page's
 * title into Open Graph on its own, so every page builds both from one place.
 * The preview image comes from src/app/opengraph-image.tsx for every page.
 */
/** The shared preview image (src/app/opengraph-image.tsx). A page that sets its own openGraph loses the inherited one, so it is listed explicitly. */
export const previewImage = { url: "/opengraph-image", width: 1200, height: 630, alt: `${site.name}: ${site.tagline}` };

export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const full = `${title} | ${site.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: full, description, url: path, siteName: site.name, type: "website", images: [previewImage] },
    twitter: { card: "summary_large_image", title: full, description, images: [previewImage] },
  };
}
