import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const RATE_LIMIT_MAX = 20; // requests
export const RATE_LIMIT_WINDOW_MS = 60_000; // per minute

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, '1 m'), // 20 requests per minute
    analytics: true,
    prefix: 'seosnap:ratelimit',
  });
}

export interface RateLimitResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
}

/**
 * Best-effort in-memory fixed-window limiter, used when Upstash isn't configured.
 * Per-instance only (serverless instances don't share memory), but still stops
 * a single client from hammering one warm instance.
 */
const memoryHits = new Map<string, { count: number; reset: number }>();

export function checkMemoryRateLimit(identifier: string, now = Date.now()): RateLimitResult {
  if (memoryHits.size > 10_000) {
    for (const [k, v] of memoryHits) if (v.reset <= now) memoryHits.delete(k);
  }
  const entry = memoryHits.get(identifier);
  if (!entry || entry.reset <= now) {
    memoryHits.set(identifier, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return { success: true, limit: RATE_LIMIT_MAX, remaining: RATE_LIMIT_MAX - 1, reset: now + RATE_LIMIT_WINDOW_MS };
  }
  entry.count += 1;
  return {
    success: entry.count <= RATE_LIMIT_MAX,
    limit: RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - entry.count),
    reset: entry.reset,
  };
}

export function _resetMemoryRateLimit() {
  memoryHits.clear();
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  if (!ratelimit) {
    // Local dev: unlimited. Production without Upstash: in-memory fallback.
    if (process.env.NODE_ENV !== 'production') {
      return { success: true, limit: 100, remaining: 100, reset: 0 };
    }
    return checkMemoryRateLimit(identifier);
  }

  try {
    const result = await ratelimit.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // Fail open on Redis outage so the site stays usable, but keep a local guard.
    console.error('Rate limiter error, falling back to memory:', error);
    return checkMemoryRateLimit(identifier);
  }
}
