import * as cheerio from "cheerio";

async function run() {
  const domainUrl = "https://sitegpt.ai";
  let sitemapUrls = [];
  const fetchHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  };

  try {
    const robotsRes = await fetch(`${domainUrl}/robots.txt`, { headers: fetchHeaders });
    if (robotsRes.ok) {
      const robotsText = await robotsRes.text();
      const lines = robotsText.split("\n");
      for (const line of lines) {
        if (line.toLowerCase().startsWith("sitemap:")) {
          const smUrl = line.split(":", 2)[1]?.trim();
          if (smUrl) {
             const fullSmUrl = smUrl.startsWith("http") ? smUrl : `${domainUrl}${smUrl.startsWith("/") ? "" : "/"}${smUrl}`;
             sitemapUrls.push(fullSmUrl);
          }
        }
      }
    }
  } catch (e) { console.warn(e); }

  console.log("Found sitemaps in robots:", sitemapUrls);
  if (sitemapUrls.length === 0) sitemapUrls.push(`${domainUrl}/sitemap.xml`);

  let fetchErrors = 0;
  const extractedUrls = [];

  for (const smUrl of sitemapUrls.slice(0, 3)) {
    console.log("Fetching sitemap:", smUrl);
    try {
      const smRes = await fetch(smUrl, { headers: fetchHeaders });
      if (!smRes.ok) {
        console.log("smRes not ok:", smRes.status);
        fetchErrors++;
        continue;
      }
      const xmlText = await smRes.text();
      const $ = cheerio.load(xmlText, { xmlMode: true });
      $("url").each((_, el) => {
        const loc = $(el).find("loc").text().trim();
        if (loc) extractedUrls.push(loc);
      });
      $("sitemap").each((_, el) => {
        const loc = $(el).find("loc").text().trim();
        if (loc) extractedUrls.push(loc);
      });
    } catch (e) {
      console.log("Fetch error:", e.message);
      fetchErrors++;
    }
  }

  console.log("Extracted:", extractedUrls.length);
  console.log("Errors:", fetchErrors);
}
run();
