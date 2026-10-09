import { describe, it, expect, beforeEach } from 'vitest';
import { checkMemoryRateLimit, _resetMemoryRateLimit, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '../rate-limit';

describe('in-memory rate limiter fallback', () => {
  beforeEach(() => _resetMemoryRateLimit());

  it('allows requests up to the limit', () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      expect(checkMemoryRateLimit('ip-a', 1000).success).toBe(true);
    }
  });

  it('blocks the request after the limit is exceeded', () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) checkMemoryRateLimit('ip-a', 1000);
    const res = checkMemoryRateLimit('ip-a', 1000);
    expect(res.success).toBe(false);
    expect(res.remaining).toBe(0);
  });

  it('tracks clients independently', () => {
    for (let i = 0; i <= RATE_LIMIT_MAX; i++) checkMemoryRateLimit('ip-a', 1000);
    expect(checkMemoryRateLimit('ip-b', 1000).success).toBe(true);
  });

  it('resets after the window elapses', () => {
    for (let i = 0; i <= RATE_LIMIT_MAX; i++) checkMemoryRateLimit('ip-a', 1000);
    expect(checkMemoryRateLimit('ip-a', 1000 + RATE_LIMIT_WINDOW_MS + 1).success).toBe(true);
  });
});
