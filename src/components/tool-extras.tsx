/* ─────────────────────────────────────────────────────────
 * Shared per-tool page furniture: an FAQ block with FAQPage
 * structured data, and cross-links between the five tools.
 * ─────────────────────────────────────────────────────────
 * Previously the only route from one tool to another was the
 * "All Tools" nav link, so a visitor who finished with one tool
 * had nowhere obvious to go, and no authority passed between
 * pages. The FAQ answers are written to match how people
 * actually phrase searches, and to state the free-tier terms
 * plainly (no signup, no daily cap, free PDF export), which is
 * where several competing free SEO tools impose limits.
 *
 * Imported by pages that are themselves client components, so
 * this module is bundled as client code. It holds no state.
 * ───────────────────────────────────────────────────────── */

type Faq = { q: string; a: string };

type ToolRef = {
  slug: string;
  name: string;
  /** Short line used on the cross-link cards. */
  blurb: string;
  /** Longer line used for the SoftwareApplication schema description.
   *  Kept in step with the `description` in each route's layout.tsx. */
  description: string;
};

const ALL_TOOLS: ToolRef[] = [
  {
    slug: "seo-analyzer",
    name: "SEO Analyzer",
    blurb: "Audit a page's title, meta tags, OpenGraph data and headings, with a live Google SERP preview.",
    description:
      "Analyze any page's title tag, meta description, OpenGraph and Twitter tags, headings and canonical URL in seconds, with a live Google SERP preview. Free, no signup.",
  },
  {
    slug: "free-seo-report",
    name: "Free SEO Report",
    blurb: "Score a page's technical SEO and download the result as a PDF, with no account.",
    description:
      "Generate a technical SEO health report for any URL and download it as a PDF. Scores title, meta description, headings, links and word count. Free, no signup.",
  },
  {
    slug: "content-extractor",
    name: "Content Extractor",
    blurb: "Pull the heading outline (H1–H3) and word count from any page to plan your own outline.",
    description:
      "Extract the full heading outline (H1, H2, H3) of any web page in DOM order, plus a word count, to reverse-engineer a competitor's content structure. Free, no signup.",
  },
  {
    slug: "sitemap-extractor",
    name: "Sitemap Extractor",
    blurb: "List every URL a site publishes in its robots.txt and XML sitemaps.",
    description:
      "Extract every URL listed in a site's robots.txt and XML sitemaps, with last-modified dates. Free, no signup, and no daily crawl limit.",
  },
  {
    slug: "broken-link-checker",
    name: "Broken Link Checker",
    blurb: "Scan a page for dead links and see the HTTP status of every URL it points to.",
    description:
      "Scan any page for broken links and see the HTTP status of every URL it points to. Up to 50 links per scan. Free, no signup, no daily limit.",
  },
  {
    slug: "ai-readability",
    name: "AI Readability Checker",
    blurb: "See whether AI assistants can actually read a page, or whether JavaScript is hiding its content.",
    description:
      "Check whether AI assistants can read a page, and score eleven signals — server-rendered content, structured data, freshness and crawler access — that correlate with being cited. Free, no signup.",
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.seosnap.xyz";

const FAQS: Record<string, Faq[]> = {
  "seo-analyzer": [
    {
      q: "What is an SEO analyzer?",
      a: "A tool that fetches a page's HTML and reports the on-page signals search engines read: its title tag, meta description, OpenGraph and Twitter tags, heading structure and canonical URL. SEOSnap shows all of them in one view alongside a live preview of how the page would appear in Google.",
    },
    {
      q: "Is the SEO analyzer free?",
      a: "Yes. Every check runs without an account and there is no daily limit. Creating a free account adds only the ability to save reports to a dashboard so you can compare audits later.",
    },
    {
      q: "Do I need to sign up to see the results?",
      a: "No. Results appear as soon as the scan finishes. Signup is optional and exists solely to store reports for you.",
    },
    {
      q: "Why does it warn about my title tag length?",
      a: "Google truncates titles beyond roughly 60 characters in search results. The analyzer flags titles outside the 30–60 character range so you can shorten them yourself rather than letting Google cut them off with an ellipsis.",
    },
    {
      q: "Can it analyze a page that renders entirely with JavaScript?",
      a: "No. The analyzer reads the HTML the server returns and does not execute JavaScript, so a single-page app that builds itself in the browser may return no title, description or headings. That result is still useful: it is exactly what Bing, GPTBot and PerplexityBot see, since none of them run JavaScript either.",
    },
    {
      q: "Does SEOSnap store the URLs I analyze?",
      a: "No. The page is fetched and parsed in memory. Nothing is saved unless you explicitly click Save report, which writes it to your own account.",
    },
  ],

  "free-seo-report": [
    {
      q: "What does the free SEO report include?",
      a: "A scored technical summary of one URL: title tag, meta description, OpenGraph image, H1 and H2 counts, total links and word count, plus a 0–100 health score built from those signals.",
    },
    {
      q: "Can I download the report as a PDF?",
      a: "Yes, and without an account. The report exports to PDF directly in your browser. Several comparable free tools will generate a report but put the download behind a paid plan.",
    },
    {
      q: "How is the SEO score calculated?",
      a: "Points are weighted across six signals: title tag and meta description are worth 20 points each, a well-formed H1 count up to 20, an OpenGraph image 15, at least one outbound link 10, and body copy over 300 words 15.",
    },
    {
      q: "Is this a full site audit?",
      a: "No, it analyzes a single URL. To cover a whole site, use the Sitemap Extractor to list its pages and the Broken Link Checker to check the links on the pages that matter most.",
    },
    {
      q: "Do I need an account to export the PDF?",
      a: "No. Both the report and its PDF export work anonymously.",
    },
  ],

  "content-extractor": [
    {
      q: "What does the Content Extractor do?",
      a: "It returns the full heading outline of a page, H1 through H3, in the order the headings appear in the document, plus an approximate word count for the body text.",
    },
    {
      q: "Why would I extract another site's headings?",
      a: "Heading structure shows how a competing page organises its argument. Seeing which topics get their own H2, and in what order, is a fast way to plan your own outline before you start writing.",
    },
    {
      q: "How accurate is the word count?",
      a: "It is approximate. The tool strips the markup and counts whitespace-separated words in the body text, so navigation and footer copy are included.",
    },
    {
      q: "Is there a limit on how many headings it returns?",
      a: "It returns up to 100 headings per page. Longer documents are truncated at that point, and the report tells you when that has happened.",
    },
    {
      q: "Do I need to sign up?",
      a: "No, and there is no daily cap on how many pages you can extract.",
    },
  ],

  "sitemap-extractor": [
    {
      q: "How does the Sitemap Extractor find URLs?",
      a: "It reads the site's robots.txt for Sitemap: directives first, and falls back to /sitemap.xml if none are declared. It then parses the XML for every <loc> entry it contains.",
    },
    {
      q: "Why did it return fewer URLs than the site actually has?",
      a: "It reads up to three sitemaps per run, and nested sitemap indexes are listed rather than followed. A site that splits its sitemap into many child files will show fewer URLs than it really publishes.",
    },
    {
      q: "Can I export the URL list?",
      a: "Yes, as CSV, straight from the results table and without an account.",
    },
    {
      q: "Does it work on any site?",
      a: "It works on any site that publishes a sitemap at the standard location or declares one in robots.txt. If neither is present there is nothing to extract, and the tool reports that rather than returning an empty list.",
    },
  ],

  "broken-link-checker": [
    {
      q: "How many links does it check per scan?",
      a: "Up to 50 unique links, checked in concurrent batches. The results state how many links were found against how many were actually checked.",
    },
    {
      q: "What counts as a broken link?",
      a: "Any link returning an HTTP status outside the 200–399 range, or one that times out or cannot be reached. Every row shows the status code it received.",
    },
    {
      q: "Does it check every page on my site?",
      a: "No, it checks the links found on the single page you enter. To cover a site properly, use the Sitemap Extractor to get your URL list and run the checker against your most important pages.",
    },
    {
      q: "Why does a link show as broken when it opens fine in my browser?",
      a: "Some servers block automated requests or reject HEAD requests specifically. SEOSnap retries with GET when HEAD fails, but a minority of sites block bots outright and will always report as unreachable.",
    },
    {
      q: "Can I tell which link on my page is broken?",
      a: "Yes. Every result shows the anchor text of the link pointing at it, so you can find it in your page and fix it. Most free link checkers report a broken URL without saying where on the page it came from, which leaves you hunting through your own markup for it.",
    },
    {
      q: "Does it show redirect chains?",
      a: "Yes. Each redirect hop is followed and reported, for working links as well as broken ones. A link that only resolves after three hops is usually a misconfiguration and leaks link equity while it slows every visitor down. Most free checkers silently flatten the chain to the final URL, which hides the problem.",
    },
    {
      q: "Is it free and unlimited?",
      a: "Yes. Free, no signup, and no daily limit on scans.",
    },
  ],

  "ai-readability": [
    {
      q: "What does the AI Readability Checker actually check?",
      a: "Eleven signals, all read from the HTML your server returns: how many words of body text are present in the HTML, whether an H1 states the page's subject, how many JSON-LD blocks it carries, its title and meta description, whether it declares a publish or modified date, the ratio of visible text to markup, whether a noindex tag is present, which AI crawlers robots.txt allows, whether a canonical URL is set, and whether the html element declares a language. Each is scored pass, warn or fail and shown with its own weight.",
    },
    {
      q: "Why does it matter that AI crawlers do not run JavaScript?",
      a: "ChatGPT, Perplexity, Claude and Bing's AI crawlers fetch a URL, read the HTML the server sends back and stop there — they never execute your scripts. If your page builds its content in the browser after load, the document they receive is an empty shell, and the words a visitor sees never reach them. Googlebot is different: it may render the page in a second pass, which is why a site can rank well in Google and still be invisible to assistants. This tool measures that first response.",
    },
    {
      q: "Is this score a Google metric?",
      a: "No. It is our own heuristic, not a Google metric, a ranking factor, or a figure any search engine or AI provider uses. The weights follow published correlation findings on which page properties appear in AI citations, but the model is ours. Treat it as a guide to what a non-rendering crawler can see, not as a measurement of how you rank.",
    },
    {
      q: "Is blocking AI crawlers in my robots.txt a bad thing?",
      a: "Not at all, and the tool does not treat it as a fault. Blocking GPTBot, ClaudeBot or others is a legitimate choice with real trade-offs — you may be protecting content or bandwidth, and you are also making it impossible for those assistants to read or cite the page. The tool simply reports which agent tokens are disallowed so you can make that trade-off deliberately rather than by accident.",
    },
    {
      q: "Can it tell me whether an AI assistant cites my site?",
      a: "No. It cannot see what any assistant says, what it retrieves, or whether it has ever quoted you. Being readable is a precondition for being cited, not a promise of it, and a high score is no guarantee of a single citation. The tool answers one narrower question: is the text of this page present in the HTML a non-rendering crawler receives, and are the signals that correlate with citation in place?",
    },
  ],
};

/* ── FAQ block + FAQPage structured data ─────────────────── */

export function FaqSection({ slug }: { slug: string }) {
  const faqs = FAQS[slug];
  if (!faqs || faqs.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <section className="mt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h2 className="mb-6 text-2xl font-bold tracking-tight text-[var(--text)]">
        Frequently asked questions
      </h2>

      <div className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.q}>
            <h3 className="mb-2 text-lg font-semibold text-[var(--text)]">{faq.q}</h3>
            <p className="leading-relaxed text-[var(--text-2)]">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Cross-links to the other tools ──────────────────────── */

export function RelatedTools({ current }: { current: string }) {
  const others = ALL_TOOLS.filter((tool) => tool.slug !== current);
  if (others.length === 0) return null;

  return (
    <section className="mt-16 border-t border-[var(--border)] pt-10">
      <h2 className="mb-6 text-lg font-bold text-[var(--text)]">Other free SEO tools</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {others.map((tool) => (
          <a
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-5 transition-colors hover:border-[var(--accent)]"
          >
            <span className="flex items-center gap-2 font-semibold text-[var(--text)]">
              {tool.name}
              <svg
                className="h-3.5 w-3.5 text-[var(--text-3)] transition-colors group-hover:text-[var(--accent)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
            <span className="mt-1.5 block text-sm leading-relaxed text-[var(--text-2)]">
              {tool.blurb}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ── SoftwareApplication structured data ─────────────────── */

export function ToolSchema({ slug }: { slug: string }) {
  const tool = ALL_TOOLS.find((t) => t.slug === slug);
  if (!tool) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: `${SITE_URL}/tools/${tool.slug}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    isPartOf: {
      "@type": "WebSite",
      name: "SEOSnap",
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
