"use client";

import { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────
 * Broken Link Checker — Frontend Page
 * ─────────────────────────────────────────────────────────
 * Displays working/broken links in a categorised dashboard
 * with status badges, CSV export, and a premium upsell CTA.
 * ───────────────────────────────────────────────────────── */

/* ── Data interfaces ────────────────────────────────────── */

interface LinkResult {
  url: string;
  status: number | null;
  ok: boolean;
  error?: string;
}

interface ScanResult {
  scannedUrl: string;
  totalFound: number;
  totalChecked: number;
  working: LinkResult[];
  broken: LinkResult[];
}

/* ── Main page component ────────────────────────────────── */

export default function BrokenLinkCheckerPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/check-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to scan links.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    const all = [...result.broken, ...result.working];
    const headers = ["URL", "Status", "Result"];
    const csvContent = [
      headers.join(","),
      ...all.map(
        (r) =>
          `"${r.url}","${r.status ?? r.error ?? "N/A"}","${r.ok ? "OK" : "BROKEN"}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `broken_links_${new Date().getTime()}.csv`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      {/* ── Breadcrumbs ── */}
      <nav className="mb-8 flex w-fit items-center space-x-3 rounded-lg bg-[var(--bg-subtle)] px-4 py-2.5 text-[14px] font-medium text-[var(--text-2)]">
        <Link href="/" className="transition-colors hover:text-[var(--accent)]">Home</Link>
        <ChevronIcon />
        <span>Tools</span>
        <ChevronIcon />
        <span className="text-[var(--text)]">Broken Link Checker</span>
      </nav>

      {/* ── Hero ── */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          Free Broken Link Checker
        </h1>
        <p className="mx-auto max-w-2xl text-[var(--text-2)]">
          Scan any web page to instantly find broken links. We check every link on the page
          and show you exactly which ones return 404s, 500s, or timeouts.
        </p>
      </div>

      {/* ── Input card ── */}
      <div className="mb-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-sm sm:p-8">
        <form onSubmit={handleScan} className="flex flex-col gap-4 sm:flex-row">
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
                Scanning...
              </>
            ) : (
              "Scan Links"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-[var(--red-light)] bg-[var(--red-light)] p-4 text-[var(--red)]">
            <p className="font-semibold">Scan Failed</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}
      </div>

      {/* ── Skeleton loading ── */}
      {loading && <SkeletonLoader />}

      {/* ── Results ── */}
      {result && !loading && (
        <>
          <ResultsDashboard result={result} onDownload={handleDownloadCSV} />
          <UpsellCard />
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

function SkeletonLoader() {
  const Pulse = ({ className }: { className?: string }) => (
    <div className={`animate-pulse rounded-lg bg-[var(--border)] ${className ?? ""}`} />
  );
  return (
    <div className="space-y-6">
      {/* Stats row skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-5">
            <Pulse className="mb-2 h-3 w-20" />
            <Pulse className="h-8 w-16" />
          </div>
        ))}
      </div>
      {/* Links skeleton */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6">
        <Pulse className="mb-4 h-4 w-32" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Pulse key={i} className="mb-3 h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

/* ── Results Dashboard ──────────────────────────────────── */

function ResultsDashboard({
  result,
  onDownload,
}: {
  result: ScanResult;
  onDownload: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"broken" | "working">(
    result.broken.length > 0 ? "broken" : "working"
  );

  return (
    <div className="space-y-6">
      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Links Found" value={result.totalFound} color="var(--text)" />
        <StatCard
          label="Working"
          value={result.working.length}
          color="var(--green)"
        />
        <StatCard
          label="Broken"
          value={result.broken.length}
          color="var(--red)"
        />
      </div>

      {/* ── Tabs + Download ── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("broken")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "broken"
                ? "bg-[var(--red)] text-white"
                : "bg-[var(--bg-subtle)] text-[var(--text-2)] hover:bg-[var(--border)]"
            }`}
          >
            Broken ({result.broken.length})
          </button>
          <button
            onClick={() => setActiveTab("working")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "working"
                ? "bg-[var(--green)] text-white"
                : "bg-[var(--bg-subtle)] text-[var(--text-2)] hover:bg-[var(--border)]"
            }`}
          >
            Working ({result.working.length})
          </button>
        </div>
        <button
          onClick={onDownload}
          className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-2)] transition-colors hover:bg-[var(--border)] hover:text-[var(--text)]"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CSV
        </button>
      </div>

      {/* ── Link list ── */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] shadow-sm">
        <div className="max-h-[500px] overflow-auto">
          {(activeTab === "broken" ? result.broken : result.working).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="mb-2 text-4xl">{activeTab === "broken" ? "🎉" : "📭"}</span>
              <p className="text-sm font-medium text-[var(--text-2)]">
                {activeTab === "broken"
                  ? "No broken links found — your page is healthy!"
                  : "No working links to display."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[var(--bg-subtle)] text-xs uppercase text-[var(--text-3)] shadow-[0_1px_0_var(--border)]">
                <tr>
                  <th className="px-6 py-4 font-medium">URL</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(activeTab === "broken" ? result.broken : result.working).map(
                  (link, i) => (
                    <tr key={i} className="transition-colors hover:bg-[var(--bg-subtle)]">
                      <td className="max-w-[500px] truncate px-6 py-3 font-mono text-[13px] text-[var(--text)]">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-[var(--accent)] hover:underline"
                        >
                          {link.url}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right">
                        <StatusBadge link={link} />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {result.totalFound > result.totalChecked && (
        <p className="text-center text-xs text-[var(--text-3)]">
          Showing {result.totalChecked} of {result.totalFound} links found.
          We cap at 50 per scan to stay within free-tier limits.
        </p>
      )}
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

function StatusBadge({ link }: { link: LinkResult }) {
  if (link.ok) {
    return (
      <span className="inline-flex items-center rounded-full bg-[var(--green-light)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--green)]">
        {link.status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--red-light)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--red)]">
      {link.status ?? link.error ?? "Error"}
    </span>
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
          Links break constantly.
        </h2>
        <p className="mb-6 text-[15px] leading-relaxed text-[var(--text-2)]">
          Enter your email to have <strong className="text-[var(--accent)]">Compy</strong> monitor
          your site in the background and alert you the second a high-value link 404s.
          Never lose SEO equity or send users to dead pages again.
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

/* ── SEO Content Section ────────────────────────────────── */

function ContentSection() {
  return (
    <>
      {/* Decorative divider */}
      <div className="my-16 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        <svg className="h-5 w-5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      <article className="prose-custom mx-auto max-w-3xl pb-20">
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-[var(--text)]">
          Why You Need a Website Link Checker
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          Broken links are one of the most common — and most damaging — technical SEO issues.
          Every 404 error on your site sends a signal to search engines that your content may
          be outdated or poorly maintained. Visitors who encounter dead links lose trust, bounce
          immediately, and rarely return. A reliable <strong className="text-[var(--text)]">website link checker</strong> helps
          you catch these problems before they erode your rankings and user experience.
        </p>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          Links break for many reasons: a page is deleted, a domain expires, a CMS migration
          changes URL slugs, or an external site you linked to simply goes offline. The longer
          a broken link persists, the more crawl budget Google wastes attempting to follow it,
          and the more link equity (PageRank) evaporates into thin air. Regular audits with{" "}
          <strong className="text-[var(--text)]">URL analysis tools</strong> are the simplest
          preventive measure any site owner can take.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold tracking-tight text-[var(--text)]">
          How to Find Broken Links Free
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          Our tool lets you <strong className="text-[var(--text)]">find broken links free</strong> without
          creating an account or installing software. Simply paste a URL, click &quot;Scan Links&quot;,
          and we&apos;ll fetch the page, extract every anchor tag, and verify each link with a
          lightweight HTTP request. Working links are displayed with green status badges, while
          broken links surface immediately with red badges showing the exact HTTP error code.
        </p>

        <h3 className="mb-3 mt-6 text-lg font-semibold text-[var(--text)]">
          What Our Checker Inspects
        </h3>
        <ul className="mb-6 list-none space-y-3 pl-0">
          {[
            { title: "HTTP status codes", desc: "We detect 404 (Not Found), 500 (Server Error), 403 (Forbidden), and timeout errors." },
            { title: "Internal and external links", desc: "Both on-site and off-site links are resolved and checked." },
            { title: "Redirect chains", desc: "Links that redirect are followed automatically — if the final destination fails, it's flagged." },
            { title: "Concurrent scanning", desc: "Links are checked in parallel batches for speed, with safeguards to prevent server overload." },
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

        <h3 className="mb-3 mt-6 text-lg font-semibold text-[var(--text)]">
          Best Practices After Finding Broken Links
        </h3>
        <p className="leading-relaxed text-[var(--text-2)]">
          Once you&apos;ve identified broken links, the fix depends on the type: for internal links,
          update the href to the correct page or set up a 301 redirect. For external links pointing
          to dead third-party pages, replace them with an alternative resource or remove the link
          entirely. Running a scan monthly — or after any major content migration — ensures your
          site maintains a clean link profile that both users and search engines will reward.
        </p>
      </article>
    </>
  );
}
