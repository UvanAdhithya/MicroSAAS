import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReportView } from "./report-views";

/* ─────────────────────────────────────────────────────────
 * Fixtures mirror the exact payloads the tool pages POST to
 * /api/reports — see each route handler under src/app/api/.
 * ───────────────────────────────────────────────────────── */

const seoTitle = "A well sized SEO title for the analyzer test"; // 44 chars → ideal range
const seoDescription = "D".repeat(175); // over the 160 limit → exercises SERP truncation

const seoAnalyzerPayload = {
  url: "https://example.com/blog/post",
  title: seoTitle,
  metaDescription: seoDescription,
  og: {
    title: "OpenGraph title",
    description: "OpenGraph description",
    image: "https://cdn.example.com/og.png",
    type: "article",
    url: "https://example.com/blog/post",
  },
  twitter: { card: "summary_large_image", title: "Twitter title", description: "Twitter description" },
  h1Tags: ["Main heading"],
  h2Tags: ["Sub heading one", "Sub heading two"],
  canonical: "https://example.com/blog/post",
  favicon: "/favicon.ico",
  language: "en",
};

const contentExtractorPayload = {
  url: "https://example.com",
  title: "Extracted document",
  headings: [
    { level: 1, text: "Intro heading" },
    { level: 2, text: "Detail heading" },
    { level: 3, text: "Deep heading" },
  ],
  wordCount: 512,
};

const sitemapPayload = {
  urls: [
    { url: "https://example.com/a", lastmod: "not-a-date" },
    { url: "https://example.com/b" },
  ],
};

const freeSeoReportPayload = {
  url: "https://example.com",
  title: "Report title",
  metaDescription: "Report description",
  ogImage: "https://cdn.example.com/og.png",
  h1Count: 1,
  h2Count: 4,
  linkCount: 5,
  wordCount: 400,
};

const brokenLinkPayload = {
  scannedUrl: "https://example.com",
  totalFound: 60,
  totalChecked: 50,
  working: [{ url: "https://example.com/ok", status: 200, ok: true }],
  broken: [
    { url: "https://example.com/gone", status: 404, ok: false },
    { url: "https://example.com/slow", status: null, ok: false, error: "Timeout" },
  ],
};

/* ── SEO Analyzer ───────────────────────────────────────── */

describe("ReportView — SEO Analyzer", () => {
  it("renders the SERP preview with a protocol-stripped breadcrumb", () => {
    render(<ReportView toolName="SEO Analyzer" data={seoAnalyzerPayload} />);
    expect(screen.getByText("example.com/blog/post")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(seoTitle);
  });

  it("truncates the SERP description to 159 characters plus an ellipsis", () => {
    render(<ReportView toolName="SEO Analyzer" data={seoAnalyzerPayload} />);
    const serp = screen.getByText(/^D+…$/);
    expect(serp.textContent).toHaveLength(160);
  });

  it("reports the untruncated character counts on the badges", () => {
    render(<ReportView toolName="SEO Analyzer" data={seoAnalyzerPayload} />);
    expect(screen.getByText(`${seoTitle.length} chars`)).toBeInTheDocument();
    expect(screen.getByText(`${seoDescription.length} chars`)).toBeInTheDocument();
  });

  it("resolves a relative favicon against the scanned page", () => {
    const { container } = render(<ReportView toolName="SEO Analyzer" data={seoAnalyzerPayload} />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe("https://example.com/favicon.ico");
  });

  it("lists the headings already categorised by level", () => {
    render(<ReportView toolName="SEO Analyzer" data={seoAnalyzerPayload} />);
    expect(screen.getByText("Headings (3)")).toBeInTheDocument();
    expect(screen.getByText("Main heading")).toBeInTheDocument();
    expect(screen.getByText("Sub heading two")).toBeInTheDocument();
  });

  it("falls back through OpenGraph when the title tag is missing", () => {
    const data = { ...seoAnalyzerPayload, title: null, metaDescription: null };
    render(<ReportView toolName="SEO Analyzer" data={data} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("OpenGraph title");
    expect(screen.getByText("No title tag found")).toBeInTheDocument();
  });

  it("shows the amber empty state when there are no social tags", () => {
    const data = { ...seoAnalyzerPayload, og: {}, twitter: {}, h1Tags: [], h2Tags: [] };
    render(<ReportView toolName="SEO Analyzer" data={data} />);
    expect(screen.getByText("No OpenGraph or Twitter tags found")).toBeInTheDocument();
    expect(screen.getByText("No H1 or H2 tags found")).toBeInTheDocument();
  });
});

/* ── Free SEO Report ────────────────────────────────────── */

describe("ReportView — Free SEO Report", () => {
  it("recomputes the full score when every signal is present", () => {
    render(<ReportView toolName="Free SEO Report" data={freeSeoReportPayload} />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("scores low when title, description and OpenGraph image are all missing", () => {
    const data = { ...freeSeoReportPayload, title: null, metaDescription: null, ogImage: null, h1Count: 5, linkCount: 0, wordCount: 0 };
    render(<ReportView toolName="Free SEO Report" data={data} />);
    // Only the "more than two H1s" rule scores: 10.
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getAllByText("Missing")).toHaveLength(3);
  });
});

/* ── Content Extractor ──────────────────────────────────── */

describe("ReportView — Content Extractor", () => {
  it("indents each row by 1.5rem per heading level", () => {
    render(<ReportView toolName="Content Extractor" data={contentExtractorPayload} />);
    expect(screen.getByText("Intro heading").closest("td")?.style.paddingLeft).toBe("1.5rem");
    expect(screen.getByText("Detail heading").closest("td")?.style.paddingLeft).toBe("3rem");
    expect(screen.getByText("Deep heading").closest("td")?.style.paddingLeft).toBe("4.5rem");
  });

  it("counts headings by level in the stat cards", () => {
    render(<ReportView toolName="Content Extractor" data={contentExtractorPayload} />);
    // StatCard renders the label span first, so the value is the following sibling.
    expect(screen.getByText("Total Words").nextSibling).toHaveTextContent("512");
    expect(screen.getByText("Total Headings").nextSibling).toHaveTextContent("3");
    expect(screen.getByText("H2 Tags").nextSibling).toHaveTextContent("1");
    expect(screen.getByText("H3 Tags").nextSibling).toHaveTextContent("1");
  });

  it("shows the empty document state for a page with no headings", () => {
    render(<ReportView toolName="Content Extractor" data={{ ...contentExtractorPayload, headings: [] }} />);
    expect(screen.getByText("No H1, H2, or H3 tags found on this page.")).toBeInTheDocument();
  });
});

/* ── Sitemap Extractor ──────────────────────────────────── */

describe("ReportView — Sitemap Extractor", () => {
  it("lists every URL with a placeholder for a missing lastmod", () => {
    render(<ReportView toolName="Sitemap Extractor" data={sitemapPayload} />);
    expect(screen.getByText(/2 URLs found/)).toBeInTheDocument();
    expect(screen.getByText("https://example.com/a")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("passes through an unparseable lastmod rather than printing Invalid Date", () => {
    render(<ReportView toolName="Sitemap Extractor" data={sitemapPayload} />);
    expect(screen.getByText("not-a-date")).toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument();
  });

  it("uses the singular form for a single URL", () => {
    render(<ReportView toolName="Sitemap Extractor" data={{ urls: [{ url: "https://example.com/only" }] }} />);
    expect(screen.getByText(/1 URL found/)).toBeInTheDocument();
  });
});

/* ── Broken Link Checker ────────────────────────────────── */

describe("ReportView — Broken Link Checker", () => {
  it("renders the numeric status for working links and the error for a null status", () => {
    render(<ReportView toolName="Broken Link Checker" data={brokenLinkPayload} />);
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Timeout")).toBeInTheDocument();
  });

  it("explains that the scan was capped", () => {
    render(<ReportView toolName="Broken Link Checker" data={brokenLinkPayload} />);
    expect(screen.getByText(/Showing 50 of 60 links found/)).toBeInTheDocument();
  });

  it("omits the cap notice when every link was checked", () => {
    const data = { ...brokenLinkPayload, totalFound: 50, totalChecked: 50 };
    render(<ReportView toolName="Broken Link Checker" data={data} />);
    expect(screen.queryByText(/Showing 50 of 50/)).not.toBeInTheDocument();
  });

  it("congratulates the user when nothing is broken", () => {
    const data = { ...brokenLinkPayload, totalFound: 1, totalChecked: 1, broken: [] };
    render(<ReportView toolName="Broken Link Checker" data={data} />);
    expect(screen.getByText("No broken links found — your page is healthy!")).toBeInTheDocument();
  });
});

/* ── Resilience to old or unknown payloads ──────────────── */

describe("ReportView — malformed and legacy payloads", () => {
  const toolNames = [
    "SEO Analyzer",
    "Free SEO Report",
    "Content Extractor",
    "Sitemap Extractor",
    "Broken Link Checker",
  ];

  it.each(toolNames)("renders an empty object without throwing for %s", (toolName) => {
    expect(() => render(<ReportView toolName={toolName} data={{}} />)).not.toThrow();
  });

  it.each(toolNames)("renders a null payload without throwing for %s", (toolName) => {
    expect(() => render(<ReportView toolName={toolName} data={null} />)).not.toThrow();
  });

  it.each(toolNames)("renders a string payload without throwing for %s", (toolName) => {
    expect(() => render(<ReportView toolName={toolName} data="unexpected scalar" />)).not.toThrow();
  });

  it("ignores fields of the wrong type instead of crashing", () => {
    const data = { url: 42, title: { nested: true }, h1Tags: "not-an-array", canonical: null };
    expect(() => render(<ReportView toolName="SEO Analyzer" data={data} />)).not.toThrow();
  });

  it("falls back to a generic view for an unrecognised tool", () => {
    render(<ReportView toolName="Some Future Tool" data={{ alpha: "one", beta: 2, items: ["x", "y"] }} />);
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("items (2)")).toBeInTheDocument();
  });
});
