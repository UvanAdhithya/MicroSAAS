import type { MetadataRoute } from "next";

/**
 * Dynamic sitemap generated at build time.
 * Add new tool routes here as they're created.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devtools-lilac-nine.vercel.app";
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  // Tool pages — add slugs here as tools are built
  const toolSlugs = [
    "seo-analyzer",
    "free-seo-report",
    "content-extractor",
    "sitemap-extractor",
    "broken-link-checker",
  ];

  const toolPages: MetadataRoute.Sitemap = toolSlugs.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages];
}
