import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "DevTools Hub — Free Developer Micro-Tools",
    template: "%s | DevTools Hub",
  },
  description:
    "A curated collection of free, fast, privacy-first developer micro-tools. JSON formatter, Base64 encoder, UUID generator, regex tester, and more — all in your browser.",
  keywords: [
    "developer tools",
    "micro tools",
    "JSON formatter",
    "Base64 encoder",
    "UUID generator",
    "regex tester",
    "free tools",
    "web developer",
  ],
  authors: [{ name: "DevTools Hub" }],
  creator: "DevTools Hub",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DevTools Hub",
    title: "DevTools Hub — Free Developer Micro-Tools",
    description:
      "A curated collection of free, fast, privacy-first developer micro-tools.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevTools Hub — Free Developer Micro-Tools",
    description:
      "A curated collection of free, fast, privacy-first developer micro-tools.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>

        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-border-primary bg-bg-primary/80 backdrop-blur-xl">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            {/* Logo */}
            <a
              href="/"
              className="group flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-80"
              id="nav-logo"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-mono text-sm font-bold shadow-sm">
                {"</>"}
              </div>
              <span className="text-lg font-semibold tracking-tight text-fg-primary">
                DevTools
                <span className="text-accent">{" Hub"}</span>
              </span>
            </a>

            {/* Nav Actions */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-tertiary transition-colors duration-150 hover:bg-bg-subtle hover:text-fg-primary"
                aria-label="GitHub"
                id="nav-github"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border-primary bg-bg-primary">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
            <p className="text-sm text-fg-muted">
              © {new Date().getFullYear()} DevTools Hub. Free & open source.
            </p>
            <div className="flex items-center gap-1 text-sm text-fg-muted">
              <span>Built with</span>
              <svg
                className="mx-0.5 h-3.5 w-3.5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span>for developers</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
