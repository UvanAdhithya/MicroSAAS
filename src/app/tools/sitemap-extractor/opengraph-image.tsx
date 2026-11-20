import { renderOgImage } from "@/lib/og-image";

export const alt = "Free XML sitemap extractor — SEOSnap";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Free SEO tool",
    title: "Sitemap Extractor",
    subtitle:
      "List every URL a site publishes in its robots.txt and XML sitemaps, with last-modified dates, and export the list as CSV.",
    chips: ["robots.txt", "XML sitemaps", "CSV export"],
  });
}
