import type { Metadata } from "next";

/* Metadata lives in the route layout because page.tsx is a client
 * component, and Next.js only reads metadata exports from server files.
 * Without this the route inherits the root layout's title verbatim, so
 * all six pages of the site competed under one identical title. */

export const metadata: Metadata = {
  title: "Free Website SEO Analyzer",
  description:
    "Analyze any page's title tag, meta description, OpenGraph and Twitter tags, headings and canonical URL in seconds, with a live Google SERP preview. Free, no signup.",
  alternates: { canonical: "/tools/seo-analyzer" },
};

export default function SeoAnalyzerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
