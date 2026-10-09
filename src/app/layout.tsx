import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "./site-chrome";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { template: "%s — SEOSnap", default: "SEOSnap — Free SEO audit & website analysis tools" },
  description: "SEOSnap: free SEO analyzer, broken link checker, sitemap extractor, content extractor and instant SEO reports for any website.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.seosnap.xyz"),
  openGraph: { type: "website", siteName: "SEOSnap" },
  robots: { index: true, follow: true },
  verification: { google: "c8NVcS7u1cw86D3xvzzAzknlPPjb4zUZJa-9jXO2cic" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F10" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable}`} style={{ fontFamily: "var(--sans)" }} suppressHydrationWarning>
        <a href="#main" className="skip-nav">Skip to content</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
