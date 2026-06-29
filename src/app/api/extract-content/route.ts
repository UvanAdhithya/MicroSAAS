import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

/* ─────────────────────────────────────────────────────────
 * Content Extractor — Edge API Route
 * ─────────────────────────────────────────────────────────
 * Fetches a target URL, extracts the document outline
 * (title + all H1/H2/H3 tags in DOM order) and calculates
 * a rough word count from the body text.
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

interface HeadingNode {
  /** The heading level: 1, 2, or 3 */
  level: number;
  /** The text content of the heading */
  text: string;
}

interface ContentResult {
  url: string;
  title: string | null;
  headings: HeadingNode[];
  wordCount: number;
}

/* ── Browser-like headers ───────────────────────────────── */

const fetchHeaders: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

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

    // Fetch the page
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

    // Parse HTML
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = $("title").first().text().trim() || null;

    // Extract headings in DOM order
    // cheerio preserves DOM order when selecting multiple selectors
    const headings: HeadingNode[] = [];
    $("h1, h2, h3").each((_, el) => {
      const tagName = (el as cheerio.TagElement).tagName.toLowerCase();
      const level = parseInt(tagName.replace("h", ""), 10);
      const text = $(el).text().trim();
      if (text && headings.length < 100) {
        headings.push({ level, text });
      }
    });

    // Calculate word count from body text
    // Strip all tags, normalize whitespace, split by spaces
    const bodyText = $("body").text() || "";
    const cleanedText = bodyText
      .replace(/\s+/g, " ")
      .trim();
    const wordCount = cleanedText ? cleanedText.split(" ").length : 0;

    const result: ContentResult = {
      url: parsedUrl.href,
      title,
      headings,
      wordCount,
    };

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Content extraction error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500, headers: corsHeaders }
    );
  }
}
