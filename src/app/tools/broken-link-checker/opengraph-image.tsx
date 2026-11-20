import { renderOgImage } from "@/lib/og-image";

export const alt = "Free broken link checker — SEOSnap";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Free SEO tool",
    title: "Broken Link Checker",
    subtitle:
      "Scan any page for dead links and see the HTTP status of every URL it points to. Up to 50 links per scan, no daily limit.",
    chips: ["Up to 50 links", "HTTP status codes", "CSV export"],
  });
}
