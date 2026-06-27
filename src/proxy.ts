import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge Proxy (formerly Middleware)
 *
 * Runs at the CDN edge (Vercel, Cloudflare, etc.) before the
 * request reaches the origin. Uses the V8-based Edge Runtime
 * for near-zero cold-starts — no full Node.js boot required.
 *
 * Responsibilities:
 *  1. Server-Timing header for performance monitoring
 *  2. Trailing-slash redirect for canonical URLs
 *  3. CDN cache hints for edge-level caching
 */

export const config = {
  // Only run on page routes — skip static assets entirely
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|css|js)).*)",
  ],
};

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // ── Performance: Server-Timing header ──────────────────
  const start = Date.now();
  response.headers.set(
    "Server-Timing",
    `proxy;dur=${Date.now() - start}`
  );

  // ── Canonical: strip trailing slash (except root) ──────
  const { pathname } = request.nextUrl;
  if (pathname !== "/" && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, 308);
  }

  // ── Cache hint for edge CDN ────────────────────────────
  response.headers.set("CDN-Cache-Control", "public, max-age=86400");

  return response;
}
