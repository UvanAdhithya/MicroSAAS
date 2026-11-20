/* ─────────────────────────────────────────────────────────
 * AI readability — scoring model
 * ─────────────────────────────────────────────────────────
 * Answers one question: can an AI assistant actually read this
 * page? ChatGPT, Perplexity, Claude and Bing's crawlers do not
 * execute JavaScript, so for them a client-rendered page is an
 * empty document. Googlebot may eventually render it in a second
 * pass; these crawlers never do.
 *
 * This module is pure: it turns already-measured page signals
 * into a scored list of checks. Fetching and parsing live in the
 * API route, so this can be unit tested against fixtures.
 *
 * THE SCORE IS OUR OWN HEURISTIC. It is not a Google metric and
 * not a ranking factor. Weights follow the published correlation
 * study on AI citations (metadata & freshness r=0.68, semantic
 * HTML r=0.65, structured data r=0.63), but the model is ours.
 * The tool must say so, because the documented failure of most
 * free SEO tools is presenting guesswork as fact.
 * ───────────────────────────────────────────────────────── */

export type CheckStatus = "pass" | "warn" | "fail";

export type CheckId =
  | "contentInHtml"
  | "headingStructure"
  | "title"
  | "metaDescription"
  | "structuredData"
  | "freshness"
  | "textRatio"
  | "indexable"
  | "aiCrawlerAccess"
  | "canonical"
  | "language";

export interface ReadabilityCheck {
  id: CheckId;
  label: string;
  status: CheckStatus;
  /** Points this check is worth. */
  weight: number;
  /** Points actually awarded: weight, half (rounded), or zero. */
  earned: number;
  /** What we measured, in plain language. */
  detail: string;
  /** What to do about it. Null when the check passed. */
  fix: string | null;
}

export type Grade = "excellent" | "good" | "fair" | "critical";

/** Measured facts about the fetched page. */
export interface PageSignals {
  /** Words of body text present in the served HTML. */
  wordCount: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  titleLength: number;
  metaDescriptionLength: number;
  /** Number of application/ld+json blocks. */
  jsonLdCount: number;
  /** A datePublished/dateModified/dateModified in JSON-LD, <time datetime>, or an article meta tag. */
  hasDateSignal: boolean;
  /** Value of the HTTP Last-Modified response header, if any. */
  lastModifiedHeader: string | null;
  /** Bytes of extracted visible text. */
  textBytes: number;
  /** Bytes of raw HTML. */
  htmlBytes: number;
  canonical: string | null;
  lang: string | null;
  /** True when a meta robots tag contains noindex. */
  noindex: boolean;
}

export interface RobotsSignals {
  /** Whether robots.txt was reachable. */
  fetched: boolean;
  /** AI crawler tokens explicitly disallowed in robots.txt. */
  blockedAgents: string[];
}

export interface AiReadabilityInput {
  page: PageSignals;
  robots: RobotsSignals;
}

export interface AiReadabilityReport {
  score: number;
  grade: Grade;
  checks: ReadabilityCheck[];
  /** Counts by status, for summary display. */
  tally: { pass: number; warn: number; fail: number };
  wordCount: number;
}

/* ── Known AI crawler user-agent tokens ─────────────────── */

export const AI_CRAWLER_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
] as const;

/* ── Thresholds (exported so the UI can explain them) ───── */

export const THRESHOLDS = {
  /** Words of server-rendered body text. */
  words: { fail: 50, pass: 300 },
  /** Ratio of visible text bytes to total HTML bytes. */
  textRatio: { fail: 0.05, pass: 0.1 },
  /** Characters. */
  title: { min: 15 },
  metaDescription: { min: 50 },
} as const;

/* ── Weights (sum to 100) ───────────────────────────────── */

const WEIGHTS: Record<CheckId, number> = {
  contentInHtml: 20,
  headingStructure: 12,
  structuredData: 12,
  title: 10,
  freshness: 10,
  metaDescription: 8,
  textRatio: 8,
  indexable: 7,
  aiCrawlerAccess: 5,
  canonical: 5,
  language: 3,
};

/** Points for a status: full, half (rounded up), or nothing. */
function points(status: CheckStatus, weight: number): number {
  if (status === "pass") return weight;
  if (status === "warn") return Math.ceil(weight / 2);
  return 0;
}

function check(
  id: CheckId,
  label: string,
  status: CheckStatus,
  detail: string,
  fix: string | null,
): ReadabilityCheck {
  const weight = WEIGHTS[id];
  return { id, label, status, weight, earned: points(status, weight), detail, fix };
}

export function gradeFor(score: number): Grade {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "critical";
}

/* ── Evaluation ─────────────────────────────────────────── */

export function evaluateAiReadability(input: AiReadabilityInput): AiReadabilityReport {
  const { page, robots } = input;
  const checks: ReadabilityCheck[] = [];

  // 1. Server-rendered content — the check this whole tool exists for.
  const { words } = THRESHOLDS;
  const wordStatus: CheckStatus =
    page.wordCount >= words.pass ? "pass" : page.wordCount >= words.fail ? "warn" : "fail";
  checks.push(
    check(
      "contentInHtml",
      "Content is in the HTML",
      wordStatus,
      `${page.wordCount.toLocaleString()} words of body text are present in the served HTML.`,
      wordStatus === "pass"
        ? null
        : "Your text is being added by JavaScript, which non-JS crawlers never see. Server-render the content, or add a pre-rendered fallback, so the words exist in the initial HTML response.",
    ),
  );

  // 2. Heading structure — semantic HTML is a top-three citation factor.
  const headingStatus: CheckStatus = page.h1Count >= 1 ? "pass" : "fail";
  checks.push(
    check(
      "headingStructure",
      "Heading structure",
      headingStatus,
      `${page.h1Count} H1 and ${page.h2Count} H2 heading(s) found in the HTML.`,
      headingStatus === "pass"
        ? null
        : "No H1 appears in the served HTML, so the page has no stated subject for a machine to read. Add one H1, and use H2s to break the content into sections.",
    ),
  );

  // 3. Structured data.
  const ldStatus: CheckStatus = page.jsonLdCount >= 1 ? "pass" : "warn";
  checks.push(
    check(
      "structuredData",
      "Structured data",
      ldStatus,
      page.jsonLdCount === 0
        ? "No JSON-LD blocks found."
        : `${page.jsonLdCount} JSON-LD block(s) found.`,
      ldStatus === "pass"
        ? null
        : "Structured data is one of the strongest signals correlated with being cited by AI assistants. Add JSON-LD covering the page's type, for example Article, Product or FAQPage.",
    ),
  );

  // 4. Title tag.
  const titleStatus: CheckStatus =
    page.titleLength === 0 ? "fail" : page.titleLength >= THRESHOLDS.title.min ? "pass" : "warn";
  checks.push(
    check(
      "title",
      "Title tag",
      titleStatus,
      page.titleLength === 0 ? "No title tag found." : `Title is ${page.titleLength} characters.`,
      titleStatus === "pass"
        ? null
        : "A descriptive title of at least 15 characters gives every crawler a name for the page.",
    ),
  );

  // 5. Freshness — the highest-correlated factor in the citation study.
  const freshStatus: CheckStatus =
    page.hasDateSignal || page.lastModifiedHeader ? "pass" : "warn";
  const freshnessDetail = page.hasDateSignal
    ? "A published or modified date is declared on the page."
    : page.lastModifiedHeader
      ? `No on-page date, but the server sent Last-Modified: ${page.lastModifiedHeader}.`
      : "No published date, modified date or Last-Modified header found.";
  checks.push(
    check(
      "freshness",
      "Freshness signals",
      freshStatus,
      freshnessDetail,
      freshStatus === "pass"
        ? null
        : "Metadata and freshness is the single strongest factor correlated with AI citation. Add datePublished and dateModified to your structured data, or send a Last-Modified header.",
    ),
  );

  // 6. Meta description.
  const descStatus: CheckStatus =
    page.metaDescriptionLength === 0
      ? "fail"
      : page.metaDescriptionLength >= THRESHOLDS.metaDescription.min
        ? "pass"
        : "warn";
  checks.push(
    check(
      "metaDescription",
      "Meta description",
      descStatus,
      page.metaDescriptionLength === 0
        ? "No meta description found."
        : `Meta description is ${page.metaDescriptionLength} characters.`,
      descStatus === "pass"
        ? null
        : "A summary of 50 characters or more gives assistants a ready-made description to quote.",
    ),
  );

  // 7. Text-to-HTML ratio — a low ratio means the content is not in the document.
  const ratio = page.htmlBytes > 0 ? page.textBytes / page.htmlBytes : 0;
  const ratioPct = (ratio * 100).toFixed(1);
  const ratioStatus: CheckStatus =
    ratio >= THRESHOLDS.textRatio.pass
      ? "pass"
      : ratio >= THRESHOLDS.textRatio.fail
        ? "warn"
        : "fail";
  checks.push(
    check(
      "textRatio",
      "Content-to-markup ratio",
      ratioStatus,
      `${ratioPct}% of the HTML is visible text.`,
      ratioStatus === "pass"
        ? null
        : "Almost all of this page is markup and scripts rather than text, which usually means the words are injected at runtime. Move the content into the HTML response.",
    ),
  );

  // 8. Indexability.
  const indexStatus: CheckStatus = page.noindex ? "fail" : "pass";
  checks.push(
    check(
      "indexable",
      "Indexable",
      indexStatus,
      page.noindex ? "A noindex robots tag is present." : "No noindex directive found.",
      indexStatus === "pass"
        ? null
        : "noindex tells crawlers to drop this page. AI assistants follow it too. Remove it if the page should be found.",
    ),
  );

  // 9. AI crawler access via robots.txt.
  const blocked = robots.blockedAgents;
  const accessStatus: CheckStatus =
    blocked.length === 0 ? "pass" : blocked.length <= 2 ? "warn" : "fail";
  const accessDetail = !robots.fetched
    ? "robots.txt could not be fetched, so crawler access could not be checked."
    : blocked.length === 0
      ? "robots.txt does not block any known AI crawler."
      : `robots.txt disallows: ${blocked.join(", ")}.`;
  checks.push(
    check(
      "aiCrawlerAccess",
      "AI crawlers allowed",
      accessStatus,
      accessDetail,
      accessStatus === "pass"
        ? null
        : "You are blocking AI crawlers in robots.txt. That is a legitimate choice, but it means assistants cannot read or cite this page.",
    ),
  );

  // 10. Canonical.
  const canonicalStatus: CheckStatus = page.canonical ? "pass" : "warn";
  checks.push(
    check(
      "canonical",
      "Canonical URL",
      canonicalStatus,
      page.canonical ? `Canonical points to ${page.canonical}.` : "No canonical link element found.",
      canonicalStatus === "pass"
        ? null
        : "Without a canonical URL, a crawler has to guess which address is the real one when the same page is reachable at several URLs.",
    ),
  );

  // 11. Language.
  const langStatus: CheckStatus = page.lang ? "pass" : "warn";
  checks.push(
    check(
      "language",
      "Language declared",
      langStatus,
      page.lang ? `The html element declares lang="${page.lang}".` : "The html element has no lang attribute.",
      langStatus === "pass"
        ? null
        : "Declaring the page language helps assistants pick the right content and serves screen readers too.",
    ),
  );

  const score = checks.reduce((total, c) => total + c.earned, 0);
  const tally = {
    pass: checks.filter((c) => c.status === "pass").length,
    warn: checks.filter((c) => c.status === "warn").length,
    fail: checks.filter((c) => c.status === "fail").length,
  };

  return { score, grade: gradeFor(score), checks, tally, wordCount: page.wordCount };
}
