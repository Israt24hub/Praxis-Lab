import type { MetadataRoute } from "next";

import { site } from "@/config/site";

/* Everything public may be crawled; the sitemap lists every page. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
