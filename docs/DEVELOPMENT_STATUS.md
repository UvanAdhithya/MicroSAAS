# Development Status — SEOSnap (SiteGPTClone)

> **Snapshot Date**: 2026-11-21 (previous update 2026-10-20)  
> **Source of Truth**: Repository audit & test suite execution on Windows environment.  
> **Live Site**: `https://www.seosnap.xyz` (Vercel; `main` auto-deploys). Sitemap: 7 URLs.

---

## 1. Verified Working Functionality

The following items have been verified through code inspection, type checking (`npx tsc --noEmit`), linting (`npm run lint`), test execution (`npm test`), and a production build (`npm run build`):

| Component / Subsystem | Status | Verification Method |
| :--- | :--- | :--- |
| **Type Checking** | ✅ Pass | `npx tsc --noEmit` exits with code 0 (zero errors). |
| **Linting** | ✅ Pass | `npm run lint` exits with code 0 (zero errors, zero warnings). Diagnostic scripts under `tests/scratch/` are excluded via `globalIgnores`. |
| **Unit Test Suite** | ✅ Pass | `npm test` runs 4 test files (106 tests) in Vitest; 100% pass. |
| **Production Build** | ✅ Pass | `npm run build` exits with code 0 (via WASM fallback on this Windows machine — see §4); compiles all routes, including `/tools/ai-readability` and request-time OG images. |
| **Home Page & Tool Catalog** | ✅ Verified | `src/app/page.tsx` is server-rendered: h1, h2 and all six tool cards appear in the served HTML, with search/filter resolved on the server from `?q=` / `?cat=` (works without JavaScript). |
| **Tool 1: SEO Analyzer** | ✅ Verified | `src/app/tools/seo-analyzer/page.tsx` + `src/app/api/analyze-seo/route.ts` (Edge runtime, Cheerio DOM parsing, SERP preview). |
| **Tool 2: Free SEO Report** | ✅ Verified | `src/app/tools/free-seo-report/page.tsx` + `src/app/api/free-seo-report/route.ts` (PDF export via `html2pdf.js`). |
| **Tool 3: Content Extractor** | ✅ Verified | `src/app/tools/content-extractor/page.tsx` + `src/app/api/extract-content/route.ts` (DOM outline extraction H1–H3). |
| **Tool 4: Sitemap Extractor** | ✅ Verified | `src/app/tools/sitemap-extractor/page.tsx` + `src/app/api/extract-sitemap/route.ts` (Parses `robots.txt` + XML sitemaps). |
| **Tool 5: Broken Link Checker** | ✅ Verified | `src/app/tools/broken-link-checker/page.tsx` + `src/app/api/check-links/route.ts` (Concurrent HEAD/GET checks). *On branch, not yet merged*: captures anchor text and walks redirect chains manually (`redirect: "manual"`, ≤5 hops, single 8s timeout), adding `anchorTexts`, `redirects`, `redirectCount` and optional `finalUrl`. |
| **Tool 6: AI Readability Checker** | ✅ Verified | `src/app/tools/ai-readability/page.tsx` + `src/app/api/ai-readability/route.ts` (Edge; 14 page signals via Cheerio, plus `robots.txt` parsed for 12 AI crawler tokens). Scoring in `src/lib/ai-readability.ts` (11 weighted checks, 100 points; unit-tested). *Score is our own heuristic, not a Google metric or ranking factor* — stated prominently on the page. |
| **Rate Limiter** | ✅ Verified | `src/lib/rate-limit.ts` (Upstash Redis + fallback in-memory sliding window; unit tests pass). |
| **Edge Proxy** | ✅ Verified | `src/proxy.ts` (Rate-limiting, Supabase session refresh, `/dashboard` redirect guard, Server-Timing). |
| **Auth Client Abstraction** | ✅ Verified | `src/lib/auth-client.ts` & `src/lib/auth.ts` provide clean boundaries for Supabase. |
| **Report Save / Delete API** | ✅ Verified | `src/app/api/reports/route.ts` (GET, POST, DELETE scoped to authenticated user). |
| **User Dashboard** | ✅ Verified | `src/app/dashboard/page.tsx` (Lists saved reports with delete button, redirects unauthenticated guests). |
| **Saved Report Detail** | ✅ Verified | `src/app/dashboard/reports/[id]/report-views.tsx` dispatches on `toolName` to six tool-specific visual views (SERP preview, score donut, heading outline, URL/status tables), with the exact payload kept behind a collapsed "Raw JSON" `<details>`. 36 render tests. |
| **Per-Route Metadata & Tool Extras** | ✅ Verified | Each tool route has a `layout.tsx` carrying its own title/description/canonical (tool pages are client components, so Next.js can only read metadata from these server files). `src/components/tool-extras.tsx` exports `FaqSection` (FAQPage JSON-LD), `RelatedTools` and `ToolSchema` (SoftwareApplication JSON-LD, `isAccessibleForFree: true`, zero-price Offer). No `aggregateRating` is emitted. |
| **OpenGraph Images** | ✅ Verified | `src/lib/og-image.tsx` shared renderer; `src/app/opengraph-image.tsx` for the site and one `opengraph-image.tsx` per tool route. Generated at request time via `next/og`; not committed as binaries. |
| **CI Pipeline** | ✅ Verified | `.github/workflows/ci.yml` defines two-stage pipeline (build/lint/test + Playwright E2E). |

---

## 2. Partially Implemented or Incomplete Functionality

1. **Export from the Saved Report Detail Page (`/dashboard/reports/[id]`)**:
   - *Current State*: Saved reports render as structured, tool-specific visual views, but this page offers no PDF or CSV download. Export exists only inside the Free SEO Report tool page itself.
   - *Expected State*: "Export PDF" / "Export CSV" actions on the report detail page, reusing the `html2pdf.js` / `jspdf` dependencies already present.
2. **Broken Link Checker Enhancements (branch only)**:
   - *Current State*: Anchor text and manual redirect-chain walking are implemented and verified on `feat/link-context-and-homepage-schema`, but **not yet merged**. The opaque-redirect fallback path is unexercised (see §4).
3. **SiteGPT Chat Features**:
   - *Current State*: Not implemented. The repository contains only SEO inspection micro-tools.

---

## 3. Last Meaningful Development Tasks (Recent Git Commits)

From `git log` on `main`:
- `a7b1e74`: **Merge PR #6 — feat/ai-readability-check** — Merged the AI Readability Checker and its scoring model.
- `8aa57af`: **feat(ai-readability): add an AI crawler readability checker** — Added `/tools/ai-readability` page and the `/api/ai-readability` edge route (14 page signals + `robots.txt` AI-token parsing); removed the non-functional "Compy" email-capture `UpsellCard` from the tool pages.
- `ead0473`: **feat(ai-readability): add scoring model and check definitions** — Added `src/lib/ai-readability.ts` (11 weighted checks) with unit tests.
- `d679042`: **Merge PR #5 — feat/discoverability-phase-0** — Merged the Phase 0 discoverability work.
- `a8e7bd0`: **feat(seo): phase 0 discoverability — server-rendered home, per-page metadata, OG images, FAQ and app schema** — Made the homepage server-render its catalog; added per-route `layout.tsx` metadata, `next/og` OpenGraph images, and `tool-extras.tsx` (FAQ, RelatedTools, SoftwareApplication JSON-LD).

**Uncommitted work on `feat/link-context-and-homepage-schema` (implemented, verified, NOT merged):**
- `src/app/api/check-links/route.ts` now captures anchor text per link and walks redirect chains manually (`redirect: "manual"`, ≤5 hops, one 8s timeout); `src/app/tools/broken-link-checker/page.tsx` renders both.
- `src/app/page.tsx` gained `WebSite` + `Organization` + `ItemList` JSON-LD in one `@graph`, including a `SearchAction` whose `?q={search_term_string}` template genuinely resolves (verified: `?q=analyzer` returns 1 tool). Note Google retired the *visual* sitelinks searchbox in late 2024 — the markup is still valid and descriptive.

---

## 4. Outstanding Issues & Technical Debt

1. **Vite / Vitest Native Config Warning**:
   Vitest outputs a minor warning during `npm test` about `__dirname` in `vitest.config.mts:13:25`. It recommends `import.meta.dirname`. Non-fatal.
2. **`@next/swc` Native Binary Warning on Windows**:
   `npm run build` logs `Attempted to load @next/swc-win32-x64-msvc ... is not a valid Win32 application` several times before falling back to the WASM compiler. The build still exits 0; the installed native binary appears broken for this machine's architecture.
3. **Database Connectivity Dependency for Dashboard**:
   The dashboard requires a working PostgreSQL connection via `DATABASE_URL` (Supabase connection pooler port `6543`). If unset, the dashboard fails gracefully with an inline error banner without crashing the server.
4. **Untyped `report_data` Column**:
   `savedReports.reportData` is `jsonb`, so Drizzle types it as `unknown`, and rows may have been written by an older build of a tool. The views in `report-views.tsx` therefore narrow every field defensively. Any new field added to a tool's API response must be read the same way rather than cast.
5. **`/dashboard` Returns 200 with a Client-Side Redirect**:
   Unauthenticated visitors to `/dashboard` receive HTTP 200 and a **client-side** redirect to `/login?next=/dashboard`, not a server 3xx. `src/proxy.ts` is documented as guarding this at the edge, and an edge redirect would show as a 3xx. The outcome is correct and the page is `noindex`, but a brief flash of the dashboard shell occurs. Not yet investigated.
6. **Opaque-Redirect Fallback Is Unexercised (branch)**:
   The new link checker falls back to `redirect: "follow"` when the runtime returns an opaque redirect (status 0, no readable `Location`), keeping `ok`/`status` correct. Next's dev edge runtime exposes `Location` for `redirect: "manual"`, so this path is untested — it needs verification on production after deploy, where Vercel isolates may behave differently.
7. **Homepage Fails the AI-Readability Freshness Check — Deliberate**:
   The homepage carries no date signal and so fails the freshness check. This is a recorded decision, not an oversight: adding a `dateModified` purely to raise the score would fabricate a freshness claim the site does not have.
8. **Production Deployment Drift — Resolved 2026-11-20**:
   Production had been manually deployed and had drifted about a month behind `main`. Vercel Git integration is now connected (`main` auto-deploys), so this is no longer the case.

---

## 5. Next Highest-Priority Tasks

> The previous Priority 1 (ESLint scratch-file ignores) and Priority 2 (rich saved-report
> visualization) were completed on 2026-10-20 — see Section 3. Phase 0 discoverability and the
> AI Readability Checker have since shipped. The tasks below are the current priorities in order.

### Priority 1: Dashboard Report Export (PDF/CSV)
- **Goal**: Allow users to download saved reports as PDF or CSV directly from `/dashboard/reports/[id]`.
- **Action**: Reuse `jspdf`/`html2pdf.js` already present in dependencies. A CSV shape must be chosen per tool, since the six saved payloads are structurally different.
- **Verification**: Click "Export PDF" / "Export CSV" on a saved report of each tool type and confirm the file downloads with the expected contents.

### Priority 2: Unit Tests for the Edge Scraper Logic
- **Goal**: Cover the `route.ts` scrapers themselves — the Cheerio parsing in `src/app/api/analyze-seo/route.ts`, `src/app/api/extract-content/route.ts`, `src/app/api/ai-readability/route.ts` and `src/app/api/check-links/route.ts`.
- **Action**: Create Vitest test files under `src/lib/__tests__/` mocking fetch responses and verifying extracted JSON structures against static HTML fixture strings. The rendering layer and the scoring model are already tested (`report-views.test.tsx`, `ai-readability.test.ts`); the scrapers are not.
- **Verification**: `npm test` runs and passes with an increased assertion count.

### Priority 3: Phase 2 — Expand the Indexable Surface
- **Goal**: Grow from 7 pages toward 25–30, one *working* tool or data-backed page at a time.
- **Constraint**: Explicitly **not** a programmatic page farm. Google's scaled-content-abuse policy applies "no matter how it's created", enforcement is silent, and one documented case went from 22,000 indexed pages to 1 overnight.

### Priority 4: Phase 3 Distribution
- **Goal**: Show HN, r/InternetIsBeautiful, r/SideProject.
- **Avoid**: Product Hunt (featured rate fell from 35.9% in 2022 to 3.2% in 2026; median 1 vote) and the SEO subreddits (r/SEO removes any post containing a link; r/bigseo's rules ban "free tools" by name).

### Priority 5: Search Console Submission (done)
- All 7 URLs have been submitted to Google Search Console for indexing, and the sitemap resubmitted.

### Deferred: Resolve the Vitest `__dirname` Config Warning
- **Goal**: Silence the non-fatal warning and future-proof against Vite's `configLoader: 'native'` becoming the default. Replace `__dirname` with `import.meta.dirname` in `vitest.config.mts:13`.
