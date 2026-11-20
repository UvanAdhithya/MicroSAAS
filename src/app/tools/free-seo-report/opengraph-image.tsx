import { renderOgImage } from "@/lib/og-image";

export const alt = "Free SEO report with PDF export — SEOSnap";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Free SEO tool",
    title: "Free SEO Report",
    subtitle:
      "Score any page's technical SEO across six weighted signals and download the findings as a PDF. No account needed.",
    chips: ["0–100 health score", "PDF export", "No signup"],
  });
}
