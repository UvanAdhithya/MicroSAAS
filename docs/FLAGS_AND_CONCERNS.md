# Flags and Concerns — SEOSnap (SiteGPTClone)

> **Purpose**: A register of every flag, risk, caveat and deliberate decision raised during the SEOSnap work session of **2026-10-20 to 2026-11-21**.  
> **Scope**: Things someone should know, chase, or deliberately leave alone.  
> **Companion Docs**: `DEVELOPMENT_STATUS.md` (what works) and `AI_HANDOFF.md` (technical handoff) complete the set; this is the third leg.

---

## 1. Open — Needs Action

| Item | Why it matters | What to do |
| :--- | :--- | :--- |
| **Opaque-redirect fallback is unexercised** (`src/app/api/check-links/route.ts`) | Falls back to a follow request when a runtime returns an opaque redirect (status 0, no readable `Location`). Next's dev edge runtime exposes `Location` normally, so the fallback never fired; Vercel's production isolates are a different runtime. Worst case is empty chains, never misreported statuses. | Run one production link scan after the branch merges and confirm chains populate. |
| **`/dashboard` returns HTTP 200 with a client-side redirect** | `src/proxy.ts` is documented as guarding `/dashboard` at the edge, and an edge redirect would show as a 3xx with a `Location` header. Unauthenticated visitors get a brief flash of the dashboard shell before landing on `/login?next=/dashboard`. | Outcome is correct and the page is `noindex`, so not urgent. Not yet investigated. |
| **Vercel Deployment Protection bypass secret is exposed** | A `x-vercel-protection-bypass` token (value redacted) appeared in the session transcript and should be treated as leaked. | Rotate or delete it: Vercel → project → Settings → Deployment Protection. |
| **Vitest `__dirname` warning** (`vitest.config.mts:13:25`) | Non-fatal; Vite recommends `import.meta.dirname`. See `DEVELOPMENT_STATUS.md` §4. | Deferred. Replace `__dirname` with `import.meta.dirname` when convenient. |
| **`sitemap-extractor` has 4 FAQ items** | The other tools have 5–6; it is the thinnest of the six. | Add one or two more FAQ entries when the page is next touched. |
| **Existing saved reports keep their generic titles** | `deriveTitle` in `src/components/save-report-button.tsx` now reads `url`, then `scannedUrl`, then `urls[0].url`, but rows written before the fix still read e.g. "Sitemap Extractor report". | No backfill was done — a fix would need a database write. Optional. |
| **Homepage content-to-markup ratio is 2.5%** and scores a warning | Inherent to Next.js output (large inline RSC and script payloads), not a fault of the page. | Accepted — no action. |

---

## 2. Deliberate Decisions — Do Not "Fix" These

| Decision | Reason |
| :--- | :--- |
| **The homepage fails the freshness check on purpose** | It carries no date signal and was left that way. Adding a `dateModified` purely to raise the score would fabricate a freshness claim the site does not have — the exact behaviour the AI Readability Checker criticises in other tools. The homepage scores **85/good** on the live site, rising to **91/excellent** once the homepage structured data on the current branch ships. The remaining deduction is deliberately left in place rather than papered over. |
| **No `aggregateRating` in any structured data** | The site has no real ratings; inventing them violates Google's structured-data guidelines and risks a manual action. |
| **No programmatic page farm** | Google's scaled-content-abuse policy applies "no matter how it's created", enforcement is algorithmic and silent, and one documented case went from 22,000 indexed pages to 1 overnight. Growth is one working tool or data-backed page at a time. |
| **No feature parity with Ahrefs / Screaming Frog** | Crawl depth, backlink index size and keyword-database breadth are capital-and-time moats a solo project cannot win. |
| **The AI Readability score is our own heuristic** | Stated prominently on the tool page. It is not a Google metric or ranking factor. Weights follow published citation-correlation findings (metadata & freshness r=0.68, semantic HTML r=0.65, structured data r=0.63), but the model is ours. |
| **Blocking AI crawlers in `robots.txt` scores a warning at 1–2 agents and a failure at 3+** | The wording is deliberately neutral: blocking is a legitimate policy choice, so the tool reports it rather than telling people to unblock. |
| **The marketing strategy document is intentionally untracked** (`docs/marketing-strategy.html`) | Never `git add` it. It is also a point-in-time snapshot whose figures age. |

---

## 3. Fixed During This Session

| Issue | Fix |
| :--- | :--- |
| **The homepage server-rendered nothing** | `src/app/page.tsx` was a `"use client"` component with `if (!mounted) return null;`, so the served HTML was an 11,988-byte shell with no `h1`, no `h2`, no tool catalog and no prose. Bing, GPTBot, PerplexityBot and ClaudeBot never execute JavaScript, so the page did not exist for them. Made it a server component; filtering moved to `?q=` / `?cat=` URL params. Now 54,291 bytes with `h1`, `h2`, six tool cards and a canonical. |
| **All six pages shared one identical `<title>` and meta description** | Only `layout.tsx` and `dashboard/page.tsx` exported metadata; the five tool pages were client components and could not. Fixed with a `layout.tsx` per tool route. |
| **No page declared a canonical URL** | Fixed. |
| **No page had an `og:image`** | Every share rendered as a bare link. Fixed with request-time generation via `next/og` — a shared renderer in `src/lib/og-image.tsx` plus six route files. |
| **The report detail page referenced `var(--surface)`** | A token never defined in `globals.css`, so it silently fell back to a hardcoded hex. Switched to the real `--bg-subtle`. |
| **The `UpsellCard` email capture was non-functional** | Its submit handler only set local state, so it displayed "You're on the list!" while storing nothing. It advertised a product called **Compy**. Removed from all five tool pages by the owner's decision. |
| **`deriveTitle` produced generic report titles** | It only inspected a top-level `url`, so the Sitemap Extractor and Broken Link Checker got generic titles. Fixed to read `url`, then `scannedUrl`, then `urls[0].url`. |
| **A `*/` inside a block comment broke the build** | Writing `src/app/tools/*/opengraph-image.tsx` inside a `/* */` comment closed the comment early, turning the remainder into bare code and failing `tsc` and `lint`. Self-inflicted; caught by a delegated agent, fixed in both affected files. |
| **The homepage emitted no JSON-LD** | Fixed with `WebSite` + `Organization` + `ItemList` in one `@graph`, plus a `SearchAction` whose `?q={search_term_string}` template was verified to resolve on production before being declared. |
| **The AI Readability Checker's thresholds were miscalibrated** | The first pass failed `react.dev` (1,045 words genuinely in its HTML) and `seosnap.xyz` (163 words) on content-to-markup ratio, because modern frameworks ship large inline script payloads. A check that fails well-engineered server-rendered sites is worse than no check. Ratio floor moved 5%→1% (pass at 5%), word pass bar 300→150. |
| **The AI Readability copy overclaimed** | The intro and first article paragraph asserted AI assistants "do not execute JavaScript", which is false for Google's AI features and Bing — both render JavaScript. Scoped to the dedicated crawlers with the exception stated, in the tool page and the module docstring. |
| **One arithmetic claim was imprecise** | A warning "earns half" when it actually earns half rounded up. Corrected. |
| **The content-in-HTML fix text assumed JavaScript was the only cause** | Corrected to name both causes (a thin page, or runtime injection) and to tell the reader to check the raw source. |
| **A stray `rb.txt`** | Medium's robots.txt, a test artifact, was left in the repository root by a delegated agent. Removed and noted in the commit. |
| **One of our own tests was wrong** | It asserted a stat-card value was the label's `previousSibling` when `StatCard` renders the label first. Corrected; the component was fine. |
| **Production had drifted a month behind `main`** | The live sitemap `lastmod` read `2026-10-19` while three commits had landed on `main` on 2026-10-20. Cause: Vercel's Git integration was connected only after that date, so production was being deployed manually. Resolved 2026-11-20 — merging now auto-deploys. |

---

## 4. Environmental — This Machine or Session Only

| Symptom | Explanation |
| :--- | :--- |
| `@next/swc-win32-x64-msvc` fails to load during `npm run build` ("is not a valid Win32 application") | Next falls back to the WASM compiler and the build still exits 0. Machine-specific. |
| `next start` warns that it does not work with `output: "standalone"`, yet still serves correctly (HTTP 200) | The documented alternative is `node .next/standalone/server.js`. |
| Vercel **preview** deployments sit behind Vercel Authentication | An anonymous request gets a 302 to `vercel.com/sso-api`, so link unfurlers (Slack, X, Discord, Googlebot) cannot fetch them. Protected responses also carry `X-Robots-Tag: noindex`, which is the correct default. Test previews with a bypass header or in a signed-in browser. |
| On a preview, `og:image` resolves to a `*.vercel.app` host while `canonical` resolves to `www.seosnap.xyz` | Deliberate Next.js behaviour, not a bug: `next/dist/lib/metadata/resolvers/resolve-opengraph.js` overrides `metadataBase` for file-convention images, and `resolve-url.js` prefers the preview URL when `VERCEL_ENV === "preview"`. In production the same code path falls through to `metadataBase`, and this was later **measured on production**: every route's `og:image` host is `www.seosnap.xyz`. No action needed. |
| `example.com` currently serves **no `<a href>` at all** (verified at 577 bytes) | A link scan against it legitimately returns zero links. Not a regression. |
| `www.seosnap.xyz` briefly became unreachable from one shell (HTTP 502 from the API, `curl` exit code 000) | Occurred mid-session while the code was unchanged. Environmental. |

---

## 5. Growth and Product Concerns

- The growth plan is `docs/marketing-strategy.html` (untracked). Its figures predate the sixth tool and its Phase 0 diagnosis is now historical.
- **Product Hunt is a trap for a project with no existing audience**: featured share fell from 35.9% in 2022 to 3.2% in 2026, median votes from ~7 to 1, and 73.5% of 2025 launches received under 10 votes.
- **The SEO subreddits ban this kind of post.** r/SEO removes any post or comment containing a link; r/bigseo's rules ban "free tools" by name; r/webdev allows show-off posts only on Showoff Saturday. The welcoming venues are r/InternetIsBeautiful and r/SideProject.
- **Programmatic page farms get silently deindexed.** Enforcement is algorithmic; one case went from 22,000 indexed pages to 1 with no manual action. Comparison pages with identical prose were among the casualties.
- **Realistic timelines**: only 1.74% of newly published pages reach the top 10 within a year; 72.9% of top-10 pages are over three years old. Expect near-zero organic traffic for 3 months, first long-tail impressions at 1–3 months, durable rankings at 6–12+ months.
- **AI-assistant referrals are real but small**: measured at roughly 1.08% of visits in one 13,770-domain study and 0.17% in another, growing about 1% per month. AI Overviews simultaneously remove organic clicks (one study: 8% click-through with an AI summary vs 15% without).
- **Never fabricate trust signals** — no invented ratings, dates or freshness. This is both a Google policy risk and the specific behaviour the product is positioned against.
- **SEOSnap is a freemium funnel**; the paid product is undecided. The free tier is the top of the funnel, so do not add friction there.

---

## 6. Security and Housekeeping

- The Deployment Protection bypass token from this session should be rotated (see §1).
- `docs/marketing-strategy.html` must stay untracked, at the owner's explicit request.
- `CLAUDE.md` is untracked even though its own header describes it as "checked into the codebase" — the two contradict each other and someone should decide.
- `.claudeignore` is untracked and is a per-machine tool config, not project source.
- `github.com/UvanAdhithya/MicroSAAS` is a **public** repository, so every push is outward-facing.
