import { renderOgImage } from "@/lib/og-image";

export const alt = "Free AI readability checker — SEOSnap";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Free SEO tool",
    title: "AI Readability Checker",
    subtitle:
      "Check whether AI assistants can actually read a page, or whether JavaScript is hiding the content from them.",
    chips: ["Eleven checks scored", "Non-JS crawler view", "No signup"],
  });
}
