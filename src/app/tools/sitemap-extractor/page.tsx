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

      {/* ── Decorative divider ── */}
      <div className="my-16 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        <svg className="h-5 w-5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      {/* ── SEO Content Section ── */}
      <article className="prose-custom mx-auto max-w-3xl pb-20">

        <h2 className="mb-4 text-2xl font-bold tracking-tight text-[var(--text)]">
          How to Generate a Sitemap from a URL
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          Generating a sitemap from a URL is one of the most fundamental tasks in technical SEO and
          website auditing. A sitemap is essentially a structured list of every publicly accessible
          page on a website, formatted so that search engines can discover and index content
          efficiently. The process typically begins by fetching the site&apos;s{" "}
          <code className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[13px] font-medium text-[var(--accent)]">robots.txt</code>{" "}
          file, which often contains a direct reference to one or more XML sitemap files. If no
          sitemap directive is found, crawlers fall back to the conventional path at{" "}
          <code className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[13px] font-medium text-[var(--accent)]">/sitemap.xml</code>.
        </p>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          Once the sitemap XML is retrieved, a parser reads through the structured tags —{" "}
          <code className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[13px] font-medium text-[var(--accent)]">&lt;urlset&gt;</code>,{" "}
          <code className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[13px] font-medium text-[var(--accent)]">&lt;url&gt;</code>,{" "}
          and{" "}
          <code className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[13px] font-medium text-[var(--accent)]">&lt;loc&gt;</code>{" "}
          — to extract every listed URL along with optional metadata like the last modification
          date, change frequency, and priority. Larger websites often use a{" "}
          <strong className="text-[var(--text)]">sitemap index</strong>, which acts as a table of
          contents pointing to multiple smaller sitemaps, each covering a specific section of the
          site such as blog posts, product pages, or documentation.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold tracking-tight text-[var(--text)]">
          Why XML Sitemaps Matter for SEO
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          Search engines like Google, Bing, and Yandex rely heavily on XML sitemaps to understand the
          full scope of a website. Without a sitemap, a search engine bot must discover pages solely
          through internal links — a process that can miss orphaned pages, newly published content,
          or deeply nested URLs that sit more than three clicks from the homepage.
        </p>

        <h3 className="mb-3 mt-6 text-lg font-semibold text-[var(--text)]">
          Key Benefits of Maintaining an XML Sitemap
        </h3>
        <ul className="mb-6 list-none space-y-3 pl-0">
          {[
            { title: "Faster indexing", desc: "New pages are discovered within hours instead of days or weeks." },
            { title: "Crawl budget efficiency", desc: "Search bots spend less time discovering pages and more time evaluating content quality." },
            { title: "Metadata signals", desc: "The lastmod tag tells search engines which pages have been recently updated, prompting a re-crawl." },
            { title: "Error detection", desc: "Comparing your sitemap against your live site reveals broken links, redirect chains, and missing pages." },
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
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          For websites with thousands of pages — e-commerce stores, news outlets, or documentation
          portals — an up-to-date sitemap is not optional; it is critical infrastructure. Regular
          sitemap audits ensure that search engines always have an accurate picture of your site&apos;s
          content architecture.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold tracking-tight text-[var(--text)]">
          How Our Free Crawler Works
        </h2>
        <p className="mb-4 leading-relaxed text-[var(--text-2)]">
          Our Sitemap &amp; URL Extractor runs entirely on edge infrastructure, which means every
          request is handled by a serverless function deployed close to your geographic location for
          minimal latency. When you enter a domain and click <strong className="text-[var(--text)]">Extract URLs</strong>,
          the following happens behind the scenes:
        </p>
        <ol className="mb-6 list-none space-y-3 pl-0">
          {[
            "We fetch the target domain\u2019s robots.txt file to look for declared Sitemap: directives.",
            "If no sitemap is declared, we fall back to the standard /sitemap.xml path.",
            "The retrieved XML is parsed using a robust, spec-compliant parser that handles both urlset and sitemapindex formats.",
            "All discovered URLs and their metadata are returned to your browser instantly — nothing is stored on our servers.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-[var(--text-2)]">{step}</span>
            </li>
          ))}
        </ol>

        <h3 className="mb-3 mt-6 text-lg font-semibold text-[var(--text)]">
          Privacy &amp; Transparency
        </h3>
        <p className="leading-relaxed text-[var(--text-2)]">
          Your data never leaves the pipeline between your browser and the target website. We do not
          log, cache, or store the URLs you extract. The CSV export is generated entirely client-side
          using the{" "}
          <code className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[13px] font-medium text-[var(--accent)]">Blob</code>{" "}
          API, so the file is created in your browser&apos;s memory and downloaded directly to your
          device. This tool is free, requires no sign-up, and will always remain open for developers,
          SEO professionals, and content teams who need a quick, reliable sitemap audit.
        </p>
      </article>
    </div>
  );
}
