import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Configuration for the edge API
export const runtime = "edge";
// Next.js handles CORS for same-origin if called from the frontend,
// but let's add CORS headers just in case we want to expose it.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface ExtractedUrl {
  url: string;
  lastmod?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const target = body.url;

    if (!target) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(target.startsWith("http") ? target : `https://${target}`);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400, headers: corsHeaders }
      );
    }

    const domainUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
    let sitemapUrls: string[] = [];

    const fetchHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    };

    // 1. Try to find sitemap in robots.txt
    try {
      const robotsRes = await fetch(`${domainUrl}/robots.txt`, {
        headers: fetchHeaders,
        signal: AbortSignal.timeout(5000),
      });

      if (robotsRes.ok) {
        const robotsText = await robotsRes.text();
        const lines = robotsText.split("\n");
        for (const line of lines) {
          if (line.toLowerCase().startsWith("sitemap:")) {
            const smUrl = line.substring(8).trim();
            if (smUrl) {
               // handle cases where sitemap url is valid, might have http(s) prepended
               const fullSmUrl = smUrl.startsWith("http") ? smUrl : `${domainUrl}${smUrl.startsWith("/") ? "" : "/"}${smUrl}`;
               sitemapUrls.push(fullSmUrl);
            }
          }
        }
      }
    } catch (e) {
      // Ignore robots.txt errors and fallback
      console.warn("Failed to fetch robots.txt", e);
    }

    // 2. Fallback to /sitemap.xml if no sitemaps found in robots.txt
    if (sitemapUrls.length === 0) {
      sitemapUrls.push(`${domainUrl}/sitemap.xml`);
    }

    // Remove duplicates
    sitemapUrls = Array.from(new Set(sitemapUrls));

    const extractedUrls: ExtractedUrl[] = [];
    let fetchErrors = 0;

    // 3. Fetch and parse sitemaps (limit to first 3 to prevent abuse/timeouts)
    for (const smUrl of sitemapUrls.slice(0, 3)) {
      try {
        const smRes = await fetch(smUrl, {
          headers: fetchHeaders,
          signal: AbortSignal.timeout(10000),
        });

        if (!smRes.ok) {
          if (smRes.status === 403 || smRes.status === 401) {
             throw new Error(`Target site blocked the crawler (HTTP ${smRes.status})`);
          }
          fetchErrors++;
          continue;
        }

        const xmlText = await smRes.text();
        // Use cheerio with xml mode
        const $ = cheerio.load(xmlText, { xmlMode: true });

        // A sitemap can be a sitemapindex (pointing to other sitemaps) or a urlset
        // For simplicity and speed in this serverless function, we just extract all <loc> tags.
        // If it's a sitemap index, the locs are just other sitemaps, but returning them is still useful.
        
        $("url").each((_, el) => {
          const loc = $(el).find("loc").text().trim();
          const lastmod = $(el).find("lastmod").text().trim();
          if (loc) {
            extractedUrls.push({ url: loc, lastmod: lastmod || undefined });
          }
        });
        
        // If it was a sitemapindex, extract those too just so the user sees them
        $("sitemap").each((_, el) => {
          const loc = $(el).find("loc").text().trim();
          const lastmod = $(el).find("lastmod").text().trim();
          if (loc) {
             // Prefix with [Sitemap] to distinguish
             extractedUrls.push({ url: loc, lastmod: lastmod || undefined });
          }
        });

      } catch (e: any) {
        if (e.message.includes("blocked")) {
          return NextResponse.json(
            { error: e.message },
            { status: 403, headers: corsHeaders }
          );
        }
        fetchErrors++;
        console.warn(`Failed to fetch sitemap ${smUrl}:`, e);
      }
    }

    if (extractedUrls.length === 0) {
       let msg = "No URLs found in the sitemap.";
       if (fetchErrors > 0) {
           msg = "Failed to fetch sitemaps. The site might be blocking crawlers or the sitemap doesn't exist at the default location.";
       }
       return NextResponse.json(
          { error: msg },
          { status: 404, headers: corsHeaders }
       );
    }

    return NextResponse.json({ urls: extractedUrls }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Sitemap extraction error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while parsing the sitemap." },
      { status: 500, headers: corsHeaders }
    );
  }
}
