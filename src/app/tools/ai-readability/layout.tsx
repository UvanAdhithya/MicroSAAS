import type { Metadata } from "next";

/* Metadata lives in the route layout because page.tsx is a client component. */

export const metadata: Metadata = {
  title: "Free AI Readability Checker",
  description:
    "Check whether AI assistants such as ChatGPT and Perplexity can read your page, or whether JavaScript is hiding the content from them. Free, no signup.",
  alternates: { canonical: "/tools/ai-readability" },
};

export default function AiReadabilityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
