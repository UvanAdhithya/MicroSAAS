import { describe, it, expect } from 'vitest';
import {
  evaluateAiReadability,
  gradeFor,
  AI_CRAWLER_AGENTS,
  THRESHOLDS,
  type AiReadabilityReport,
  type CheckId,
  type CheckStatus,
  type PageSignals,
  type RobotsSignals,
} from '../ai-readability';

/* ── Fixtures ───────────────────────────────────────────── */

/**
 * A page that satisfies every check, so it must score exactly 100.
 * `textBytes / htmlBytes` = 0.2, comfortably above the textRatio pass line.
 */
const perfectPage: PageSignals = {
  wordCount: THRESHOLDS.words.pass,
  h1Count: 1,
  h2Count: 3,
  h3Count: 2,
  titleLength: 60,
  metaDescriptionLength: 155,
  jsonLdCount: 2,
  hasDateSignal: true,
  lastModifiedHeader: null,
  textBytes: 2000,
  htmlBytes: 10000,
  canonical: 'https://example.com/article',
  lang: 'en',
  noindex: false,
};

const cleanRobots: RobotsSignals = { fetched: true, blockedAgents: [] };

/** A page that satisfies nothing. */
const worstPage: PageSignals = {
  wordCount: 0,
  h1Count: 0,
  h2Count: 0,
  h3Count: 0,
  titleLength: 0,
  metaDescriptionLength: 0,
  jsonLdCount: 0,
  hasDateSignal: false,
  lastModifiedHeader: null,
  textBytes: 0,
  htmlBytes: 0,
  canonical: null,
  lang: null,
  noindex: true,
};

const worstRobots: RobotsSignals = {
  fetched: true,
  blockedAgents: ['GPTBot', 'ClaudeBot', 'PerplexityBot'],
};

const ALL_CHECK_IDS: CheckId[] = [
  'contentInHtml',
  'headingStructure',
  'title',
  'metaDescription',
  'structuredData',
  'freshness',
  'textRatio',
  'indexable',
  'aiCrawlerAccess',
  'canonical',
  'language',
];

/** Evaluate a page derived from `perfectPage` with field overrides. */
function evaluate(
  pageOverrides: Partial<PageSignals> = {},
  robots: RobotsSignals = cleanRobots,
): AiReadabilityReport {
  return evaluateAiReadability({ page: { ...perfectPage, ...pageOverrides }, robots });
}

/** Status of one named check in a report. */
function statusOf(report: AiReadabilityReport, id: CheckId): CheckStatus {
  const found = report.checks.find((c) => c.id === id);
  if (!found) throw new Error(`No check with id "${id}" in report`);
  return found.status;
}

/** The full check object for one id. */
function checkOf(report: AiReadabilityReport, id: CheckId) {
  const found = report.checks.find((c) => c.id === id);
  if (!found) throw new Error(`No check with id "${id}" in report`);
  return found;
}

/* ── 1. Weights sum to 100 ──────────────────────────────── */

describe('score ceiling', () => {
  it('a page passing every check scores exactly 100 with grade "excellent"', () => {
    const report = evaluate();
    expect(report.checks.every((c) => c.status === 'pass')).toBe(true);
    expect(report.score).toBe(100);
    expect(report.grade).toBe('excellent');
  });

  it('the highest-scoring award per check id sums to 100', () => {
    // The perfect page awards full weight on every check, so summing the
    // full weight observed for each id proves the weights total 100.
    const report = evaluate();
    const byId = new Map(report.checks.map((c) => [c.id, c]));
    const total = ALL_CHECK_IDS.reduce((sum, id) => sum + checkOf(report, id).weight, 0);
    expect(byId.size).toBe(ALL_CHECK_IDS.length);
    expect(total).toBe(100);
  });
});

/* ── 2. Every check is representable ────────────────────── */

describe('check coverage', () => {
  it('reports all eleven check ids exactly once', () => {
    const report = evaluate();
    const ids = report.checks.map((c) => c.id);
    expect(ids).toHaveLength(11);
    for (const id of ALL_CHECK_IDS) {
      expect(ids.filter((x) => x === id)).toHaveLength(1);
    }
  });

  it('never awards more than a check is worth', () => {
    for (const report of [evaluate(), evaluateAiReadability({ page: worstPage, robots: worstRobots })]) {
      for (const c of report.checks) {
        expect(c.earned).toBeGreaterThanOrEqual(0);
        expect(c.earned).toBeLessThanOrEqual(c.weight);
      }
    }
  });
});

/* ── 3. Per-check boundaries ────────────────────────────── */

describe('contentInHtml boundaries', () => {
  const { fail, pass } = THRESHOLDS.words;

  it('0 words fails', () => {
    expect(statusOf(evaluate({ wordCount: 0 }), 'contentInHtml')).toBe('fail');
  });

  it('one word below the fail threshold fails', () => {
    expect(statusOf(evaluate({ wordCount: fail - 1 }), 'contentInHtml')).toBe('fail');
  });

  it('exactly at the fail threshold warns', () => {
    expect(statusOf(evaluate({ wordCount: fail }), 'contentInHtml')).toBe('warn');
  });

  it('one word below the pass threshold warns', () => {
    expect(statusOf(evaluate({ wordCount: pass - 1 }), 'contentInHtml')).toBe('warn');
  });

  it('exactly at the pass threshold passes', () => {
    expect(statusOf(evaluate({ wordCount: pass }), 'contentInHtml')).toBe('pass');
  });
});

describe('textRatio boundaries', () => {
  // 10,000 bytes keeps every threshold a whole number of bytes.
  const htmlBytes = 10_000;
  const { fail, pass } = THRESHOLDS.textRatio;
  const failBytes = Math.round(fail * htmlBytes);
  const passBytes = Math.round(pass * htmlBytes);

  it('a document with no text fails', () => {
    expect(statusOf(evaluate({ htmlBytes, textBytes: 0 }), 'textRatio')).toBe('fail');
  });

  it('a ratio just below the fail threshold fails', () => {
    expect(statusOf(evaluate({ htmlBytes, textBytes: failBytes - 1 }), 'textRatio')).toBe('fail');
  });

  it('a ratio exactly at the fail threshold warns', () => {
    expect(statusOf(evaluate({ htmlBytes, textBytes: failBytes }), 'textRatio')).toBe('warn');
  });

  it('a ratio between fail and pass warns', () => {
    const textBytes = Math.round(((fail + pass) / 2) * htmlBytes);
    expect(statusOf(evaluate({ htmlBytes, textBytes }), 'textRatio')).toBe('warn');
  });

  it('a ratio just below the pass threshold warns', () => {
    expect(statusOf(evaluate({ htmlBytes, textBytes: passBytes - 1 }), 'textRatio')).toBe('warn');
  });

  it('a ratio exactly at the pass threshold passes', () => {
    expect(statusOf(evaluate({ htmlBytes, textBytes: passBytes }), 'textRatio')).toBe('pass');
  });

  it('a ratio well above the pass threshold passes', () => {
    expect(statusOf(evaluate({ htmlBytes, textBytes: passBytes * 3 }), 'textRatio')).toBe('pass');
  });
});

describe('title boundaries', () => {
  const min = THRESHOLDS.title.min;

  it('a missing title fails', () => {
    expect(statusOf(evaluate({ titleLength: 0 }), 'title')).toBe('fail');
  });

  it('a title below the minimum warns', () => {
    expect(statusOf(evaluate({ titleLength: min - 1 }), 'title')).toBe('warn');
  });

  it('a title at the minimum passes', () => {
    expect(statusOf(evaluate({ titleLength: min }), 'title')).toBe('pass');
  });
});

describe('metaDescription boundaries', () => {
  const min = THRESHOLDS.metaDescription.min;

  it('a missing description fails', () => {
    expect(statusOf(evaluate({ metaDescriptionLength: 0 }), 'metaDescription')).toBe('fail');
  });

  it('a description below the minimum warns', () => {
    expect(statusOf(evaluate({ metaDescriptionLength: min - 1 }), 'metaDescription')).toBe('warn');
  });

  it('a description at the minimum passes', () => {
    expect(statusOf(evaluate({ metaDescriptionLength: min }), 'metaDescription')).toBe('pass');
  });
});

describe('headingStructure boundaries', () => {
  it('no H1 fails', () => {
    expect(statusOf(evaluate({ h1Count: 0 }), 'headingStructure')).toBe('fail');
  });

  it('one H1 passes', () => {
    expect(statusOf(evaluate({ h1Count: 1 }), 'headingStructure')).toBe('pass');
  });

  it('five H1s still passes', () => {
    expect(statusOf(evaluate({ h1Count: 5 }), 'headingStructure')).toBe('pass');
  });
});

describe('structuredData boundaries', () => {
  it('no JSON-LD warns', () => {
    expect(statusOf(evaluate({ jsonLdCount: 0 }), 'structuredData')).toBe('warn');
  });

  it('one JSON-LD block passes', () => {
    expect(statusOf(evaluate({ jsonLdCount: 1 }), 'structuredData')).toBe('pass');
  });
});

describe('freshness boundaries', () => {
  it('no date signal and no Last-Modified warns', () => {
    const report = evaluate({ hasDateSignal: false, lastModifiedHeader: null });
    expect(statusOf(report, 'freshness')).toBe('warn');
  });

  it('an on-page date signal alone passes', () => {
    const report = evaluate({ hasDateSignal: true, lastModifiedHeader: null });
    expect(statusOf(report, 'freshness')).toBe('pass');
  });

  it('a Last-Modified header alone passes', () => {
    const report = evaluate({ hasDateSignal: false, lastModifiedHeader: 'Wed, 01 Jan 2025 00:00:00 GMT' });
    expect(statusOf(report, 'freshness')).toBe('pass');
  });
});

describe('indexable boundaries', () => {
  it('noindex fails', () => {
    expect(statusOf(evaluate({ noindex: true }), 'indexable')).toBe('fail');
  });

  it('without noindex it passes', () => {
    expect(statusOf(evaluate({ noindex: false }), 'indexable')).toBe('pass');
  });
});

describe('aiCrawlerAccess boundaries', () => {
  function robots(blockedAgents: string[], fetched = true): RobotsSignals {
    return { fetched, blockedAgents };
  }

  it('no blocked agents passes', () => {
    expect(statusOf(evaluate({}, robots([])), 'aiCrawlerAccess')).toBe('pass');
  });

  it('one blocked agent warns', () => {
    expect(statusOf(evaluate({}, robots(['GPTBot'])), 'aiCrawlerAccess')).toBe('warn');
  });

  it('two blocked agents warn', () => {
    expect(statusOf(evaluate({}, robots(['GPTBot', 'ClaudeBot'])), 'aiCrawlerAccess')).toBe('warn');
  });

  it('three blocked agents fail', () => {
    expect(statusOf(evaluate({}, robots(['GPTBot', 'ClaudeBot', 'PerplexityBot'])), 'aiCrawlerAccess')).toBe('fail');
  });

  it('an unfetchable robots.txt with no blocked agents still passes', () => {
    expect(statusOf(evaluate({}, robots([], false)), 'aiCrawlerAccess')).toBe('pass');
  });
});

describe('canonical and language', () => {
  it('a canonical URL passes', () => {
    expect(statusOf(evaluate({ canonical: 'https://example.com/x' }), 'canonical')).toBe('pass');
  });

  it('a missing canonical warns', () => {
    expect(statusOf(evaluate({ canonical: null }), 'canonical')).toBe('warn');
  });

  it('a declared language passes', () => {
    expect(statusOf(evaluate({ lang: 'fr' }), 'language')).toBe('pass');
  });

  it('a missing language warns', () => {
    expect(statusOf(evaluate({ lang: null }), 'language')).toBe('warn');
  });
});

/* ── 4. Points per status ───────────────────────────────── */

describe('points awarded per status', () => {
  const ceilHalf = (weight: number) => Math.ceil(weight / 2);

  it('a warn on a weight-20 check earns ceil(20/2) = 10', () => {
    const c = checkOf(evaluate({ wordCount: THRESHOLDS.words.fail }), 'contentInHtml');
    expect(c.weight).toBe(20);
    expect(c.status).toBe('warn');
    expect(c.earned).toBe(ceilHalf(c.weight));
    expect(c.earned).toBe(10);
  });

  it('a warn on a weight-8 check earns ceil(8/2) = 4', () => {
    const c = checkOf(evaluate({ metaDescriptionLength: THRESHOLDS.metaDescription.min - 1 }), 'metaDescription');
    expect(c.weight).toBe(8);
    expect(c.status).toBe('warn');
    expect(c.earned).toBe(ceilHalf(c.weight));
    expect(c.earned).toBe(4);
  });

  it('a warn on a weight-5 check earns ceil(5/2) = 3', () => {
    const c = checkOf(evaluate({}, { fetched: true, blockedAgents: ['GPTBot'] }), 'aiCrawlerAccess');
    expect(c.weight).toBe(5);
    expect(c.status).toBe('warn');
    expect(c.earned).toBe(ceilHalf(c.weight));
    expect(c.earned).toBe(3);
  });

  it('a warn on an odd-weight check rounds up, not down', () => {
    const c = checkOf(evaluate({ lang: null }), 'language');
    expect(c.weight).toBe(3);
    expect(c.status).toBe('warn');
    expect(c.earned).toBe(ceilHalf(c.weight));
    expect(c.earned).toBe(2);
  });

  it('a pass earns the full weight and a fail earns nothing', () => {
    const pass = checkOf(evaluate({ h1Count: 1 }), 'headingStructure');
    expect(pass.status).toBe('pass');
    expect(pass.earned).toBe(pass.weight);

    const fail = checkOf(evaluate({ h1Count: 0 }), 'headingStructure');
    expect(fail.status).toBe('fail');
    expect(fail.earned).toBe(0);
  });
});

/* ── 5. gradeFor boundaries ─────────────────────────────── */

describe('gradeFor boundaries', () => {
  const cases: Array<[number, string]> = [
    [0, 'critical'],
    [49, 'critical'],
    [50, 'fair'],
    [69, 'fair'],
    [70, 'good'],
    [89, 'good'],
    [90, 'excellent'],
    [100, 'excellent'],
  ];

  for (const [score, grade] of cases) {
    it(`maps score ${score} to "${grade}"`, () => {
      expect(gradeFor(score)).toBe(grade);
    });
  }
});

/* ── 6. Tally correctness ───────────────────────────────── */

describe('tally', () => {
  const samples: Array<[string, AiReadabilityReport]> = [
    ['a perfect page', evaluate()],
    ['a worst-case page', evaluateAiReadability({ page: worstPage, robots: worstRobots })],
    ['a mid page', evaluate({ wordCount: 100, titleLength: 5, jsonLdCount: 0 })],
  ];

  for (const [name, report] of samples) {
    it(`${name}: statuses sum to the check count and match a manual recount`, () => {
      const { pass, warn, fail } = report.tally;
      expect(pass + warn + fail).toBe(report.checks.length);
      expect(pass).toBe(report.checks.filter((c) => c.status === 'pass').length);
      expect(warn).toBe(report.checks.filter((c) => c.status === 'warn').length);
      expect(fail).toBe(report.checks.filter((c) => c.status === 'fail').length);
    });
  }
});

/* ── 7. Robustness ──────────────────────────────────────── */

describe('robustness', () => {
  it('does not throw for all-zero signals', () => {
    const zeroPage: PageSignals = {
      wordCount: 0,
      h1Count: 0,
      h2Count: 0,
      h3Count: 0,
      titleLength: 0,
      metaDescriptionLength: 0,
      jsonLdCount: 0,
      hasDateSignal: false,
      lastModifiedHeader: null,
      textBytes: 0,
      htmlBytes: 0,
      canonical: null,
      lang: null,
      noindex: false,
    };
    const report = evaluateAiReadability({ page: zeroPage, robots: { fetched: false, blockedAgents: [] } });
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.checks).toHaveLength(11);
  });

  it('does not throw when blockedAgents holds an unknown agent string', () => {
    const unknown = ['NotARealCrawlerBot'];
    expect((AI_CRAWLER_AGENTS as readonly string[]).includes(unknown[0])).toBe(false);
    expect(() => evaluate({}, { fetched: true, blockedAgents: unknown })).not.toThrow();
  });

  it('always returns an integer score between 0 and 100', () => {
    const numbers = [0, 1, 49, 50, 299, 300, 5000];
    const bools = [false, true];
    const generated: AiReadabilityReport[] = [];

    for (const wordCount of numbers) {
      for (const h1Count of [0, 1]) {
        for (const jsonLdCount of [0, 1]) {
          for (const hasDateSignal of bools) {
            for (const noindex of bools) {
              for (const blocked of [0, 1, 3]) {
                generated.push(
                  evaluateAiReadability({
                    page: {
                      ...perfectPage,
                      wordCount,
                      h1Count,
                      jsonLdCount,
                      hasDateSignal,
                      noindex,
                      titleLength: wordCount,
                      lang: h1Count ? 'en' : null,
                    },
                    robots: {
                      fetched: true,
                      blockedAgents: Array.from({ length: blocked }, (_, i) => `Agent${i}`),
                    },
                  }),
                );
              }
            }
          }
        }
      }
    }

    expect(generated.length).toBeGreaterThan(50);
    for (const report of generated) {
      expect(Number.isInteger(report.score)).toBe(true);
      expect(report.score).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeLessThanOrEqual(100);
    }
  });
});

/* ── 8. AI_CRAWLER_AGENTS sanity ────────────────────────── */

describe('AI_CRAWLER_AGENTS', () => {
  it('is non-empty', () => {
    expect(AI_CRAWLER_AGENTS.length).toBeGreaterThan(0);
  });

  it('contains no duplicates', () => {
    expect(new Set(AI_CRAWLER_AGENTS).size).toBe(AI_CRAWLER_AGENTS.length);
  });

  it('includes the major AI crawler tokens', () => {
    expect(AI_CRAWLER_AGENTS).toContain('GPTBot');
    expect(AI_CRAWLER_AGENTS).toContain('ClaudeBot');
    expect(AI_CRAWLER_AGENTS).toContain('PerplexityBot');
  });
});
