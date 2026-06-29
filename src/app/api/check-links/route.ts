import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

/* ─────────────────────────────────────────────────────────
 * Broken Link Checker — Edge API Route
 * ─────────────────────────────────────────────────────────
 * 1. Fetches target page HTML, extracts all <a href> links
 * 2. Resolves relative URLs against the page's base
 * 3. Checks each link with a HEAD request (GET fallback)
 * 4. Returns categorized working/broken link arrays
 *
 * Links are checked in concurrent batches to stay within
 * serverless execution time limits.
 * ───────────────────────────────────────────────────────── */

export const runtime = "edge";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/* ── Types ──────────────────────────────────────────────── */

interface LinkResult {
  url: string;
  status: number | null;
  ok: boolean;
  error?: string;
}

/* ── Browser-like fetch headers ─────────────────────────── */

const fetchHeaders: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1",
};

/* ── Helper: check a single link ────────────────────────── */

async function checkLink(url: string): Promise<LinkResult> {
  try {
    // Try HEAD first (lighter), fall back to GET if HEAD is blocked
    let res: Response;
    try {
      res = await fetch(url, {
        method: "HEAD",
        headers: { "User-Agent": fetchHeaders["User-Agent"] },
        signal: AbortSignal.timeout(5000),
        redirect: "follow",
      });
    } catch {
      // Some servers block HEAD — retry with GET
      res = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": fetchHeaders["User-Agent"] },
        signal: AbortSignal.timeout(5000),
        redirect: "follow",
      });
    }

    return {
      url,
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
    };
  } catch (err: any) {
    return {
      url,
      status: null,
      ok: false,
      error: err.name === "TimeoutError" ? "Timeout" : "Unreachable",
    };
  }
}

/* ── Helper: process links in batches ───────────────────── */

async function checkLinksInBatches(
  urls: string[],
  batchSize: number = 10
): Promise<LinkResult[]> {
  const results: LinkResult[] = [];

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(checkLink));
    results.push(...batchResults);
  }

  return results;
}

/* ── Main handler ───────────────────────────────────────── */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const target = body.url;

    if (!target || typeof target !== "string") {
      return NextResponse.json(
        { error: "A valid URL is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse & normalize
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(
        target.startsWith("http") ? target : `https://${target}`
      );
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch the page HTML
    let response: Response;
    try {
      response = await fetch(parsedUrl.href, {
        headers: fetchHeaders,
        signal: AbortSignal.timeout(10000),
        redirect: "follow",
      });
    } catch (err: any) {
      const msg =
        err.name === "TimeoutError"
          ? "The request timed out."
          : "Could not reach the website.";
      return NextResponse.json(
        { error: msg },
        { status: 502, headers: corsHeaders }
      );
    }

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return NextResponse.json(
          { error: `The site blocked our request (HTTP ${response.status}).` },
          { status: 403, headers: corsHeaders }
        );
      }
      return NextResponse.json(
        { error: `Received HTTP ${response.status} from the target site.` },
        { status: response.status, headers: corsHeaders }
      );
    }

    // Parse HTML and extract links
    const html = await response.text();
    const $ = cheerio.load(html);
    const linkSet = new Set<string>();

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href")?.trim();
      if (!href) return;

      // Skip anchors, mailto, tel, javascript
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      // Resolve relative URLs
      try {
        const resolved = new URL(href, parsedUrl.href).href;
        linkSet.add(resolved);
      } catch {
        // Skip malformed URLs
      }
    });

    const uniqueLinks = Array.from(linkSet);

    // Cap at 50 links to stay within edge function time limits
    const linksToCheck = uniqueLinks.slice(0, 50);

    // Check all links in batches of 10
    const results = await checkLinksInBatches(linksToCheck, 10);

    const working = results.filter((r) => r.ok);
    const broken = results.filter((r) => !r.ok);

    return NextResponse.json(
      {
        scannedUrl: parsedUrl.href,
        totalFound: uniqueLinks.length,
        totalChecked: linksToCheck.length,
        working,
        broken,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Link checker error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500, headers: corsHeaders }
    );
  }
}
