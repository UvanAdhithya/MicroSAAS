import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
    analytics: true,
    prefix: '@upstash/ratelimit',
  });
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  if (!ratelimit) {
    // Graceful fallback for local development without Upstash Redis configured
    return { success: true, limit: 100, remaining: 100, reset: 0 };
  }

  const result = await ratelimit.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
