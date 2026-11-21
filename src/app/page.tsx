import type { Metadata } from "next";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────
 * Home page — server component
 * ─────────────────────────────────────────────────────────
 * This page previously carried `if (!mounted) return null;`,
 * which meant the server sent an empty shell: no h1, no h2, no
 * tool catalog. Googlebot may render that in a second pass,
 * but Bing, GPTBot, PerplexityBot and ClaudeBot never execute
 * JavaScript, so for them the page did not exist.
 *
 * Nothing here needs client state. Filtering moved to the URL
 * (`?q=` and `?cat=`) and is resolved on the server, so the
 * whole page — hero, headings and every tool card — is in the
 * HTML. The category chips are real links and the search is a
 * plain GET form, so both still work with JavaScript disabled.
 * ───────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  // `absolute` because the root layout's title template only applies to
  // descendant segments, and this page shares the root layout's own segment.
  title: { absolute: "Free SEO Tools for Any Website — SEOSnap" },
  description:
    "Six free SEO tools that need no signup: instant SEO audit, technical SEO report with PDF export, content outline extractor, sitemap extractor, broken link checker and AI readability checker.",
  alternates: { canonical: "/" },
};

/* ─── Types ─────────────────────────────────────────── */
type Category = "all" | "seo" | "data" | "audit";

type Tool = {
  slug: string;
  name: string;
  description: string;
  category: Exclude<Category, "all">;
  badge?: "popular" | "new";
  Widget: () => React.JSX.Element;
};

/* ─── Inline widget components (static illustrations) ── */

function WidgetShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-raised)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 12, marginBottom: 2,
    }}>
      {children}
    </div>
  );
}

function SeoAnalyzerWidget() {
  return (
    <WidgetShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1, fontSize: 11, padding: "6px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text-3)", fontFamily: "var(--mono)" }}>https://example.com</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "white", background: "var(--accent)", borderRadius: 6, padding: "6px 10px" }}>Analyze</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1, padding: "6px 8px", fontSize: 10, borderRadius: 6, background: "var(--green-light)", color: "var(--green)", fontWeight: 600, textAlign: "center" }}>Title ✓</div>
          <div style={{ flex: 1, padding: "6px 8px", fontSize: 10, borderRadius: 6, background: "var(--green-light)", color: "var(--green)", fontWeight: 600, textAlign: "center" }}>Meta ✓</div>
          <div style={{ flex: 1, padding: "6px 8px", fontSize: 10, borderRadius: 6, background: "var(--amber-light)", color: "var(--amber)", fontWeight: 600, textAlign: "center" }}>OG ⚠</div>
        </div>
      </div>
    </WidgetShell>
  );
}

function SitemapWidget() {
  return (
    <WidgetShell>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <div style={{ flex: 1, fontSize: 12, padding: "6px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text-3)", fontFamily: "var(--mono)" }}>https://example.com</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "white", background: "var(--accent)", borderRadius: 6, padding: "6px 12px" }}>
          Crawl
        </div>
      </div>
      <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-3)", padding: "8px", background: "var(--bg-subtle)", border: "1px dashed var(--border)", borderRadius: 6, textAlign: "center" }}>
        Extracts all public links<br />from robots.txt &amp; sitemaps
      </div>
    </WidgetShell>
  );
}

function BrokenLinkWidget() {
  return (
    <WidgetShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1, fontSize: 11, padding: "6px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text-3)", fontFamily: "var(--mono)" }}>https://example.com</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "white", background: "var(--accent)", borderRadius: 6, padding: "6px 10px" }}>Scan</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 2, padding: "5px 8px", fontSize: 10, borderRadius: 6, background: "var(--green-light)", color: "var(--green)", fontWeight: 600, textAlign: "center" }}>42 OK</div>
          <div style={{ flex: 1, padding: "5px 8px", fontSize: 10, borderRadius: 6, background: "var(--red-light)", color: "var(--red)", fontWeight: 600, textAlign: "center" }}>3 Broken</div>
        </div>
      </div>
    </WidgetShell>
  );
}

function AiReadabilityWidget() {
  return (
    <WidgetShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1, fontSize: 11, padding: "6px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text-3)", fontFamily: "var(--mono)" }}>https://example.com</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "white", background: "var(--accent)", borderRadius: 6, padding: "6px 10px" }}>Check</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--green)" }} />
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--green)" }}>92/100</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1, padding: "5px 8px", fontSize: 10, borderRadius: 6, background: "var(--green-light)", color: "var(--green)", fontWeight: 600, textAlign: "center" }}>In HTML ✓</div>
          <div style={{ flex: 1, padding: "5px 8px", fontSize: 10, borderRadius: 6, background: "var(--green-light)", color: "var(--green)", fontWeight: 600, textAlign: "center" }}>AI crawlers ✓</div>
        </div>
      </div>
    </WidgetShell>
  );
}

function ContentExtractorWidget() {
  return (
    <WidgetShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1, fontSize: 11, padding: "6px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text-3)", fontFamily: "var(--mono)" }}>https://example.com/blog</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "white", background: "var(--accent)", borderRadius: 6, padding: "6px 10px" }}>Extract</div>
        </div>
        <div style={{ padding: "8px", fontSize: 10, borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text-2)", fontFamily: "var(--mono)", border: "1px dashed var(--border)" }}>
          <div style={{ color: "var(--text)" }}>H1: Title</div>
          <div style={{ marginLeft: 8 }}>H2: Section</div>
          <div style={{ marginLeft: 16 }}>H3: Subsection</div>
        </div>
      </div>
    </WidgetShell>
  );
}

function FreeSeoReportWidget() {
  return (
    <WidgetShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1, fontSize: 11, padding: "6px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text-3)", fontFamily: "var(--mono)" }}>https://example.com</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "white", background: "var(--accent)", borderRadius: 6, padding: "6px 10px" }}>Audit</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--green)" }} />
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--green)" }}>95/100</div>
        </div>
      </div>
    </WidgetShell>
  );
}

/* ─── Tool list ──────────────────────────────────────── */
const tools: Tool[] = [
  { slug: "seo-analyzer", name: "SEO Analyzer", description: "Instantly audit any page's title, meta tags, OpenGraph data, headings, and see a live Google SERP preview.", category: "seo", badge: "new", Widget: SeoAnalyzerWidget },
  { slug: "free-seo-report", name: "Free SEO Report", description: "Generate a comprehensive technical SEO health dashboard and export it as a professional PDF.", category: "audit", badge: "new", Widget: FreeSeoReportWidget },
  { slug: "content-extractor", name: "Content Extractor", description: "Extract heading outlines (H1-H3) and calculate word counts to reverse-engineer competitor content.", category: "data", badge: "new", Widget: ContentExtractorWidget },
  { slug: "sitemap-extractor", name: "Sitemap Extractor", description: "Crawl domains to extract all public URLs from robots.txt and XML sitemaps.", category: "data", badge: "new", Widget: SitemapWidget },
  { slug: "broken-link-checker", name: "Broken Link Checker", description: "Scan any page to find dead links. Checks every href and shows HTTP status codes with export.", category: "audit", badge: "new", Widget: BrokenLinkWidget },
  { slug: "ai-readability", name: "AI Readability Checker", description: "Check whether AI assistants can actually read a page, or whether JavaScript is hiding the content from them.", category: "audit", badge: "new", Widget: AiReadabilityWidget },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "seo", label: "SEO" },
  { id: "data", label: "Data" },
  { id: "audit", label: "Audit" },
];

const CAT_COLOR: Record<string, string> = {
  seo: "#0891B2", data: "#D97706", audit: "#DC2626",
};

const VALID_CATS: Category[] = ["all", "seo", "data", "audit"];

/* ─── Page ───────────────────────────────────────────── */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const active: Category = VALID_CATS.includes(params.cat as Category)
    ? (params.cat as Category)
    : "all";

  const visible = tools.filter(t => {
    const catOk = active === "all" || t.category === active;
    const q = query.toLowerCase();
    const searchOk = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.includes(q);
    return catOk && searchOk;
  });

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
      {/* ── Hero ── */}
      <div style={{ paddingTop: 80, paddingBottom: 72, borderBottom: "1px solid var(--border)", textAlign: "center", minHeight: "45vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 14, fontFamily: "var(--mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20 }}>
          Free tools
        </p>
        <h1 style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08, color: "var(--text)", margin: "0 auto 20px", maxWidth: 720 }}>
          Snap an SEO audit<br />
          <span style={{ color: "var(--accent-fg)" }}>of any website in seconds.</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-2)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
          {tools.length} free SEO tools. No signup required. Create a free account to save your reports.
        </p>
      </div>

      {/* ── Catalog heading ── */}
      <div style={{ paddingTop: 44 }}>
        <h2 style={{ fontSize: 24, fontWeight: 750, letterSpacing: "-0.025em", margin: 0, color: "var(--text)" }}>
          All free SEO tools
        </h2>
        <p style={{ fontSize: 14.5, color: "var(--text-2)", margin: "8px 0 0", maxWidth: 640, lineHeight: 1.6 }}>
          Every tool runs without an account and returns results immediately. Use them on your own site
          or on a competitor&apos;s to see exactly what search engines and AI assistants are served.
        </p>
      </div>

      {/* ── Controls (GET form + links, so these work without JS) ── */}
      <form method="get" action="/" style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "0 0 220px" }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input name="q" defaultValue={query} placeholder="Search tools…" aria-label="Search tools"
            style={{ width: "100%", fontSize: 13.5, padding: "8px 10px 8px 30px", border: "1px solid var(--border)", borderRadius: 9, background: "var(--bg-subtle)", color: "var(--text)", outline: "none" }}
          />
        </div>
        <noscript>
          <button type="submit" style={{ fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 9, border: "1px solid var(--accent)", background: "var(--accent)", color: "white", cursor: "pointer" }}>
            Search
          </button>
        </noscript>

        {/* Category chips — real links, so they work without JS */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <Link key={c.id}
              href={{ pathname: "/", query: { ...(query ? { q: query } : {}), ...(c.id === "all" ? {} : { cat: c.id }) } }}
              scroll={false}
              style={{
                padding: "6px 13px", fontSize: 13, fontWeight: active === c.id ? 600 : 450,
                borderRadius: 99, border: "1px solid",
                borderColor: active === c.id ? "var(--accent)" : "var(--border)",
                background: active === c.id ? "var(--accent)" : "transparent",
                color: active === c.id ? "white" : "var(--text-2)",
                textDecoration: "none", transition: "all 0.15s",
              }}>{c.label}</Link>
          ))}
        </div>

        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-3)", fontFamily: "var(--mono)" }}>
          {visible.length}/{tools.length}
        </span>
      </form>

      {/* ── Grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 16,
        paddingBottom: 64,
      }}>
        {visible.map(tool => <ToolCard key={tool.slug} tool={tool} />)}
      </div>

      {visible.length === 0 && (
        <div style={{ border: "1px dashed var(--border)", borderRadius: 12, padding: 32, textAlign: "center", color: "var(--text-3)", marginBottom: 64 }}>
          No tools match &ldquo;{query}&rdquo;. <Link href="/" style={{ color: "var(--accent-fg)", fontWeight: 600 }}>Show all {tools.length} tools</Link>.
        </div>
      )}
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const accent = CAT_COLOR[tool.category] ?? "#6B6B6A";

  return (
    <div className="tool-card" style={{
      background: "var(--bg-raised)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "18px 18px 14px",
      display: "flex", flexDirection: "column", gap: 10,
      boxShadow: "var(--shadow-card)",
    }}>
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.02em", color: "var(--text)", margin: "0 0 3px" }}>{tool.name}</h3>
          <p style={{ fontSize: 12.5, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>{tool.description}</p>
        </div>
      </div>

      {/* Tags row */}
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <span style={{
          fontSize: 10, fontFamily: "var(--mono)", padding: "2px 7px",
          borderRadius: 99, border: `1px solid ${accent}22`,
          color: accent, background: accent + "12",
          letterSpacing: "0.03em", textTransform: "lowercase",
        }}>{tool.category}</span>
        {tool.badge && (
          <span style={{
            fontSize: 10, fontFamily: "var(--mono)", padding: "2px 7px", borderRadius: 99,
            ...(tool.badge === "new"
              ? { background: "var(--green-light)", color: "var(--green)", border: "1px solid #16A34A22" }
              : { background: "var(--amber-light)", color: "var(--amber)", border: "1px solid #D9770622" }),
          }}>{tool.badge}</span>
        )}
      </div>

      {/* Static preview */}
      <tool.Widget />

      {/* CTA */}
      <Link href={`/tools/${tool.slug}`} className="tool-card-cta" style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        padding: "9px 0", fontSize: 13.5, fontWeight: 600,
        color: "white", background: "var(--accent)", borderRadius: 9,
        textDecoration: "none", transition: "opacity 0.15s",
        marginTop: "auto",
      }}>
        Try tool
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
