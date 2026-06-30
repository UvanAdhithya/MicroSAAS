"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { SeoReportResult } from "../../api/free-seo-report/route";

/* ─────────────────────────────────────────────────────────
 * Free SEO Report — Frontend Page
 * ─────────────────────────────────────────────────────────
 * Generates an SEO Health Dashboard and allows downloading
 * it as a PDF using html2pdf.js.
 * ───────────────────────────────────────────────────────── */

export default function FreeSeoReportPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/free-seo-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate report.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);

    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import("html2pdf.js")).default;
      
      const element = reportRef.current;
      const opt: any = {
        margin: 10,
        filename: `SEO_Report_${new URL(result!.url).hostname}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setDownloading(false);
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
        <span className="text-[var(--text)]">Free SEO Report</span>
      </nav>

      {/* ── Hero ── */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          Free Website SEO Report
        </h1>
        <p className="mx-auto max-w-2xl text-[var(--text-2)]">
          Instantly generate a comprehensive technical SEO audit. Check your meta tags, heading structure, and core metrics, then export as a professional PDF.
        </p>
      </div>

      {/* ── Input card ── */}
      <div className="mb-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-sm sm:p-8">
        <form onSubmit={handleGenerate} className="flex flex-col gap-4 sm:flex-row">
          <input
            type="url"
            required
            suppressHydrationWarning
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
                <SpinnerIcon />
                Generating...
              </>
            ) : (
              "Generate Free Report"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-[var(--red-light)] bg-[var(--red-light)] p-4 text-[var(--red)]">
            <p className="font-semibold">Generation Failed</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}
      </div>

      {/* ── Skeleton loading ── */}
      {loading && <SkeletonLoader />}

      {/* ── Dashboard & Results ── */}
      {result && !loading && (
        <div className="mb-12 space-y-8">
          <div className="flex justify-end">
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="inline-flex items-center rounded-xl bg-[var(--text)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <SpinnerIcon />
                  Creating PDF...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report as PDF
                </>
              )}
            </button>
          </div>

          {/* This wrapper is what html2pdf targets */}
          <div 
            ref={reportRef} 
            className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm"
          >
            <DashboardContent result={result} />
          </div>
          
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

function DashboardContent({ result }: { result: SeoReportResult }) {
  // Score Calculation Logic
  let score = 0;
  if (result.title) score += 20;
  if (result.metaDescription) score += 20;
  if (result.h1Count > 0 && result.h1Count <= 2) score += 20; // 1-2 H1s is good
  else if (result.h1Count > 2) score += 10;
  if (result.ogImage) score += 15;
  if (result.linkCount > 0) score += 10;
  if (result.wordCount > 300) score += 15;
  else if (result.wordCount > 100) score += 5;

  const getScoreColor = (s: number) => {
    if (s >= 80) return "#16A34A"; // green
    if (s >= 50) return "#D97706"; // amber
    return "#DC2626"; // red
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="bg-white p-8 md:p-12 text-[#111827]">
      {/* Dashboard Header */}
      <div className="mb-10 flex flex-col items-center justify-between gap-8 border-b border-gray-200 pb-8 md:flex-row">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Health Report</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Target: <a href={result.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{result.url}</a>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
        
        {/* Score Circle */}
        <div className="flex flex-col items-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 shadow-inner">
            <svg className="absolute h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={scoreColor}
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
              />
            </svg>
            <span className="text-2xl font-bold" style={{ color: scoreColor }}>{score}</span>
          </div>
          <span className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">Overall Score</span>
        </div>
      </div>

      {/* Grid Layouts */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <MetricBox title="Page Title" value={result.title} pass={!!result.title} />
        <MetricBox title="Meta Description" value={result.metaDescription} pass={!!result.metaDescription} />
        <MetricBox title="OpenGraph Image" value={result.ogImage} pass={!!result.ogImage} type="url" />
      </div>

      {/* Stats & Progress Bars */}
      <div className="mb-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-6 text-lg font-bold text-gray-900">Content Structure</h3>
        <div className="space-y-6">
          <ProgressBar label="H1 Tags" value={result.h1Count} max={3} ideal={1} />
          <ProgressBar label="H2 Tags" value={result.h2Count} max={20} ideal={3} />
          <ProgressBar label="Total Links" value={result.linkCount} max={100} ideal={20} />
          <ProgressBar label="Word Count" value={result.wordCount} max={2000} ideal={500} suffix=" words" />
        </div>
      </div>
    </div>
  );
}

function MetricBox({ title, value, pass, type = "text" }: { title: string; value: string | null; pass: boolean; type?: "text" | "url" }) {
  return (
    <div className="rounded-xl border border-gray-200 p-5 shadow-sm bg-white">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-700">{title}</span>
        {pass ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">Pass</span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">Missing</span>
        )}
      </div>
      {value ? (
        type === "url" ? (
          <a href={value} target="_blank" rel="noreferrer" className="block truncate text-sm text-blue-600 hover:underline">
            {value}
          </a>
        ) : (
          <p className="text-sm text-gray-600 line-clamp-2">{value}</p>
        )
      ) : (
        <p className="text-sm italic text-gray-400">No {title.toLowerCase()} found.</p>
      )}
    </div>
  );
}

function ProgressBar({ label, value, max, ideal, suffix = "" }: { label: string; value: number; max: number; ideal: number; suffix?: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  const isGood = value >= ideal;
  const barColor = isGood ? "bg-green-500" : value > 0 ? "bg-amber-500" : "bg-red-500";

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">{value}{suffix}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div className={`h-2.5 rounded-full ${barColor} transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function SkeletonLoader() {
  const Pulse = ({ className }: { className?: string }) => (
    <div className={`animate-pulse rounded-lg bg-[var(--border)] ${className ?? ""}`} />
  );
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-8">
        <div className="mb-8 flex justify-between border-b border-[var(--border)] pb-8">
          <div><Pulse className="mb-2 h-8 w-48" /><Pulse className="h-4 w-32" /></div>
          <Pulse className="h-24 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-6"><Pulse className="h-24 w-full" /><Pulse className="h-24 w-full" /></div>
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
          Generate an SEO Report Free of Charge
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          Regularly auditing your web pages is vital for staying ahead in search rankings. With our tool, you can generate a professional <strong>seo report free</strong> of charge. This detailed analysis uncovers fundamental issues that might be holding your site back, from missing title tags to poor heading hierarchy.
        </p>

        <h3 className="mb-3 mt-8 text-lg font-semibold text-[var(--text)]">
          How to Perform an SEO Check Website Free
        </h3>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          To perform an <strong>seo check website free</strong>, simply paste your target URL into the input field above. Our system securely fetches your page and simulates how a search engine crawler perceives your code. It checks for critical on-page elements:
        </p>
        
        <ul className="mb-6 list-none space-y-3 pl-0">
          {[
            { title: "Meta Tags", desc: "Ensuring your Title and Meta Description exist and are optimal for click-through rates." },
            { title: "Heading Structure", desc: "Verifying the presence of an H1 tag and proper distribution of H2 tags for semantic flow." },
            { title: "Social Graph", desc: "Checking OpenGraph imagery so your page looks perfect when shared on social media." },
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

        <h3 className="mb-3 mt-8 text-lg font-semibold text-[var(--text)]">
          The Value of a Reliable Website Analysis Tool
        </h3>
        <p className="leading-relaxed text-[var(--text-2)]">
          Agencies and freelancers rely heavily on a dependable <strong>website analysis tool</strong> to quickly identify technical debt on client sites. By utilizing the PDF export functionality, you can effortlessly save the SEO Health Dashboard and attach it to client pitches or monthly progress reports. Automating this checklist ensures you never miss basic yet critical optimization steps before a major launch or content update.
        </p>
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
          Tired of manually generating these for clients?
        </h2>
        <p className="mb-6 text-[15px] leading-relaxed text-[var(--text-2)]">
          Enter your email to have <strong className="text-[var(--accent)]">Compy</strong> automate weekly PDF SEO reports and email them directly to your stakeholders. Sign up for early access today to streamline your agency workflow.
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
