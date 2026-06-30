"use client";

import { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────
 * SEO Analyzer — Frontend Page
 * ─────────────────────────────────────────────────────────
 * A premium dashboard-style tool that displays extracted
 * SEO metadata in a card grid with a Google SERP preview.
 * ───────────────────────────────────────────────────────── */

/* ── Data interfaces ────────────────────────────────────── */

interface SeoResult {
  url: string;
  title: string | null;
  metaDescription: string | null;
  og: {
    title: string | null;
    description: string | null;
    image: string | null;
    type: string | null;
    url: string | null;
  };
  twitter: {
    card: string | null;
    title: string | null;
    description: string | null;
  };
  h1Tags: string[];
  h2Tags: string[];
  canonical: string | null;
  favicon: string | null;
  language: string | null;
}

/* ── Main page component ────────────────────────────────── */

export default function SeoAnalyzerPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze the site.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      {/* ── Breadcrumbs ── */}
      <nav className="mb-8 flex w-fit items-center space-x-3 rounded-lg bg-[var(--bg-subtle)] px-4 py-2.5 text-[14px] font-medium text-[var(--text-2)]">
        <Link href="/" className="transition-colors hover:text-[var(--accent)]">Home</Link>
        <ChevronIcon />
        <span>Tools</span>
        <ChevronIcon />
        <span className="text-[var(--text)]">SEO Analyzer</span>
      </nav>

      {/* ── Hero section ── */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          Free Website SEO Analyzer
        </h1>
        <p className="mx-auto max-w-2xl text-[var(--text-2)]">
          Enter any URL to instantly audit its on-page SEO. We extract titles,
          meta descriptions, OpenGraph tags, heading structure, and more — then
          show you exactly how it appears on Google.
        </p>
      </div>

      {/* ── Input card ── */}
      <div className="mb-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-sm sm:p-8">
        <form onSubmit={handleAnalyze} className="flex flex-col gap-4 sm:flex-row">
          <input
            type="url"
            required
            placeholder="https://example.com"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              "Analyze Site"
            )}
          </button>
        </form>

        {/* Error display */}
        {error && (
          <div className="mt-6 rounded-xl border border-[var(--red-light)] bg-[var(--red-light)] p-4 text-[var(--red)]">
            <p className="font-semibold">Analysis Failed</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}
      </div>

      {/* ── Skeleton loading state ── */}
      {loading && <SkeletonDashboard />}

      {/* ── Results dashboard ── */}
      {result && !loading && (
        <div className="mb-12 space-y-8">
          <ResultsDashboard result={result} />
          <UpsellCard />
        </div>
      )}

      {/* ── SEO content section ── */}
      <ContentSection />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * Sub-components
 * ═══════════════════════════════════════════════════════════ */

/** Chevron separator for breadcrumbs */
function ChevronIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

/* ── Skeleton Dashboard ─────────────────────────────────── */

function SkeletonDashboard() {
  const Pulse = ({ className }: { className?: string }) => (
    <div className={`animate-pulse rounded-lg bg-[var(--border)] ${className ?? ""}`} />
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Title & Description skeleton */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6">
        <Pulse className="mb-4 h-4 w-24" />
        <Pulse className="mb-3 h-6 w-full" />
        <Pulse className="mb-6 h-4 w-40" />
        <Pulse className="mb-4 h-4 w-32" />
        <Pulse className="mb-2 h-4 w-full" />
        <Pulse className="h-4 w-3/4" />
      </div>
      {/* SERP Preview skeleton */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6">
        <Pulse className="mb-4 h-4 w-36" />
        <div className="rounded-xl border border-[var(--border)] bg-white p-5">
          <Pulse className="mb-2 h-3 w-48" />
          <Pulse className="mb-3 h-5 w-full" />
          <Pulse className="mb-1 h-3 w-full" />
          <Pulse className="h-3 w-2/3" />
        </div>
      </div>
      {/* OpenGraph skeleton */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6">
        <Pulse className="mb-4 h-4 w-28" />
        <Pulse className="mb-3 h-40 w-full" />
        <Pulse className="mb-2 h-4 w-3/4" />
        <Pulse className="h-3 w-full" />
      </div>
      {/* Headings skeleton */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6">
        <Pulse className="mb-4 h-4 w-32" />
        <Pulse className="mb-3 h-4 w-full" />
        <Pulse className="mb-3 h-4 w-5/6" />
        <Pulse className="mb-3 h-4 w-full" />
        <Pulse className="mb-3 h-4 w-4/6" />
        <Pulse className="h-4 w-3/4" />
      </div>
    </div>
  );
}

/* ── Results Dashboard ──────────────────────────────────── */

function ResultsDashboard({ result }: { result: SeoResult }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* ── Title & Meta Description ── */}
      <DashboardCard title="Title & Description" icon="📝">
        <div className="mb-5">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-3)]">Title</span>
            <CharBadge count={result.title?.length ?? 0} ideal={[30, 60]} />
          </div>
          <p className="text-[15px] font-semibold leading-snug text-[var(--text)]">
            {result.title || <EmptyTag label="No title tag found" />}
          </p>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-3)]">Meta Description</span>
            <CharBadge count={result.metaDescription?.length ?? 0} ideal={[120, 160]} />
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-2)]">
            {result.metaDescription || <EmptyTag label="No meta description found" />}
          </p>
        </div>
      </DashboardCard>

      {/* ── Google SERP Preview ── */}
      <DashboardCard title="Google SERP Preview" icon="🔍">
        <div className="rounded-xl border border-[#E8EAED] bg-white p-5 shadow-sm">
          {/* URL bar */}
          <div className="mb-1 flex items-center gap-2">
            {result.favicon && (
              <img
                src={resolveUrl(result.favicon, result.url)}
                alt=""
                className="h-4 w-4 rounded-sm"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <span className="truncate text-[13px] text-[#202124]">
              {formatSerpUrl(result.url)}
            </span>
          </div>
          {/* Title */}
          <h3 className="mb-1 text-[20px] font-normal leading-snug text-[#1A0DAB] hover:underline" style={{ fontFamily: "Arial, sans-serif" }}>
            {result.title || result.og.title || "Untitled Page"}
          </h3>
          {/* Description */}
          <p className="text-[14px] leading-[1.5] text-[#4D5156]" style={{ fontFamily: "Arial, sans-serif" }}>
            {truncate(result.metaDescription || result.og.description || "No description available.", 160)}
          </p>
        </div>
      </DashboardCard>

      {/* ── OpenGraph Tags ── */}
      <DashboardCard title="OpenGraph Data" icon="🌐">
        {result.og.image && (
          <div className="mb-4 overflow-hidden rounded-xl border border-[var(--border)]">
            <img
              src={resolveUrl(result.og.image, result.url)}
              alt="OG Image"
              className="h-44 w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
        <MetaRow label="og:title" value={result.og.title} />
        <MetaRow label="og:description" value={result.og.description} />
        <MetaRow label="og:type" value={result.og.type} />
        <MetaRow label="og:url" value={result.og.url} />
        {!result.og.title && !result.og.description && !result.og.image && (
          <EmptyTag label="No OpenGraph tags found" />
        )}
      </DashboardCard>

      {/* ── Heading Structure ── */}
      <DashboardCard title="Heading Structure" icon="📑">
        {result.h1Tags.length === 0 && result.h2Tags.length === 0 ? (
          <EmptyTag label="No H1 or H2 tags found" />
        ) : (
          <div className="max-h-[320px] space-y-2 overflow-auto pr-1">
            {result.h1Tags.map((h, i) => (
              <HeadingRow key={`h1-${i}`} level="H1" text={h} />
            ))}
            {result.h2Tags.map((h, i) => (
              <HeadingRow key={`h2-${i}`} level="H2" text={h} />
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-3 border-t border-[var(--border)] pt-3">
          <StatPill label="H1 tags" value={result.h1Tags.length} />
          <StatPill label="H2 tags" value={result.h2Tags.length} />
        </div>
      </DashboardCard>

      {/* ── Technical Details (full width) ── */}
      <div className="md:col-span-2">
        <DashboardCard title="Technical Details" icon="⚙️">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TechDetail label="Canonical URL" value={result.canonical} />
            <TechDetail label="Language" value={result.language} />
            <TechDetail label="Twitter Card" value={result.twitter.card} />
            <TechDetail label="Twitter Title" value={result.twitter.title} />
            <TechDetail label="Twitter Description" value={result.twitter.description} />
            <TechDetail label="Favicon" value={result.favicon} />
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

/* ── Shared UI primitives ───────────────────────────────── */

/** Card wrapper with icon + title header */
function DashboardCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-3)]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/** Character count badge with color coding */
function CharBadge({ count, ideal }: { count: number; ideal: [number, number] }) {
  const isGood = count >= ideal[0] && count <= ideal[1];
  const isWarning = count > 0 && (count < ideal[0] || count > ideal[1]);
  const color = count === 0 ? "var(--red)" : isGood ? "var(--green)" : isWarning ? "var(--amber)" : "var(--text-3)";
  const bg = count === 0 ? "var(--red-light)" : isGood ? "var(--green-light)" : isWarning ? "var(--amber-light)" : "var(--bg-subtle)";

  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ color, backgroundColor: bg }}
    >
      {count} chars
    </span>
  );
}

/** Displays a meta key/value pair */
function MetaRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="mb-2 flex items-start gap-2">
      <code className="mt-0.5 flex-shrink-0 rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent)]">
        {label}
      </code>
      <span className="text-sm text-[var(--text-2)]">{value}</span>
    </div>
  );
}

/** Heading row with level badge */
function HeadingRow({ level, text }: { level: "H1" | "H2"; text: string }) {
  const isH1 = level === "H1";
  return (
    <div className={`flex items-start gap-2 rounded-lg border border-[var(--border)] px-3 py-2 ${isH1 ? "" : "ml-4"}`}>
      <span
        className="mt-0.5 flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
        style={{
          color: isH1 ? "var(--accent)" : "var(--blue)",
          backgroundColor: isH1 ? "var(--accent-light)" : "var(--blue-light)",
        }}
      >
        {level}
      </span>
      <span className={`text-sm ${isH1 ? "font-medium text-[var(--text)]" : "text-[var(--text-2)]"}`}>
        {text}
      </span>
    </div>
  );
}

/** Small stat pill */
function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-xs font-medium text-[var(--text-2)]">
      <span className="font-bold text-[var(--text)]">{value}</span> {label}
    </div>
  );
}

/** Technical detail mini-card */
function TechDetail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">{label}</span>
      <span className="block truncate font-mono text-[13px] text-[var(--text)]">
        {value || <span className="text-[var(--text-3)]">—</span>}
      </span>
    </div>
  );
}

/** Placeholder for missing data */
function EmptyTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--amber)] bg-[var(--amber-light)] px-3 py-1.5 text-xs font-medium text-[var(--amber)]">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      {label}
    </span>
  );
}

/* ── Utility functions ──────────────────────────────────── */

/** Resolve a potentially relative URL against a base */
function resolveUrl(path: string, base: string): string {
  if (path.startsWith("http")) return path;
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}

/** Format a URL for Google SERP display */
function formatSerpUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname === "/" ? "" : u.pathname}`;
  } catch {
    return url;
  }
}

/** Truncate a string to a max length */
function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

/* ── SEO Content Section ────────────────────────────────── */

function ContentSection() {
  return (
    <>
      {/* Decorative divider */}
      <div className="my-16 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        <svg className="h-5 w-5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      <article className="prose-custom mx-auto max-w-3xl pb-20">
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-[var(--text)]">
          What Is an SEO Analyzer and Why Do You Need One?
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          An SEO analyzer is a diagnostic tool that inspects a web page&apos;s HTML to evaluate how
          well it is optimized for search engines. Every page you publish competes for visibility in
          search results, and the metadata you embed — titles, descriptions, OpenGraph tags, and heading
          structure — directly influences how search engines understand, rank, and display your content.
          A well-optimized page can mean the difference between appearing on page one or being buried
          in obscurity.
        </p>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          Our free analyzer fetches any public URL, parses its HTML in real time, and extracts the
          critical on-page signals that Google, Bing, and social platforms use to generate previews.
          Instead of manually inspecting source code or toggling between browser extensions, you get
          a single, clean dashboard with everything in one place.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold tracking-tight text-[var(--text)]">
          Understanding the Google SERP Preview
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          The Search Engine Results Page (SERP) is where first impressions happen. Google uses your
          title tag and meta description to generate the blue link and snippet that users see before
          deciding whether to click. Our SERP preview card simulates this exact presentation, giving
          you a visual confirmation of how your page will appear in search results.
        </p>

        <h3 className="mb-3 mt-6 text-lg font-semibold text-[var(--text)]">
          Best Practices for Title Tags and Descriptions
        </h3>
        <ul className="mb-6 list-none space-y-3 pl-0">
          {[
            { title: "Title length", desc: "Keep titles between 30–60 characters. Google truncates longer titles with an ellipsis." },
            { title: "Description length", desc: "Aim for 120–160 characters. Descriptions that are too short waste valuable SERP real estate." },
            { title: "Unique titles", desc: "Every page should have a distinct, descriptive title that includes your target keyword." },
            { title: "Compelling copy", desc: "Write descriptions that act as micro-advertisements — they should entice the click." },
          ].map((item) => (
            <li key={item.title} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[var(--text-2)]">
                <strong className="text-[var(--text)]">{item.title}.</strong> {item.desc}
              </span>
            </li>
          ))}
        </ul>

        <h2 className="mb-4 mt-10 text-2xl font-bold tracking-tight text-[var(--text)]">
          How Our Analyzer Works Under the Hood
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          When you submit a URL, our serverless edge function makes a single HTTP request to the
          target page using standard browser headers. The raw HTML response is parsed with a
          high-performance XML/HTML parser to extract structured data from meta tags, OpenGraph
          properties, and the document&apos;s heading hierarchy. The entire round-trip typically
          completes in under one second.
        </p>
        <p className="leading-relaxed text-[var(--text-2)]">
          No data is stored, logged, or cached on our servers. The analysis result is streamed
          directly back to your browser and rendered in the dashboard you see above. Your privacy
          is fully respected — we believe developer tools should be fast, free, and transparent.
        </p>
        <p className="mt-4 leading-relaxed text-[var(--text-2)]">
          For the best results, use this tool in conjunction with Google Search Console
          and Google&apos;s Rich Results Testing Tool. By pairing our analyzer with these official resources, you build a comprehensive diagnostic workflow that catches everything from missing titles to invalid schema markup.
        </p>
        <UpsellCard />
      </article>
    </>
  );
}

/* ── Upsell CTA Card ───────────────────────────────────── */

function UpsellCard() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="my-12 overflow-hidden rounded-2xl border border-[var(--accent)] bg-gradient-to-br from-[#EDE9FE] via-[#F5F3FF] to-[#FDF4FF] p-8 shadow-md sm:p-10">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mb-3 inline-block rounded-full bg-[var(--accent)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          Coming Soon
        </span>
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-[var(--text)]">
          SEO isn&apos;t a one-and-done task.
        </h2>
        <p className="mb-6 text-[15px] leading-relaxed text-[var(--text-2)]">
          Enter your email to have <strong className="text-[var(--accent)]">Compy</strong> monitor
          your site in the background and alert you the second an important meta tag or heading drops.
          Never lose organic traffic to a bad deployment again.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--green-light)] px-6 py-3 text-sm font-semibold text-[var(--green)]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            You&apos;re on the list! We&apos;ll notify you when Compy launches.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) setSubmitted(true);
            }}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
            />
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Notify Me
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
