import { renderOgImage } from "@/lib/og-image";

export const alt = "Free content outline and heading extractor — SEOSnap";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Free SEO tool",
    title: "Content Extractor",
    subtitle:
      "Pull the full heading outline of any page in document order, plus a word count, to plan your own content against a competitor's.",
    chips: ["H1–H3 outline", "Word count", "DOM order"],
  });
}
