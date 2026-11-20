import type { Metadata } from "next";

/* Metadata lives in the route layout because page.tsx is a client component. */

export const metadata: Metadata = {
  title: "Free XML Sitemap Extractor",
  description:
    "Extract every URL listed in a site's robots.txt and XML sitemaps, with last-modified dates. Free, no signup, and no daily crawl limit.",
  alternates: { canonical: "/tools/sitemap-extractor" },
};

export default function SitemapExtractorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
