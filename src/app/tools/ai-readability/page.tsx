"use client";

import { useState } from "react";
import Link from "next/link";
import { SaveReportButton } from "@/components/save-report-button";
import { FaqSection, RelatedTools, ToolSchema } from "@/components/tool-extras";
import type {
  AiReadabilityReport,
  CheckStatus,
  Grade,
  ReadabilityCheck,
} from "@/lib/ai-readability";

/* ─────────────────────────────────────────────────────────
 * AI Readability Checker — Frontend Page
 * ─────────────────────────────────────────────────────────
 * Answers one question: can an AI assistant actually read this
 * page? ChatGPT, Perplexity and Claude do not execute
 * JavaScript, so a page whose text is injected at runtime reads
 * as empty to them.
 *
 * The score is our own heuristic, and the page says so plainly.
 * ───────────────────────────────────────────────────────── */

type ApiResponse = AiReadabilityReport & { url: string };

/* ── Copy kept out of JSX so it needs no escaping ───────── */

const INTRO =
  "Most AI crawlers — GPTBot, ClaudeBot and PerplexityBot among them — do not execute JavaScript. They read the HTML your server returns and stop there, so a page whose text is injected at runtime reads as an empty document to them. This checker measures exactly what those crawlers receive.";

const DISCLAIMER_TITLE = "How to read this score";

const DISCLAIMER =
  "This score is our own heuristic model, offered as a guide rather than a measurement. It is not a Google metric, not a ranking factor, and not used by any search engine or AI provider. It measures one thing only: what a crawler that does not run JavaScript can see in the HTML your server returns.";

/* ── Main page component ────────────────────────────────── */

export default function AiReadabilityPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai-readability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze the page.");
      }

      setResult(data as ApiResponse);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
        <span className="text-[var(--text)]">AI Readability Checker</span>
      </nav>

      {/* ── Hero ── */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          Free AI Readability Checker
        </h1>
        <p className="mx-auto max-w-2xl text-[var(--text-2)]">{INTRO}</p>
      </div>

      {/* ── Input card ── */}
      <div className="mb-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-sm sm:p-8">
        <form onSubmit={handleCheck} className="flex flex-col gap-4 sm:flex-row">
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
              "Check Readability"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-[var(--red-light)] bg-[var(--red-light)] p-4 text-[var(--red)]">
            <p className="font-semibold">Check Failed</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}
      </div>

      {/* ── Skeleton loading ── */}
      {loading && <SkeletonLoader />}

      {/* ── Results ── */}
      {result && !loading && (
        <>
          <SaveReportButton toolName="AI Readability Checker" data={result} />
          <ResultsDashboard result={result} />
        </>
      )}

      {/* ── SEO content ── */}
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

/* ── Skeleton ───────────────────────────────────────────── */

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[var(--border)] ${className ?? ""}`} />;
}

function SkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6">
        <div className="flex items-center gap-6">
          <Pulse className="h-24 w-24 rounded-full" />
          <div className="flex-1">
            <Pulse className="mb-3 h-5 w-48" />
            <Pulse className="h-4 w-72" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6">
        <Pulse className="mb-4 h-4 w-32" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Pulse key={i} className="mb-3 h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

/* ── Colour helpers ─────────────────────────────────────── */

function gradeColor(grade: Grade): string {
  if (grade === "excellent" || grade === "good") return "var(--green)";
  if (grade === "fair") return "var(--amber)";
  return "var(--red)";
}

const GRADE_STYLES: Record<Grade, string> = {
  excellent: "bg-[var(--green-light)] text-[var(--green)]",
  good: "bg-[var(--green-light)] text-[var(--green)]",
  fair: "bg-[var(--amber-light)] text-[var(--amber)]",
  critical: "bg-[var(--red-light)] text-[var(--red)]",
};

const STATUS_STYLES: Record<CheckStatus, { pill: string; label: string }> = {
  pass: { pill: "bg-[var(--green-light)] text-[var(--green)]", label: "Pass" },
  warn: { pill: "bg-[var(--amber-light)] text-[var(--amber)]", label: "Warning" },
  fail: { pill: "bg-[var(--red-light)] text-[var(--red)]", label: "Fail" },
};

function GradePill({ grade }: { grade: Grade }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${GRADE_STYLES[grade]}`}>
      {grade}
    </span>
  );
}

/* ── Results dashboard ──────────────────────────────────── */

function ResultsDashboard({ result }: { result: ApiResponse }) {
  const color = gradeColor(result.grade);

  return (
    <div className="space-y-6">
      {/* ── Score block ── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
          <div className="relative flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-subtle)] shadow-inner">
            <svg className="absolute h-full w-full -rotate-90 transform" viewBox="0 0 36 36" width="100%" height="100%">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeDasharray={`${result.score}, 100`}
              />
            </svg>
            <span className="text-4xl font-bold" style={{ color }}>{result.score}</span>
          </div>

          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text)]">AI Readability Score</h2>
              <GradePill grade={result.grade} />
            </div>
            <p className="mb-5 break-words text-sm text-[var(--text-3)]">
              Analyzed:{" "}
              <a href={result.url} target="_blank" rel="noreferrer" className="text-[var(--blue)] hover:underline">
                {result.url}
              </a>{" "}
              &middot; {result.wordCount.toLocaleString()} words of body text found in the HTML.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Passed" value={result.tally.pass} color="var(--green)" />
              <StatCard label="Warnings" value={result.tally.warn} color="var(--amber)" />
              <StatCard label="Failed" value={result.tally.fail} color="var(--red)" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Honest disclaimer ── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[var(--text-2)]">
          <svg className="h-4 w-4 flex-shrink-0 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          {DISCLAIMER_TITLE}
        </p>
        <p className="text-sm leading-relaxed text-[var(--text-3)]">{DISCLAIMER}</p>
      </div>

      {/* ── Check list ── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-sm sm:p-8">
        <h3 className="mb-6 text-lg font-bold text-[var(--text)]">Checks</h3>
        <ul className="space-y-4">
          {result.checks.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Shared UI primitives ───────────────────────────────── */

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
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

function CheckRow({ check }: { check: ReadabilityCheck }) {
  const style = STATUS_STYLES[check.status];
  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${style.pill}`}>
            {style.label}
          </span>
          <span className="font-semibold text-[var(--text)]">{check.label}</span>
        </div>
        <span className="font-mono text-xs font-semibold text-[var(--text-3)]">
          {check.earned}/{check.weight} pts
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">{check.detail}</p>
      {check.status !== "pass" && check.fix && (
        <div className="mt-3 rounded-lg border-l-4 border-[var(--accent)] bg-[var(--accent-light)] px-4 py-3">
          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">How to fix</p>
          <p className="text-sm leading-relaxed text-[var(--text-2)]">{check.fix}</p>
        </div>
      )}
    </li>
  );
}

/* ── SEO Content Section ────────────────────────────────── */

const AI_ARTICLE = {
  jsTitle: "Why AI Assistants Cannot Read JavaScript",
  jsP1:
    "The dedicated AI crawlers — GPTBot, ClaudeBot, PerplexityBot and their equivalents — do not run JavaScript. They fetch your URL, read the HTML the server returns, and stop there. If your page builds its content in the browser after load — with a React, Vue or Angular app that fetches data on mount — then the document those crawlers receive is an empty shell. The words a human sees never reach them. This tool exists to show you exactly what that shell contains.",
  jsP2:
    "Googlebot behaves differently. It may render a page in a second pass and index the result, which is why a site with excellent Google rankings can still be invisible to AI assistants. That gap is the reason this checker exists: it measures the first response, the one non-rendering crawlers use, because that response decides whether an assistant can quote you at all.",
  checksTitle: "What Each Check Measures",
  checksP1:
    "The score is built from eleven checks, each weighted by how strongly it has been linked to being cited. The heaviest is content in the HTML (20 points): the number of words present in the served document. Below 50 words fails, 150 or more passes, and anything between is a warning. Heading structure (12 points) looks for an H1 that states the page's subject. Structured data (12 points) counts JSON-LD blocks. Title (10) and freshness (10) reward a descriptive title and a declared publish or modified date. Meta description (8), content-to-markup ratio (8), indexability (7), AI crawler access (5), canonical (5) and a declared language (3) make up the rest.",
  checksP2:
    "Every check is scored pass, warn or fail. A pass earns its full weight, a warning earns half rounded up, and a fail earns nothing. The points are shown beside each check so you can see where the score was won or lost rather than accepting a single number on faith.",
  researchTitle: "The Research Behind Our Weights",
  researchP1:
    "The weights are not invented from thin air. They follow published correlation findings on which page properties actually appear in AI citations. Metadata and freshness correlate at r=0.68, semantic HTML at r=0.65, and structured data at r=0.63. Those three clusters carry the largest share of the score because they are the properties that most reliably separate pages assistants choose to quote from pages they ignore.",
  researchP2:
    "Read that honestly: correlation is not causation, and these figures describe patterns across many pages, not a guarantee for yours. A high score makes a page readable. It does not make it cited.",
  limitsTitle: "What This Tool Cannot Tell You",
  limitsP1:
    "This checker reads one URL, once. It does not crawl your site, it does not test your sitemap, and it does not execute JavaScript.",
  limitsP2:
    "That last limit matters most. Because we do not render the page, we cannot tell you what a real browser would see. A page can score badly here and still look perfect to a visitor — that is precisely the failure being measured. We also cannot tell you whether any AI assistant actually cites you. Being readable is a precondition for citation, not a promise of it. And we cannot see behind a login, past a bot challenge, or into any content that appears only after interaction.",
  limitsP3:
    "Treat the score as a fast, honest diagnostic. It answers one question: is the text of this page present in the HTML that a non-rendering crawler receives, and are the signals that correlate with citation in place? If the answer is no, you now know what to fix.",
} as const;

function ContentSection() {
  return (
    <>
      {/* Decorative divider */}
      <div className="my-16 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        <svg className="h-5 w-5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      <article className="prose-custom mx-auto max-w-3xl pb-20">
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-[var(--text)]">
          {AI_ARTICLE.jsTitle}
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">{AI_ARTICLE.jsP1}</p>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">{AI_ARTICLE.jsP2}</p>

        <h2 className="mb-4 mt-10 text-2xl font-bold tracking-tight text-[var(--text)]">
          {AI_ARTICLE.checksTitle}
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">{AI_ARTICLE.checksP1}</p>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">{AI_ARTICLE.checksP2}</p>

        <h2 className="mb-4 mt-10 text-2xl font-bold tracking-tight text-[var(--text)]">
          {AI_ARTICLE.researchTitle}
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">{AI_ARTICLE.researchP1}</p>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">{AI_ARTICLE.researchP2}</p>

        <h2 className="mb-4 mt-10 text-2xl font-bold tracking-tight text-[var(--text)]">
          {AI_ARTICLE.limitsTitle}
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">{AI_ARTICLE.limitsP1}</p>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">{AI_ARTICLE.limitsP2}</p>
        <p className="leading-relaxed text-[var(--text-2)]">{AI_ARTICLE.limitsP3}</p>

        <ToolSchema slug="ai-readability" />
        <FaqSection slug="ai-readability" />
      </article>
      <RelatedTools current="ai-readability" />
    </>
  );
}
