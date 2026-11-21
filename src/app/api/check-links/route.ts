import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

/* ─────────────────────────────────────────────────────────
 * Broken Link Checker — Edge API Route
 * ─────────────────────────────────────────────────────────
 * 1. Fetches target page HTML, extracts all <a href> links
 * 2. Resolves relative URLs against the page's base
 * 3. Captures the anchor text pointing at each link, so a
 *    broken URL can actually be located on the page
 * 4. Walks each redirect chain hop by hop (max 5 hops)
 * 5. Returns categorized working/broken link arrays
 *
 * Redirect chains are reported rather than flattened: every
 * hop leaks link equity, and two or more hops usually signal
 * a misconfiguration (http→https→www, a stale canonical
 * target, an outdated CMS permalink).
 *
 * Links are checked in concurrent batches to stay within
 * serverless execution time limits.
 * ───────────────────────────────────────────────────────── */

export const runtime = "edge";

/* ── Chain limits ───────────────────────────────────────── */

// Hops followed per link before giving up on walking the chain.
const MAX_REDIRECTS = 5;
// ONE budget shared by every hop of a single link — per-hop budgets would
// multiply to 25s+ per link and blow the edge function limit.
const CHAIN_TIMEOUT_MS = 8000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/* ── Types ──────────────────────────────────────────────── */

interface RedirectHop {
  /** The address that responded with the redirect. */
  url: string;
  /** The 3xx status code it responded with. */
  status: number;
  /** The resolved target of the redirect. */
  location: string;
}

interface LinkResult {
  url: string;
  status: number | null;
  ok: boolean;
  error?: string;
  /** Anchor texts pointing at this URL, in document order, deduped. */
  anchorTexts: string[];
  /** One entry per hop actually followed. Empty when there were none. */
  redirects: RedirectHop[];
  /** redirects.length, for easy display. */
  redirectCount: number;
  /** Present only when redirects were followed and the final address differs. */
  finalUrl?: string;
}

interface LinkEntry {
  url: string;
  anchorTexts: string[];
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

/* ── Helper: one hop, with HEAD→GET fallback ────────────── */

async function fetchHop(url: string, signal: AbortSignal): Promise<Response> {
  try {
    // Try HEAD first (lighter), fall back to GET if HEAD is blocked
    return await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": fetchHeaders["User-Agent"] },
      signal,
      redirect: "manual",
    });
  } catch {
    // Some servers block HEAD — retry with GET
    return await fetch(url, {
      method: "GET",
      headers: { "User-Agent": fetchHeaders["User-Agent"] },
      signal,
      redirect: "manual",
    });
  }
}

/* ── Helper: follow-redirects request (opaque fallback) ─── */

async function fetchFollowing(url: string, signal: AbortSignal): Promise<Response> {
  try {
    return await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": fetchHeaders["User-Agent"] },
      signal,
      redirect: "follow",
    });
  } catch {
    return await fetch(url, {
      method: "GET",
      headers: { "User-Agent": fetchHeaders["User-Agent"] },
      signal,
      redirect: "follow",
    });
  }
}

/* ── Helper: build a terminal (non-redirect) result ─────── */

function buildResult(
  url: string,
  anchorTexts: string[],
  redirects: RedirectHop[],
  status: number,
  finalAddress: string
): LinkResult {
  const result: LinkResult = {
    url,
    status,
    ok: status >= 200 && status < 400,
    anchorTexts,
    redirects,
    redirectCount: redirects.length,
  };

  if (redirects.length > 0 && finalAddress !== url) {
    result.finalUrl = finalAddress;
  }

  return result;
}

/* ── Helper: resolve a link we cannot walk (opaque 3xx) ─── */

// Used when `redirect: "manual"` hands back an opaque response (status 0, no
// readable Location) or when the hop budget runs out. We let the runtime follow
// the chain so we can report the TRUE final status — reporting the 301/302
// itself would mark every redirected link as "broken".
async function resolveFollowing(
  url: string,
  anchorTexts: string[],
  redirects: RedirectHop[],
  signal: AbortSignal
): Promise<LinkResult> {
  const res = await fetchFollowing(url, signal);
  // res.url is the address the runtime actually landed on
  return buildResult(url, anchorTexts, redirects, res.status, res.url || url);
}

/* ── Helper: check a single link ────────────────────────── */

async function checkLink(url: string, anchorTexts: string[]): Promise<LinkResult> {
  // One timeout covers all hops of this link's chain
  const signal = AbortSignal.timeout(CHAIN_TIMEOUT_MS);
  const redirects: RedirectHop[] = [];
  let current = url;

  try {
    for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
      const res = await fetchHop(current, signal);
      const status = res.status;
      const location = res.headers.get("location");
      // 304 is a cache validation response, not a redirect
      const isRedirect = status >= 300 && status < 400 && status !== 304;

      // Readable 3xx with a Location header — record the hop and continue
      if (isRedirect && location) {
        let next: string;
        try {
          next = new URL(location, current).href;
        } catch {
          // Unresolvable Location — fall back to letting the runtime follow
          return await resolveFollowing(url, anchorTexts, redirects, signal);
        }
        redirects.push({ url: current, status, location: next });
        current = next;
        continue;
      }

      // Opaque redirect: status 0 (no readable metadata) or a 3xx with no
      // Location. The chain cannot be walked, so resolve the real final status.
      if (status === 0 || (isRedirect && !location)) {
        return await resolveFollowing(url, anchorTexts, [], signal);
      }

      return buildResult(url, anchorTexts, redirects, status, current);
    }

    // Hop budget exhausted — the chain is longer than we will walk, so let the
    // runtime follow it to a final status while keeping the hops we observed.
    return await resolveFollowing(url, anchorTexts, redirects, signal);
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return {
      url,
      status: null,
      ok: false,
      error: isTimeout ? "Timeout" : "Unreachable",
      anchorTexts,
      redirects,
      redirectCount: redirects.length,
    };
  }
}

/* ── Helper: process links in batches ───────────────────── */

async function checkLinksInBatches(
  links: LinkEntry[],
  batchSize: number = 10
): Promise<LinkResult[]> {
  const results: LinkResult[] = [];

  for (let i = 0; i < links.length; i += batchSize) {
    const batch = links.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((link) => checkLink(link.url, link.anchorTexts))
    );
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
    } catch (err: unknown) {
      const isTimeout = err instanceof Error && err.name === "TimeoutError";
      const msg = isTimeout
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

    // Parse HTML and extract links, keyed by resolved URL so every link on the
    // page can carry the anchor text that points at it
    const html = await response.text();
    const $ = cheerio.load(html);
    const linkMap = new Map<string, Set<string>>();

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

        let texts = linkMap.get(resolved);
        if (!texts) {
          texts = new Set<string>();
          linkMap.set(resolved, texts);
        }

        // Collapse whitespace; image/icon links have no text and record nothing
        const text = $(el).text().replace(/\s+/g, " ").trim();
        if (text) texts.add(text);
      } catch {
        // Skip malformed URLs
      }
    });

    // Cap by unique URL, not by anchor
    const uniqueLinks = Array.from(linkMap.keys());

    // Cap at 50 links to stay within edge function time limits
    const linksToCheck: LinkEntry[] = uniqueLinks.slice(0, 50).map((url) => ({
      url,
      anchorTexts: Array.from(linkMap.get(url) ?? []),
    }));

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
  } catch (error: unknown) {
    console.error("Link checker error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500, headers: corsHeaders }
    );
  }
}
