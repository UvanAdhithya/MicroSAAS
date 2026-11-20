import { renderOgImage } from "@/lib/og-image";

export const alt = "Free website SEO analyzer — SEOSnap";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Free SEO tool",
    title: "SEO Analyzer",
    subtitle:
      "Audit any page's title, meta description, OpenGraph and Twitter tags, headings and canonical URL, with a live Google SERP preview.",
    chips: ["Title & meta tags", "OpenGraph", "SERP preview"],
  });
}
