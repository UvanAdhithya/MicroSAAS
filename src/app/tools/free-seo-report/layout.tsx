import type { Metadata } from "next";

/* Metadata lives in the route layout because page.tsx is a client component. */

export const metadata: Metadata = {
  title: "Free SEO Report with PDF Export",
  description:
    "Generate a technical SEO health report for any URL and download it as a PDF. Scores title, meta description, headings, links and word count. Free, no signup.",
  alternates: { canonical: "/tools/free-seo-report" },
};

export default function FreeSeoReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
