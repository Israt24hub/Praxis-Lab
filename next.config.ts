import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  async redirects() {
    // Phase 1 path merged into "Transformers and LLMs" and "Practical AI Engineering" in Phase 2.
    return [{ source: "/learn/training-fine-tuning", destination: "/learn/ai-engineering", permanent: true }];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
