"use client";

import { useState } from "react";
import Link from "next/link";

interface ExtractedUrl {
  url: string;
  lastmod?: string;
}

export default function SitemapExtractorPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExtractedUrl[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch("/api/extract-sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to extract sitemap.");
      }

      setResults(data.urls || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (results.length === 0) return;

    const headers = ["URL", "Last Modified"];
    const csvContent = [
      headers.join(","),
      ...results.map((r) => `"${r.url}","${r.lastmod || ""}"`),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sitemap_extract_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex w-fit items-center space-x-3 rounded-lg bg-[var(--bg-subtle)] px-4 py-2.5 text-[14px] font-medium text-[var(--text-2)]">
        <Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link>
        <svg className="h-3.5 w-3.5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span>Tools</span>
        <svg className="h-3.5 w-3.5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[var(--text)]">Sitemap URL Extractor</span>
      </nav>

      <div className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          Sitemap & URL Extractor
        </h1>
        <p className="mx-auto max-w-2xl text-[var(--text-2)]">
          Quickly discover all public URLs from a domain's sitemap. We'll check
          robots.txt, parse XML sitemaps, and give you a clean export.
        </p>
      </div>

      <div className="mb-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-sm sm:p-8">
        <form onSubmit={handleCrawl} className="flex flex-col gap-4 sm:flex-row">
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Crawling...
              </>
            ) : (
              "Extract URLs"
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

      {results.length > 0 && (
        <div className="animate-fade-in-up">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--text)]">
              Results <span className="ml-2 text-sm font-normal text-[var(--text-3)]">({results.length} URLs found)</span>
            </h2>
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-2)] transition-colors hover:bg-[var(--border)] hover:text-[var(--text)]"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] shadow-sm">
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full text-left text-sm text-[var(--text-2)]">
                <thead className="sticky top-0 bg-[var(--bg-subtle)] text-xs uppercase text-[var(--text-3)] shadow-[0_1px_0_var(--border)]">
                  <tr>
                    <th className="px-6 py-4 font-medium">URL</th>
                    <th className="px-6 py-4 font-medium">Last Modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {results.map((res, i) => (
                    <tr key={i} className="transition-colors hover:bg-[var(--bg-subtle)]">
                      <td className="px-6 py-3 font-mono text-[13px] text-[var(--text)]">
                        <a href={res.url} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] hover:underline">
                          {res.url}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 font-mono text-[12px]">
                        {res.lastmod ? new Date(res.lastmod).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
