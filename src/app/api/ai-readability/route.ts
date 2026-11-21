import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import {
  AI_CRAWLER_AGENTS,
  evaluateAiReadability,
  type PageSignals,
  type RobotsSignals,
} from "@/lib/ai-readability";

/* ─────────────────────────────────────────────────────────
 * AI Readability — Edge API Route
 * ─────────────────────────────────────────────────────────
 * Accepts a POST request with { url: string } and reports what
 * a NON-JavaScript crawler sees in the served HTML.
 *
 * This is the document ChatGPT, Perplexity, Claude and Bing
 * actually receive: their crawlers do not execute JavaScript,
 * so a client-rendered page is effectively empty to them.
 * Googlebot may render it in a second pass; these crawlers
 * never do. The route therefore measures only what is present
 * in the initial HTML response — word count, headings, title,
 * meta description, structured data, dates, canonical, lang,
 * noindex and robots.txt access — and hands the raw signals to
 * the pure scoring model in @/lib/ai-readability.
 *
 * Runs on the V8 Edge Runtime for instant cold-starts and
 * global low-latency on Vercel's edge network.
 * ───────────────────────────────────────────────────────── */

export const runtime = "edge";

/** Standard CORS headers for cross-origin access */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** Preflight handler for CORS */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/* ── robots.txt parsing ─────────────────────────────────── */

/**
 * Parse a robots.txt body and return the AI crawler tokens that
 * are explicitly disallowed from the site root.
 *
 * Rules applied:
 *  - Only agents named in their own `User-agent:` group count.
 *    A `User-agent: *` group with `Disallow: /` is a blanket
 *    block, not a named one, and is deliberately not reported.
 *  - Only a rule that disallows the site root (`Disallow: /`)
 *    counts. A bare `Disallow:` has no value and means allow-all.
 *  - Agent names are matched case-insensitively against
 *    AI_CRAWLER_AGENTS and reported once, in that list's order.
 */
function parseRobots(robotsTxt: string): string[] {
  const blocked = new Set<string>();
  // The literal spelling of each agent that was named in a group.
  const named = new Set<string>();

  let currentAgents: string[] = [];
  let sawUserAgentLine = false;

  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    // A blank line ends the current group of User-agent lines.
    if (rawLine.trim() === "") {
      currentAgents = [];
      sawUserAgentLine = false;
      continue;
    }

    // Strip comments and surrounding whitespace.
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue; // comment-only line

    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      if (!sawUserAgentLine) {
        // Starting a fresh group.
        currentAgents = [];
      }
      sawUserAgentLine = true;
      if (value) currentAgents.push(value);
      continue;
    }

    // Any other directive ends the run of User-agent lines.
    sawUserAgentLine = false;

    if (field === "disallow" && value === "/") {
      for (const agent of currentAgents) {
        if (agent !== "*") named.add(agent);
      }
    }
  }

  // Match named agents case-insensitively, preserving our canonical order.
  for (const known of AI_CRAWLER_AGENTS) {
    const lower = known.toLowerCase();
    for (const agent of named) {
      if (agent.toLowerCase() === lower) {
        blocked.add(known);
        break;
      }
    }
  }

  return [...blocked];
}

/* ── Main handler ───────────────────────────────────────── */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const target = body.url;

    // ── Validate input ──
    if (!target || typeof target !== "string") {
      return NextResponse.json(
        { error: "A valid URL is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // ── Parse & normalize the URL ──
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(target.startsWith("http") ? target : `https://${target}`);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format. Please include the full domain." },
        { status: 400, headers: corsHeaders }
      );
    }

    // ── Fetch the page HTML ──
    // Use a full set of modern Chrome headers to bypass WAFs (Cloudflare, etc.)
    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Sec-Ch-Ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": "\"Windows\"",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    };

    let response: Response;
    try {
      response = await fetch(parsedUrl.href, {
        headers: fetchHeaders,
        signal: AbortSignal.timeout(10000), // 10 second timeout
        redirect: "follow",
      });
    } catch (err: unknown) {
      // Timeout or network error
      const isTimeout = err instanceof Error && err.name === "TimeoutError";
      const msg = isTimeout
        ? "The request timed out. The site may be slow or blocking crawlers."
        : "Could not reach the website. Please check the URL and try again.";
      return NextResponse.json({ error: msg }, { status: 502, headers: corsHeaders });
    }

    // ── Handle HTTP error responses ──
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return NextResponse.json(
          {
            error: `The site blocked our request (HTTP ${response.status}). Try a different URL.`,
          },
          { status: 403, headers: corsHeaders }
        );
      }
      return NextResponse.json(
        { error: `Received HTTP ${response.status} from the target site.` },
        { status: response.status, headers: corsHeaders }
      );
    }

    // ── Parse the HTML with Cheerio ──
    const html = await response.text();
    const $ = cheerio.load(html);
    const encoder = new TextEncoder();

    // Headings.
    const h1Count = $("h1").length;
    const h2Count = $("h2").length;
    const h3Count = $("h3").length;

    // Title and meta description.
    const titleText = $("title").first().text().trim();
    const titleLength = titleText.length;
    const metaDescriptionLength =
      $('meta[name="description"]').first().attr("content")?.trim().length ?? 0;

    // Structured data.
    const jsonLdBlocks = $('script[type="application/ld+json"]');
    const jsonLdCount = jsonLdBlocks.length;

    // Freshness: JSON-LD date keys, article meta tags, or a <time datetime>.
    let hasDateSignal = false;
    jsonLdBlocks.each((_, el) => {
      const text = $(el).text();
      if (
        text.includes("datePublished") ||
        text.includes("dateModified") ||
        text.includes("uploadDate")
      ) {
        hasDateSignal = true;
      }
    });
    if (
      !hasDateSignal &&
      ($('meta[property="article:published_time"]').length > 0 ||
        $('meta[property="article:modified_time"]').length > 0 ||
        $('meta[name="date"]').length > 0 ||
        $("time[datetime]").length > 0)
    ) {
      hasDateSignal = true;
    }

    // Canonical and language.
    const canonical = $('link[rel="canonical"]').first().attr("href")?.trim() || null;
    const lang = $("html").attr("lang") || null;

    // noindex.
    let noindex = false;
    $('meta[name="robots"]').each((_, el) => {
      const content = $(el).attr("content");
      if (content && content.toLowerCase().includes("noindex")) noindex = true;
    });

    // Body text — measured from the served HTML only. Remove the
    // elements whose text is not page copy before reading the body.
    $("script, style, noscript").remove();
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const words = bodyText.length === 0 ? [] : bodyText.split(" ");
    const wordCount = words.length;
    const textBytes = encoder.encode(bodyText).length;

    const page: PageSignals = {
      wordCount,
      h1Count,
      h2Count,
      h3Count,
      titleLength,
      metaDescriptionLength,
      jsonLdCount,
      hasDateSignal,
      lastModifiedHeader: response.headers.get("last-modified") || null,
      textBytes,
      htmlBytes: encoder.encode(html).length,
      canonical,
      lang,
      noindex,
    };

    // ── robots.txt — never allowed to fail the whole request ──
    const robots: RobotsSignals = { fetched: false, blockedAgents: [] };
    try {
      const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;
      const robotsResponse = await fetch(robotsUrl, {
        headers: fetchHeaders,
        signal: AbortSignal.timeout(5000), // 5 second timeout
        redirect: "follow",
      });

      if (robotsResponse.ok) {
        const robotsTxt = await robotsResponse.text();
        robots.fetched = true;
        robots.blockedAgents = parseRobots(robotsTxt);
      }
    } catch (err: unknown) {
      console.error("robots.txt fetch failed:", err);
    }

    // ── Score ──
    const report = evaluateAiReadability({ page, robots });

    return NextResponse.json(
      {
        url: parsedUrl.href,
        score: report.score,
        grade: report.grade,
        checks: report.checks,
        tally: report.tally,
        wordCount: report.wordCount,
      },
      { headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("AI readability error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500, headers: corsHeaders }
    );
  }
}
