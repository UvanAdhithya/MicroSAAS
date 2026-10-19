# Development Status — SEOSnap (SiteGPTClone)

> **Snapshot Date**: October 2026 (last updated 2026-10-20)  
> **Source of Truth**: Repository audit & test suite execution on Windows environment.

---

## 1. Verified Working Functionality

The following items have been verified through code inspection, type checking (`npx tsc --noEmit`), linting (`npm run lint`), test execution (`npm test`), and a production build (`npm run build`):

| Component / Subsystem | Status | Verification Method |
| :--- | :--- | :--- |
| **Type Checking** | ✅ Pass | `npx tsc --noEmit` exits with code 0 (zero errors). |
| **Linting** | ✅ Pass | `npm run lint` exits with code 0 (zero errors, zero warnings). Diagnostic scripts under `tests/scratch/` are excluded via `globalIgnores`. |
| **Unit Test Suite** | ✅ Pass | `npm test` runs 3 test suites (43 tests) in Vitest; 100% pass. |
| **Production Build** | ✅ Pass | `npm run build` exits with code 0; all 20 routes compile. |
| **Home Page & Tool Catalog** | ✅ Verified | `src/app/page.tsx` renders tool cards, category filters, and search bar. |
| **Tool 1: SEO Analyzer** | ✅ Verified | `src/app/tools/seo-analyzer/page.tsx` + `src/app/api/analyze-seo/route.ts` (Edge runtime, Cheerio DOM parsing, SERP preview). |
| **Tool 2: Free SEO Report** | ✅ Verified | `src/app/tools/free-seo-report/page.tsx` + `src/app/api/free-seo-report/route.ts` (PDF export via `html2pdf.js`). |
| **Tool 3: Content Extractor** | ✅ Verified | `src/app/tools/content-extractor/page.tsx` + `src/app/api/extract-content/route.ts` (DOM outline extraction H1–H3). |
| **Tool 4: Sitemap Extractor** | ✅ Verified | `src/app/tools/sitemap-extractor/page.tsx` + `src/app/api/extract-sitemap/route.ts` (Parses `robots.txt` + XML sitemaps). |
| **Tool 5: Broken Link Checker** | ✅ Verified | `src/app/tools/broken-link-checker/page.tsx` + `src/app/api/check-links/route.ts` (Concurrent HEAD/GET checks). |
| **Rate Limiter** | ✅ Verified | `src/lib/rate-limit.ts` (Upstash Redis + fallback in-memory sliding window; unit tests pass). |
| **Edge Proxy** | ✅ Verified | `src/proxy.ts` (Rate-limiting, Supabase session refresh, `/dashboard` redirect guard, Server-Timing). |
| **Auth Client Abstraction** | ✅ Verified | `src/lib/auth-client.ts` & `src/lib/auth.ts` provide clean boundaries for Supabase. |
| **Report Save / Delete API** | ✅ Verified | `src/app/api/reports/route.ts` (GET, POST, DELETE scoped to authenticated user). |
| **User Dashboard** | ✅ Verified | `src/app/dashboard/page.tsx` (Lists saved reports with delete button, redirects unauthenticated guests). |
| **Saved Report Detail** | ✅ Verified | `src/app/dashboard/reports/[id]/report-views.tsx` dispatches on `toolName` to five tool-specific visual views (SERP preview, score donut, heading outline, URL/status tables), with the exact payload kept behind a collapsed "Raw JSON" `<details>`. 36 render tests. |
| **CI Pipeline** | ✅ Verified | `.github/workflows/ci.yml` defines two-stage pipeline (build/lint/test + Playwright E2E). |

---

## 2. Partially Implemented or Incomplete Functionality

1. **Export from the Saved Report Detail Page (`/dashboard/reports/[id]`)**:
   - *Current State*: Saved reports render as structured, tool-specific visual views, but this page offers no PDF or CSV download. Export exists only inside the Free SEO Report tool page itself.
   - *Expected State*: "Export PDF" / "Export CSV" actions on the report detail page, reusing the `html2pdf.js` / `jspdf` dependencies already present.
2. **SiteGPT Chat Features**:
   - *Current State*: Not implemented. The repository contains only SEO inspection micro-tools.

---

## 3. Last Meaningful Development Tasks (Recent Git Commits)

From `git log -n 5`:
- `674be6e`: **feat(reports): render saved reports with per-tool visual views** — Replaced the raw JSON `<pre>` on `/dashboard/reports/[id]` with `report-views.tsx` (five tool-specific views + collapsible raw JSON); added 36 render tests; fixed `deriveTitle` so Sitemap and Broken Link Checker reports no longer save generic titles.
- `3d0170a`: **chore(lint): ignore tests/scratch/** in ESLint flat config** — Added `"tests/scratch/**"` to `globalIgnores`, taking `npm run lint` from 6 errors to 0.
- `a713e4c`: **ci: add build step and Playwright E2E job** — Added build step and Playwright E2E job to CI workflow, covering all 5 tools and dashboard redirect.
- `462604c`: **chore(env): document all env vars in .env.example** — Added environment variable templates and unignored `.env.example` in `.gitignore`.
- `e3d76ef`: **feat(monitoring): add optional Sentry error tracking** — Added `@sentry/nextjs` instrumentation and package renaming to `seosnap`.

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

---

## 5. Next Highest-Priority Tasks

> The previous Priority 1 (ESLint scratch-file ignores) and Priority 2 (rich saved-report
> visualization) were completed on 2026-10-20 — see Section 3. The tasks below are renumbered.

### Priority 1: Add Client-Side Export to Dashboard Reports
- **Goal**: Allow users to download saved reports as PDF or CSV directly from `/dashboard/reports/[id]`.
- **Action**: Reuse `jspdf`/`html2pdf.js` already present in dependencies. A CSV shape must be chosen per tool, since the five saved payloads are structurally different.
- **Verification**: Click "Export PDF" / "Export CSV" on a saved report of each tool type and confirm the file downloads with the expected contents.

### Priority 2: Expand Unit & Integration Test Coverage
- **Goal**: Add unit tests for edge route parsing logic (`cheerio` selectors in `src/app/api/analyze-seo/route.ts` and `src/app/api/extract-content/route.ts`).
- **Action**: Create Vitest test files under `src/lib/__tests__/` mocking fetch responses and verifying extracted JSON structures. Note that the rendering layer is now covered by `report-views.test.tsx` (36 tests); the scrapers themselves are not.
- **Verification**: `npm test` runs and passes with an increased assertion count.

### Priority 3: Resolve the Vitest `__dirname` Config Warning
- **Goal**: Silence the non-fatal warning and future-proof against Vite's `configLoader: 'native'` becoming the default.
- **Action**: Replace `__dirname` with `import.meta.dirname` in `vitest.config.mts:13`.
- **Verification**: `npm test` runs with no config warning, and all tests still pass.
