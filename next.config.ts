import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Standalone output ──────────────────────────────────
  // Produces a minimal self-contained build (~100 MB smaller)
  // that can run without node_modules — ideal for Docker,
  // Vercel, Cloudflare, AWS Lambda, or any serverless target.
  output: "standalone",

  // ── React strict mode ──────────────────────────────────
  reactStrictMode: true,

  // ── Powered-by header ──────────────────────────────────
  // Remove the X-Powered-By: Next.js header to reduce
  // fingerprinting surface and save a few bytes per response.
  poweredByHeader: false,

  // ── Compression ────────────────────────────────────────
  // Disable built-in gzip: edge/CDN providers (Vercel,
  // Cloudflare, AWS) handle Brotli/gzip at the edge faster
  // than Node can. Avoids double-compression overhead.
  compress: false,

  // ── Image optimization ─────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,          // 1 year cache
    deviceSizes: [640, 750, 828, 1080, 1200], // Trimmed breakpoints
    imageSizes: [16, 32, 48, 64, 96],
  },

  // ── Experimental edge features ─────────────────────────
  experimental: {
    // Enable CSS-in-JS optimizations for faster SSR
    optimizeCss: false, // Enable when critters is installed
  },

  // ── Security & caching headers ─────────────────────────
  async headers() {
    return [
      // Global security headers
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // Immutable static assets — 1 year cache, edge-friendly
      {
        source: "/(.*)\\.(js|css|woff2?|svg|png|jpg|webp|avif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },


      // HTML pages — stale-while-revalidate for edge freshness
      {
        source: "/((?!_next|api).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
