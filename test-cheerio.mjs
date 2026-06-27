import * as cheerio from "cheerio";

const xmlText = `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="//sitegpt.ai/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://sitegpt.ai/sitemap-pages.xml</loc>
  </sitemap>
  <url>
    <loc>https://test.com</loc>
  </url>
</sitemapindex>`;

const $ = cheerio.load(xmlText, { xmlMode: true });

console.log("url count:", $("url").length);
console.log("sitemap count:", $("sitemap").length);

$("sitemap").each((_, el) => {
  const loc = $(el).find("loc").text().trim();
  console.log("loc:", loc);
});
