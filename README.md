# MicroSAAS (DevTools Hub)

A Next.js 16 micro-SaaS app that provides free SEO and content analysis tools.

Live app: https://devtools-lilac-nine.vercel.app/

## Features

- SEO Analyzer (`/tools/seo-analyzer`)
- Free SEO Report with PDF export (`/tools/free-seo-report`)
- Content Extractor (`/tools/content-extractor`)
- Sitemap Extractor (`/tools/sitemap-extractor`)
- Broken Link Checker (`/tools/broken-link-checker`)
- Optional Supabase auth pages (`/login`, `/signup`)
- Edge API routes with request rate-limiting support (Upstash)

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Vitest + Testing Library
- Playwright
- Drizzle ORM + PostgreSQL
- Supabase Auth

## Project Structure

```text
/home/runner/work/MicroSAAS/MicroSAAS
├── src/
│   ├── app/
│   │   ├── page.tsx                # Home page and tool catalog
│   │   ├── tools/                  # Tool UI routes
│   │   ├── api/                    # API routes backing each tool
│   │   ├── login/ signup/          # Auth pages
│   │   ├── robots.ts sitemap.ts    # SEO files
│   │   └── layout.tsx
│   ├── db/                         # Drizzle schema and DB client
│   └── lib/                        # Auth, Supabase client, rate-limit utils
├── tests/                          # End-to-end tests
└── package.json
```

## API Routes

- `POST /api/analyze-seo`
- `POST /api/free-seo-report`
- `POST /api/extract-content`
- `POST /api/extract-sitemap`
- `POST /api/check-links`
- `GET  /api/health`

Most tool routes run on the Edge runtime for low-latency responses.

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env.local` in the repository root.

```bash
# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Database (required for Drizzle/db operations)
DATABASE_URL=******HOST:5432/DB_NAME

# Supabase (optional for login/signup)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Upstash Redis (optional, enables real rate limiting)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

> If Upstash variables are not set, the app falls back to a permissive in-memory-style allow path for local development.

### 3) Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` — start development server
- `npm run build` — create production build
- `npm run start` — run production build
- `npm run lint` — run ESLint
- `npm run test` — run unit/integration tests with Vitest
- `npm run test:watch` — run Vitest in watch mode
- `npm run test:e2e` — run Playwright tests
- `npm run db:generate` — generate Drizzle migrations
- `npm run db:push` — push schema changes to database

## Database Notes

Drizzle config is in `drizzle.config.ts` and expects `DATABASE_URL`.

## Deployment

- Optimized for Vercel (see `vercel.json`)
- Docker deployment is available via `Dockerfile`

## Health Check

Use:

```bash
curl http://localhost:3000/api/health
```

Expected response includes status, service name, timestamp, uptime, and environment.
