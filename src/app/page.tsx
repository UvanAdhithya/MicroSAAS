"use client";
import { useState, useEffect } from "react";

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

/* ─── Inline widget components ───────────────────────── */

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
  const [url, setUrl] = useState("https://example.com");
  return (
    <WidgetShell>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input suppressHydrationWarning value={url} onChange={e => setUrl(e.target.value)}
          style={{ flex: 1, fontSize: 12, padding: "6px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text)", outline: "none" }} />
        <button style={{ fontSize: 12, fontWeight: 600, color: "white", background: "var(--accent)", border: "none", borderRadius: 6, padding: "0 12px", cursor: "pointer" }}>
          Crawl
        </button>
      </div>
      <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-3)", padding: "8px", background: "var(--bg-subtle)", border: "1px dashed var(--border)", borderRadius: 6, textAlign: "center" }}>
        Extracts all public links<br/>from robots.txt & sitemaps
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

/* ─── Shared widget shell ──────────────────────────── */
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

/* ─── Tool list ──────────────────────────────────────── */
const tools: Tool[] = [
  { slug: "seo-analyzer", name: "SEO Analyzer", description: "Instantly audit any page's title, meta tags, OpenGraph data, headings, and see a live Google SERP preview.", category: "seo", badge: "new", Widget: SeoAnalyzerWidget },
  { slug: "sitemap-extractor", name: "Sitemap Extractor", description: "Crawl domains to extract all public URLs from robots.txt and XML sitemaps.", category: "data", badge: "new", Widget: SitemapWidget },
  { slug: "broken-link-checker", name: "Broken Link Checker", description: "Scan any page to find dead links. Checks every href and shows HTTP status codes with export.", category: "audit", badge: "new", Widget: BrokenLinkWidget },
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

/* ─── Page ───────────────────────────────────────────── */
export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<Category>("all");
  const [query, setQuery] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const visible = tools.filter(t => {
    const catOk = active === "all" || t.category === active;
    const q = query.toLowerCase();
    const searchOk = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.includes(q);
    return catOk && searchOk;
  });

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
      {/* ── Hero ── */}
      <div style={{ paddingTop: 80, paddingBottom: 72, borderBottom: "1px solid var(--border)", textAlign: "center", minHeight: "45vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 14, fontFamily: "var(--mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20 }}>
          Free tools
        </p>
        <h1 style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08, color: "var(--text)", margin: "0 auto 20px", maxWidth: 720 }}>
          Free Developer utilities<br />
          <span style={{ color: "var(--accent-fg)" }}>that respect your time.</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-2  )", lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
          {tools.length} tools. No login. No ads. Everything runs in your browser.
        </p>
      </div>

      {/* ── Controls ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "0 0 220px" }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input suppressHydrationWarning value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tools…"
            style={{ width: "100%", fontSize: 13.5, padding: "8px 10px 8px 30px", border: "1px solid var(--border)", borderRadius: 9, background: "var(--bg-subtle)", color: "var(--text)", outline: "none", transition: "border-color 0.15s" }}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActive(c.id)}
              style={{
                padding: "6px 13px", fontSize: 13, fontWeight: active === c.id ? 600 : 450,
                borderRadius: 99, border: "1px solid",
                borderColor: active === c.id ? "var(--accent)" : "var(--border)",
                background: active === c.id ? "var(--accent)" : "transparent",
                color: active === c.id ? "white" : "var(--text-2)",
                cursor: "pointer", transition: "all 0.15s",
              }}>{c.label}</button>
          ))}
        </div>

        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-3)", fontFamily: "var(--mono)" }}>
          {visible.length}/{tools.length}
        </span>
      </div>

      {/* ── Grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 16,
        paddingBottom: 64,
      }}>
        {visible.map(tool => <ToolCard key={tool.slug} tool={tool} />)}
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const [hovered, setHovered] = useState(false);
  const accent = CAT_COLOR[tool.category] ?? "#6B6B6A";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-raised)",
        border: "1px solid",
        borderColor: hovered ? "var(--border-strong)" : "var(--border)",
        borderRadius: 14,
        padding: "18px 18px 14px",
        display: "flex", flexDirection: "column", gap: 10,
        boxShadow: hovered ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        transition: "box-shadow 0.2s, border-color 0.2s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        cursor: "default",
      }}
    >
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.02em", color: "var(--text)", margin: "0 0 3px" }}>{tool.name}</h2>
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

      {/* Live widget */}
      <tool.Widget />

      {/* CTA */}
      <a href={`/tools/${tool.slug}`} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        padding: "9px 0", fontSize: 13.5, fontWeight: 600,
        color: "white", background: "var(--accent)", borderRadius: 9,
        textDecoration: "none", transition: "opacity 0.15s",
        opacity: hovered ? 1 : 0.88,
      }}>
        Try tool
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}
