import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Edge Proxy (formerly Middleware)
 *
 * Runs before the request reaches the route handler / page.
 *
 * Responsibilities:
 *  1. Rate limiting for /api/* (Upstash Redis, per client IP)
 *  2. Supabase session refresh (keeps auth cookies fresh)
 *  3. Protecting /dashboard (redirect to /login when signed out)
 *  4. Server-Timing header for performance monitoring
 *  5. Trailing-slash redirect for canonical URLs
 *  6. CDN cache hints for public marketing/tool pages
 */

export const config = {
  // Only run on page routes — skip static assets entirely
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|css|js)).*)",
  ],
};

// Paths that are user-specific and must never be cached at the CDN
const PRIVATE_PREFIXES = ["/api", "/login", "/signup", "/dashboard"];
// API paths exempt from rate limiting
const RATE_LIMIT_EXEMPT = ["/api/health"];

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
}

export async function proxy(request: NextRequest) {
  const start = Date.now();
  const { pathname } = request.nextUrl;

  // ── Canonical: strip trailing slash (except root) ──────
  if (pathname !== "/" && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, 308);
  }

  // ── Rate limiting for API routes ───────────────────────
  if (
    pathname.startsWith("/api/") &&
    request.method !== "OPTIONS" &&
    !RATE_LIMIT_EXEMPT.some((p) => pathname.startsWith(p))
  ) {
    const rl = await checkRateLimit(`api:${getClientIp(request)}`);
    if (!rl.success) {
      const retryAfter = rl.reset ? Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000)) : 60;
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(rl.limit ?? ""),
            "X-RateLimit-Remaining": "0",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }

  let response = NextResponse.next({ request });

  // ── Supabase session refresh (skip for API to save latency) ──
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey && !pathname.startsWith("/api/")) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    // ── Protect dashboard ─────────────────────────────────
    if (!user && pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Performance: Server-Timing header ──────────────────
  response.headers.set("Server-Timing", `proxy;dur=${Date.now() - start}`);

  // ── Cache hint for edge CDN (public pages only) ────────
  if (PRIVATE_PREFIXES.some((p) => pathname.startsWith(p))) {
    response.headers.set("Cache-Control", "private, no-store");
  } else {
    response.headers.set("CDN-Cache-Control", "public, max-age=86400");
  }

  return response;
}
