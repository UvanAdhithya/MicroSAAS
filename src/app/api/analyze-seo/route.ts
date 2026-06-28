import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

/* ─────────────────────────────────────────────────────────
 * SEO Analyzer — Edge API Route
 * ─────────────────────────────────────────────────────────
 * Accepts a POST request with { url: string }, fetches the
 * target page's HTML, and uses Cheerio to extract all major
 * SEO-relevant metadata in a single pass.
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

/* ── Response interfaces ────────────────────────────────── */

interface SeoResult {
  /** The final URL after any redirects */
  url: string;
  /** Contents of the <title> tag */
  title: string | null;
  /** Contents of <meta name="description"> */
  metaDescription: string | null;
  /** OpenGraph metadata */
  og: {
    title: string | null;
    description: string | null;
    image: string | null;
    type: string | null;
    url: string | null;
  };
  /** Twitter Card metadata */
  twitter: {
    card: string | null;
    title: string | null;
    description: string | null;
  };
  /** All <h1> text contents */
  h1Tags: string[];
  /** All <h2> text contents */
  h2Tags: string[];
  /** Canonical URL from <link rel="canonical"> */
  canonical: string | null;
  /** Favicon URL */
  favicon: string | null;
  /** Language attribute from <html lang="..."> */
  language: string | null;
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
      parsedUrl = new URL(
        target.startsWith("http") ? target : `https://${target}`
      );
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format. Please include the full domain." },
        { status: 400, headers: corsHeaders }
      );
    }

    // ── Fetch the page HTML ──
    // Use a realistic browser User-Agent to avoid basic bot detection.
    const fetchHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    };

    let response: Response;
    try {
      response = await fetch(parsedUrl.href, {
        headers: fetchHeaders,
        signal: AbortSignal.timeout(10000), // 10 second timeout
        redirect: "follow",
      });
    } catch (err: any) {
      // Timeout or network error
      const msg = err.name === "TimeoutError"
        ? "The request timed out. The site may be slow or blocking crawlers."
        : "Could not reach the website. Please check the URL and try again.";
      return NextResponse.json(
        { error: msg },
        { status: 502, headers: corsHeaders }
      );
    }

    // ── Handle HTTP error responses ──
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return NextResponse.json(
          { error: `The site blocked our request (HTTP ${response.status}). Try a different URL.` },
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

    // Helper: safely get the content attribute of a meta tag
    const meta = (name: string): string | null =>
      $(`meta[name="${name}"]`).attr("content") ||
      $(`meta[property="${name}"]`).attr("content") ||
      null;

    // ── Extract all SEO data ──
    const title = $("title").first().text().trim() || null;
    const metaDescription = meta("description");

    // OpenGraph tags
    const og = {
      title: meta("og:title"),
      description: meta("og:description"),
      image: meta("og:image"),
      type: meta("og:type"),
      url: meta("og:url"),
    };

    // Twitter Card tags
    const twitter = {
      card: meta("twitter:card"),
      title: meta("twitter:title"),
      description: meta("twitter:description"),
    };

    // Heading tags — limit to first 20 of each to prevent abuse
    const h1Tags: string[] = [];
    $("h1").each((i, el) => {
      if (i < 20) {
        const text = $(el).text().trim();
        if (text) h1Tags.push(text);
      }
    });

    const h2Tags: string[] = [];
    $("h2").each((i, el) => {
      if (i < 20) {
        const text = $(el).text().trim();
        if (text) h2Tags.push(text);
      }
    });

    // Canonical URL
    const canonical = $('link[rel="canonical"]').attr("href") || null;

    // Favicon — check multiple common locations
    const favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      "/favicon.ico";

    // Language
    const language = $("html").attr("lang") || null;

    // ── Build the response ──
    const result: SeoResult = {
      url: parsedUrl.href,
      title,
      metaDescription,
      og,
      twitter,
      h1Tags,
      h2Tags,
      canonical,
      favicon,
      language,
    };

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error: any) {
    console.error("SEO analysis error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during analysis." },
      { status: 500, headers: corsHeaders }
    );
  }
}
