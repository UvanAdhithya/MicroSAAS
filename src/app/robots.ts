import type { MetadataRoute } from "next";

/**
 * Dynamic robots.txt generated via Next.js App Router.
 * Ensures search engines can crawl the site while blocking
 * internal routes that shouldn't be indexed.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devtools-lilac-nine.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
