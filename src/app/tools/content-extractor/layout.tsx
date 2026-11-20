import type { Metadata } from "next";

/* Metadata lives in the route layout because page.tsx is a client component. */

export const metadata: Metadata = {
  title: "Free Content Extractor",
  description:
    "Extract the full heading outline (H1, H2, H3) of any web page in DOM order, plus a word count, to reverse-engineer a competitor's content structure. Free, no signup.",
  alternates: { canonical: "/tools/content-extractor" },
};

export default function ContentExtractorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
