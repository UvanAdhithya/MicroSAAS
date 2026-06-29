"use client";

import { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────
 * Content Extractor — Frontend Page
 * ─────────────────────────────────────────────────────────
 * Displays an indented document tree of H1-H3 tags, word count,
 * a Compy Slack alert CTA, and an SEO guide.
 * ───────────────────────────────────────────────────────── */

/* ── Data interfaces ────────────────────────────────────── */

interface HeadingNode {
  level: number;
  text: string;
}

interface ContentResult {
  url: string;
  title: string | null;
  headings: HeadingNode[];
  wordCount: number;
}

/* ── Main page component ────────────────────────────────── */

export default function ContentExtractorPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/extract-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to extract content.");
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
        <span className="text-[var(--text)]">Content Extractor</span>
      </nav>

      {/* ── Hero ── */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          Extract Content Outline & Word Count
        </h1>
        <p className="mx-auto max-w-2xl text-[var(--text-2)]">
          Instantly generate a document tree of any page&apos;s heading structure and calculate its rough word count to reverse-engineer competitor content strategies.
        </p>
      </div>

      {/* ── Input card ── */}
      <div className="mb-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-sm sm:p-8">
        <form onSubmit={handleExtract} className="flex flex-col gap-4 sm:flex-row">
          <input
            type="url"
            required
            suppressHydrationWarning
            placeholder="https://example.com/blog-post"
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
                Extracting...
              </>
            ) : (
              "Extract Outline"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-[var(--red-light)] bg-[var(--red-light)] p-4 text-[var(--red)]">
            <p className="font-semibold">Extraction Failed</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}
      </div>

      {/* ── Skeleton loading ── */}
      {loading && <SkeletonLoader />}

      {/* ── Results Dashboard ── */}
      {result && !loading && (
        <div className="mb-12 space-y-6">
          {/* Stats Header */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total Words" value={result.wordCount.toLocaleString()} color="var(--text)" />
            <StatCard label="Total Headings" value={result.headings.length.toString()} color="var(--accent)" />
            <StatCard label="H2 Tags" value={result.headings.filter(h => h.level === 2).length.toString()} color="var(--blue)" />
            <StatCard label="H3 Tags" value={result.headings.filter(h => h.level === 3).length.toString()} color="var(--amber)" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--text)]">Document Tree</h2>
              {result.title && (
                <p className="mt-1 text-sm text-[var(--text-2)]">
                  <span className="font-semibold text-[var(--text)]">Title: </span>
                  {result.title}
                </p>
              )}
            </div>
          </div>

          {/* Document Tree Table */}
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] shadow-sm">
            <div className="max-h-[500px] overflow-auto">
              {result.headings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="mb-2 text-4xl">📭</span>
                  <p className="text-sm font-medium text-[var(--text-2)]">
                    No H1, H2, or H3 tags found on this page.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-[var(--bg-subtle)] text-xs uppercase text-[var(--text-3)] shadow-[0_1px_0_var(--border)]">
                    <tr>
                      <th className="px-6 py-4 font-medium">Heading Text</th>
                      <th className="px-6 py-4 font-medium text-right">Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {result.headings.map((heading, i) => (
                      <tr key={i} className="transition-colors hover:bg-[var(--bg-subtle)]">
                        <td className="px-6 py-3 text-[14px] text-[var(--text)]" style={{ paddingLeft: heading.level === 1 ? '1.5rem' : heading.level === 2 ? '3rem' : '4.5rem' }}>
                          <span className={heading.level === 1 ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-2)]'}>
                            {heading.text}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-right">
                          <HeadingBadge level={heading.level} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── Upsell CTA ── */}
          <UpsellCard />
        </div>
      )}

      {/* ── SEO Content Section ── */}
      <ContentSection />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * Sub-components
 * ═══════════════════════════════════════════════════════════ */

function ChevronIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] px-5 py-4 shadow-sm">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
        {label}
      </span>
      <span className="text-2xl font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function HeadingBadge({ level }: { level: number }) {
  const colors = {
    1: "bg-[var(--accent-light)] text-[var(--accent)]",
    2: "bg-[var(--blue-light)] text-[var(--blue)]",
    3: "bg-[var(--amber-light)] text-[var(--amber)]",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${colors[level as keyof typeof colors] || "bg-[var(--bg-subtle)] text-[var(--text-2)]"}`}>
      H{level}
    </span>
  );
}

function SkeletonLoader() {
  const Pulse = ({ className }: { className?: string }) => (
    <div className={`animate-pulse rounded-lg bg-[var(--border)] ${className ?? ""}`} />
  );
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-5">
            <Pulse className="mb-3 h-4 w-20" />
            <Pulse className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 sm:p-8">
        <Pulse className="mb-6 h-6 w-40" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Pulse key={i} className={`h-12 w-full ${i % 2 === 0 ? 'ml-6' : i % 3 === 0 ? 'ml-12' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

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
          Competitors are always updating their content.
        </h2>
        <p className="mb-6 text-[15px] leading-relaxed text-[var(--text-2)]">
          Enter your email to have <strong className="text-[var(--accent)]">Compy</strong> monitor
          your site in the background and alert you the second this domain publishes new H2s or changes their word count.
          Stay one step ahead without lifting a finger.
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
              suppressHydrationWarning
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

function ContentSection() {
  return (
    <>
      <div className="my-16 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        <svg className="h-5 w-5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 011.875 1.875v11.25a1.875 1.875 0 01-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V6.375A1.875 1.875 0 015.625 4.5z" />
        </svg>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      <article className="prose-custom mx-auto max-w-3xl pb-20">
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-[var(--text)]">
          Mastering Content Strategy with Outline Extraction
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          In the competitive landscape of digital marketing, understanding how top-ranking pages structure their information is crucial. Search engines rely heavily on heading tags (H1, H2, H3) to interpret the semantic meaning and hierarchy of a document. By using <strong className="text-[var(--text)]">content tools</strong> to analyze competitor pages, you can uncover exactly what topics they cover, how deeply they explore them, and what gaps you might be able to exploit in your own content strategy.
        </p>

        <h3 className="mb-3 mt-8 text-lg font-semibold text-[var(--text)]">
          Why You Should Extract Website Headings
        </h3>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          When you <strong className="text-[var(--text)]">extract website headings</strong>, you generate a reverse-engineered blueprint of an article. This document tree reveals the author&apos;s logical flow and the specific subtopics they deemed necessary to satisfy search intent. Rather than reading through a 4,000-word piece line by line, a structured outline lets you instantly assess the breadth and depth of the content. You can quickly identify if they missed a critical subtopic, or if their structure is poorly organized—opportunities for your content to perform better.
        </p>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          Furthermore, word count remains a strong correlative metric for comprehensive content. By checking the total word count alongside the heading structure, you can benchmark how much detail is required to compete for a specific query. If the top three results average 2,500 words and have highly granular H3 tags, a 500-word post with only two H2s is unlikely to rank.
        </p>

        <h3 className="mb-3 mt-8 text-lg font-semibold text-[var(--text)]">
          Integrating URL Analysis Tools into Your Workflow
        </h3>
        <p className="mb-6 leading-relaxed text-[var(--text-2)]">
          Modern SEO requires efficiency. Relying on manual inspection or basic browser tools is time-consuming and scales poorly. Dedicated <strong className="text-[var(--text)]">url analysis tools</strong> like our Content Extractor streamline this process. In a single click, you retrieve the complete heading architecture and word count, allowing you to focus your energy on creating superior content rather than performing tedious manual research.
        </p>

        <ul className="mb-6 list-none space-y-3 pl-0">
          {[
            { title: "Identify topic clusters", desc: "Group related H2s and H3s from competitors to ensure you cover all necessary entities." },
            { title: "Improve UX and readability", desc: "A well-structured document is easier to scan, leading to lower bounce rates and higher engagement." },
            { title: "Spot optimization opportunities", desc: "Find heading structures that lack clear keyword focus or logical progression." },
          ].map((item) => (
             <li key={item.title} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-3">
               <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
               </svg>
               <span className="text-[var(--text-2)]">
                 <strong className="text-[var(--text)]">{item.title}:</strong> {item.desc}
               </span>
             </li>
          ))}
        </ul>
        <p className="leading-relaxed text-[var(--text-2)]">
          Regularly analyzing your industry&apos;s leading content helps you maintain a competitive edge and ensures your pages consistently meet—and exceed—user expectations.
        </p>
      </article>
    </>
  );
}
