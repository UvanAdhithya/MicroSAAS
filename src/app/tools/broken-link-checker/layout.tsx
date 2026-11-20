import type { Metadata } from "next";

/* Metadata lives in the route layout because page.tsx is a client component. */

export const metadata: Metadata = {
  title: "Free Broken Link Checker",
  description:
    "Scan any page for broken links and see the HTTP status of every URL it points to. Up to 50 links per scan. Free, no signup, no daily limit.",
  alternates: { canonical: "/tools/broken-link-checker" },
};

export default function BrokenLinkCheckerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
