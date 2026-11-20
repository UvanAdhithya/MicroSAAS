import { renderOgImage } from "@/lib/og-image";

/* Site-wide OpenGraph image, generated at request time. Declaring this at the
 * app/ root gives every route a preview card unless that route defines its own
 * image (the five tool routes do — see src/app/tools/<tool>/opengraph-image.tsx). */

export const alt = "SEOSnap — free SEO audit tools for any website";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Free tools",
    title: "Free SEO tools for",
    titleAccent: "any website.",
    chips: [
      "SEO Analyzer",
      "Free SEO Report",
      "Content Extractor",
      "Sitemap Extractor",
      "Broken Link Checker",
    ],
  });
}
