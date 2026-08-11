import { describe, it, expect } from 'vitest';

function calculateBasicSeoScore(hasTitle: boolean, hasMetaDesc: boolean, hasH1: boolean): number {
  let score = 0;
  if (hasTitle) score += 40;
  if (hasMetaDesc) score += 35;
  if (hasH1) score += 25;
  return score;
}

describe('SEO Analyzer Helper Unit Tests', () => {
  it('should calculate 100% score when title, meta description, and H1 are present', () => {
    const score = calculateBasicSeoScore(true, true, true);
    expect(score).toBe(100);
  });

  it('should calculate partial score when meta description is missing', () => {
    const score = calculateBasicSeoScore(true, false, true);
    expect(score).toBe(65);
  });

  it('should return 0 when all critical SEO elements are missing', () => {
    const score = calculateBasicSeoScore(false, false, false);
    expect(score).toBe(0);
  });
});
