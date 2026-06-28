# DevTools Hub — Developer Documentation

> A collection of free, browser-based developer micro-tools built with Next.js 16, Tailwind CSS 4, and TypeScript.
> https://devtools-lilac-nine.vercel.app/
---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [How the App Router Works](#how-the-app-router-works)
- [File-by-File Guide](#file-by-file-guide)
  - [Config Files (root)](#config-files-root)
  - [Source Code (src/)](#source-code-src)
- [Design System](#design-system)
- [How to Add a New Tool](#how-to-add-a-new-tool)
- [Edge & Serverless Optimizations](#edge--serverless-optimizations)
- [Deployment](#deployment)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Glossary](#glossary)

---

## Quick Start

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd SiteGPTClone

# 2. Install dependencies
npm install

# 3. Copy env file
cp .env.example .env.local

# 4. Start development server
npm run dev

# 5. Open in browser
#    → http://localhost:3000
```

### Available Scripts

| Command         | What it does                                      |
|-----------------|---------------------------------------------------|
| `npm run dev`   | Starts the dev server with hot-reload (port 3000) |
| `npm run build` | Creates an optimized production build              |
| `npm run start` | Runs the production build locally                  |
| `npm run lint`  | Checks code for errors using ESLint                |

> [!NOTE]
> Our scripts use the `--webpack` flag (e.g. `next dev --webpack`) because the native Turbopack compiler isn't available on all platforms. Webpack works identically — it's just a bit slower in dev mode.

---

## Project Overview

**What is this?** A website that offers free developer utilities (JSON formatter, regex tester, UUID generator, etc.) that run **entirely in the browser** — no data is ever sent to a server.

**How it works at a high level:**

```
User visits devtools-hub.vercel.app
         │
         ▼
┌─────────────────────┐
│   Edge Proxy        │  ← Runs at CDN edge (Vercel/Cloudflare)
│   (proxy.ts)        │     Redirects, sets headers, caches
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Next.js App       │  ← Serves pre-built HTML pages
│   (layout + pages)  │     All pages are static (pre-rendered)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Browser (client)  │  ← All tool logic runs here
│   React components  │     Zero network calls for tool usage
└─────────────────────┘
```

---

## Tech Stack

| Technology       | Version | What it does                                                     |
|-----------------|---------|------------------------------------------------------------------|
| **Next.js**      | 16.2    | React framework with file-based routing, SSR, and static generation |
| **React**        | 19.2    | UI library for building components                                |
| **TypeScript**   | 5.x     | JavaScript with types — catches bugs before runtime               |
| **Tailwind CSS** | 4.x     | Utility-first CSS framework (we mostly use CSS variables though)  |
| **ESLint**       | 9.x     | Finds and fixes code quality issues                               |

---

## Folder Structure

```
SiteGPTClone/
├── .env.example          # Environment variable template
├── .dockerignore          # Files Docker should ignore
├── Dockerfile             # Container build instructions
├── vercel.json            # Vercel deployment settings
├── next.config.ts         # Next.js configuration (headers, caching, etc.)
├── tsconfig.json          # TypeScript compiler settings
├── postcss.config.mjs     # PostCSS plugins (loads Tailwind)
├── eslint.config.mjs      # ESLint rules
├── package.json           # Dependencies and scripts
│
├── public/                # Static files served as-is (favicon, images)
│   ├── next.svg
│   ├── vercel.svg
│   └── file.svg
│
└── src/                   # All source code lives here
    ├── proxy.ts           # Edge proxy — runs before every request
    │
    └── app/               # Next.js App Router directory
        ├── layout.tsx     # Root layout — wraps EVERY page
        ├── page.tsx       # Home page (/) — tool grid + hero
        ├── globals.css    # Design tokens + global styles
        ├── site-chrome.tsx # Header and footer components
        ├── loading.tsx    # Loading skeleton (shown during navigation)
        ├── not-found.tsx  # Custom 404 page
        ├── robots.ts      # Generates /robots.txt for search engines
        ├── sitemap.ts     # Generates /sitemap.xml for SEO
        └── favicon.ico    # Browser tab icon
```

> [!TIP]
> In Next.js App Router, **the file name determines what it does**. A file called `page.tsx` defines a page, `layout.tsx` defines a layout, `loading.tsx` defines a loading state, etc. This is called **convention-based routing**.

---

## How the App Router Works

If you're new to Next.js App Router, here's the mental model:

### Pages and Routes

Every `page.tsx` file inside `src/app/` becomes a URL:

```
src/app/page.tsx             →  /
src/app/tools/json/page.tsx  →  /tools/json
src/app/about/page.tsx       →  /about
```

### Layouts

`layout.tsx` wraps all pages at that level and below. Our root `layout.tsx` provides:
- HTML `<head>` tags (title, meta description, Open Graph)
- Google Fonts (Inter + JetBrains Mono)
- The site header and footer
- The `<main>` tag where page content renders

```
layout.tsx (header + footer)
  └── page.tsx (main content changes per route)
```

### Server Components vs Client Components

By default, every component in the App Router is a **Server Component** — it runs on the server (or at build time) and sends plain HTML to the browser. This means **zero JavaScript shipped** for that component.

If you need interactivity (useState, onClick, etc.), add `"use client"` at the top of the file. This makes it a **Client Component** that hydrates in the browser.

```tsx
// Server Component (default) — no interactivity, no JS shipped
export default function About() {
  return <h1>About us</h1>;
}

// Client Component — interactive, JS shipped to browser
"use client";
import { useState } from "react";
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

> [!IMPORTANT]
> Our tool widgets (JSON formatter, regex tester, etc.) are Client Components because they need `useState` for interactivity. The layout, loading screen, and 404 page are Server Components — they ship zero JS.

### Special Files

| File            | Purpose                                             | When it runs          |
|-----------------|-----------------------------------------------------|-----------------------|
| `layout.tsx`    | Wraps pages with shared UI (header, footer)          | Every request         |
| `page.tsx`      | The actual page content for a route                  | When route is visited |
| `loading.tsx`   | Shown immediately while a page/layout is loading     | During navigation     |
| `not-found.tsx` | Custom 404 error page                                | When route not found  |
| `robots.ts`     | Generates `/robots.txt` for search engine crawlers   | At build time         |
| `sitemap.ts`    | Generates `/sitemap.xml` for SEO                     | At build time         |

---

## File-by-File Guide

### Config Files (root)

#### `next.config.ts` — The Brain

This is the most important config file. Here's what each setting does:

```ts
output: "standalone"
// Creates a self-contained build folder that includes everything
// needed to run the app — no need to copy node_modules to production.
// This makes Docker images ~100MB smaller and cold starts faster.

reactStrictMode: true
// Enables extra React warnings during development.
// Catches common bugs like missing useEffect cleanup.

poweredByHeader: false
// Removes the "X-Powered-By: Next.js" HTTP header.
// Minor security improvement — doesn't expose what framework you use.

compress: false
// Turns off Node.js gzip compression.
// WHY? CDNs (Vercel, Cloudflare) already compress responses with
// Brotli (better than gzip). Having both wastes CPU.
```

**Headers section** — adds HTTP headers to every response:

| Header                    | What it prevents                                      |
|---------------------------|-------------------------------------------------------|
| `X-Content-Type-Options`  | Browser guessing file types (MIME sniffing attacks)    |
| `X-Frame-Options`         | Your site being embedded in iframes (clickjacking)     |
| `X-XSS-Protection`        | Basic cross-site scripting in older browsers           |
| `Referrer-Policy`          | Leaking full URLs when navigating to external sites    |
| `Permissions-Policy`       | Blocks access to camera, microphone, geolocation       |
| `Strict-Transport-Security`| Forces HTTPS for 2 years (prevents downgrade attacks)  |

**Caching rules:**

```
Static assets (.js, .css, fonts, images):
  → Cache for 1 year, mark as "immutable" (never re-validate)
  → Safe because file names contain hashes (style.abc123.css)

HTML pages:
  → max-age=0        (browser always checks with server)
  → s-maxage=86400   (CDN can cache for 24 hours)
  → stale-while-revalidate=604800  (serve stale for 7 days while refreshing)
```

#### `package.json` — Dependencies

```json
{
  "dependencies": {
    "next": "16.2.9",      // The framework
    "react": "19.2.4",     // UI library
    "react-dom": "19.2.4"  // React's browser renderer
  }
}
```

That's it — only 3 production dependencies. Everything else (Tailwind, TypeScript, ESLint) is `devDependencies` and doesn't ship to users.

#### `tsconfig.json` — TypeScript

Key settings:
- `strict: true` — enables all strict type-checking (recommended)
- `"@/*": ["./src/*"]` — path alias so you can write `import X from "@/app/thing"` instead of `"../../app/thing"`

#### `vercel.json` — Vercel Deployment

```json
{
  "regions": ["iad1"],        // Deploy to US-East (Virginia)
  "cleanUrls": true,          // /about instead of /about.html
  "trailingSlash": false       // /about instead of /about/
}
```

#### `.env.example` — Environment Variables

Only one variable is needed:

```bash
NEXT_PUBLIC_SITE_URL=https://devtools-hub.vercel.app
```

This is used by `sitemap.ts`, `robots.ts`, and Open Graph meta tags. The `NEXT_PUBLIC_` prefix means it's available in both server and client code.

---

### Source Code (src/)

#### `src/proxy.ts` — Edge Proxy

> [!NOTE]
> In Next.js 16, this was renamed from `middleware.ts` to `proxy.ts`. Same concept, new name.

This file runs **at the CDN edge** (before your app code) on every page request. It's powered by the V8 JavaScript engine (same as Chrome), not full Node.js, so it starts in **under 1ms**.

**What it does:**
1. **Server-Timing header** — adds a `proxy;dur=0` header so you can measure proxy latency in Chrome DevTools (Network tab → Timing)
2. **Trailing slash redirect** — `/tools/json/` → `/tools/json` (308 permanent redirect)
3. **CDN-Cache-Control** — tells the CDN to cache the response for 24 hours

**The `matcher`** — a regex that says "run this on all routes EXCEPT static files (images, CSS, JS, fonts)". This avoids unnecessary processing on assets.

#### `src/app/layout.tsx` — Root Layout

This wraps **every single page** on the site. Think of it as the `<html>` and `<body>` skeleton:

```
┌──────────────────────────────┐
│  <html>                      │
│    <body>                    │
│      ┌────────────────────┐  │
│      │  SiteHeader        │  │  ← Sticky nav bar
│      ├────────────────────┤  │
│      │  <main>            │  │
│      │    {children} ←────│──│── This is where page.tsx renders
│      │  </main>           │  │
│      ├────────────────────┤  │
│      │  SiteFooter        │  │  ← Footer
│      └────────────────────┘  │
│    </body>                   │
│  </html>                     │
└──────────────────────────────┘
```

**Key parts:**
- **Fonts**: Inter (sans-serif, body text) and JetBrains Mono (monospace, code/data)
- **`display: "swap"`**: Shows fallback font immediately, swaps to Google Font when loaded (prevents invisible text)
- **Metadata**: Title template (`%s — DevTools`), description, Open Graph tags
- **Skip-to-content link**: Hidden link that appears on Tab press for keyboard/screen-reader users (accessibility requirement)

#### `src/app/page.tsx` — Home Page

This is the main page at `/`. It's a **Client Component** (`"use client"`) because it uses `useState` for:
- Category filter chips (All, Data, Text, Encoding, etc.)
- Search input
- Interactive tool preview widgets

**Structure:**
```
Hero section
  └── Title, subtitle, tool count

Controls bar
  ├── Search input
  ├── Category filter chips
  └── Result count (e.g. "7/10")

Tool grid (responsive)
  └── ToolCard × N
        ├── Name + description
        ├── Category + badge tags
        ├── Live widget preview (interactive!)
        └── "Try tool" CTA button
```

Each tool has an inline widget component (JsonWidget, RegexWidget, etc.) that gives users a **live preview** right on the homepage.

#### `src/app/site-chrome.tsx` — Header & Footer

Simple Client Component with two exports:
- `SiteHeader()` — sticky nav with logo, "All Tools" link, GitHub link, CTA button
- `SiteFooter()` — license info and privacy note

Uses inline styles to avoid hydration mismatches. The frosted-glass effect uses `backdrop-filter: blur(16px)`.

#### `src/app/loading.tsx` — Loading Skeleton

A **Server Component** (no `"use client"`) that shows a simple spinner + "Loading…" text. Next.js automatically shows this during page transitions via React Suspense.

Because it's a Server Component, **zero JavaScript is sent** for this UI.

#### `src/app/not-found.tsx` — 404 Page

Static page pre-rendered at build time. Shows "404 — Page not found" with a link back to the homepage. Also zero JS.

#### `src/app/robots.ts` & `src/app/sitemap.ts` — SEO

These use Next.js's Metadata API to generate `/robots.txt` and `/sitemap.xml` at build time:

- **robots.txt**: Tells search engine crawlers "index everything except `/api/` and `/_next/`"
- **sitemap.xml**: Lists all pages with priority and update frequency. When you add a new tool, add its slug to the `toolSlugs` array in `sitemap.ts`.

---

## Design System

All design tokens live in `globals.css` as CSS custom properties (variables):

### Colors

| Variable          | Value       | Usage                                |
|-------------------|-------------|--------------------------------------|
| `--bg`            | `#ffffff`   | Page background                      |
| `--bg-subtle`     | `#F7F7F6`   | Input backgrounds, subtle sections   |
| `--bg-raised`     | `#ffffff`   | Card backgrounds                     |
| `--text`          | `#18181B`   | Primary text (headings, body)        |
| `--text-2`        | `#52525B`   | Secondary text (descriptions)        |
| `--text-3`        | `#A1A1AA`   | Muted text (labels, hints)           |
| `--accent`        | `#5B21B6`   | Primary brand color (buttons, links) |
| `--accent-fg`     | `#7C3AED`   | Accent for text (lighter purple)     |
| `--accent-light`  | `#EDE9FE`   | Accent background tint               |

### Semantic Colors (for tool widgets)

| Variable         | Purpose                       |
|------------------|-------------------------------|
| `--green` / `--green-light` | Success, valid, "new" badge  |
| `--amber` / `--amber-light` | Warning, "popular" badge     |
| `--blue` / `--blue-light`   | Info, hash highlights        |
| `--red` / `--red-light`     | Error, invalid input         |

### Typography

| Variable   | Font              | Usage                         |
|------------|-------------------|-------------------------------|
| `--sans`   | Inter             | All body text, headings, UI    |
| `--mono`   | JetBrains Mono    | Code, data, tool outputs       |

### Using variables in components

```tsx
// In inline styles (most tool widgets use this)
<div style={{ color: "var(--text-2)", background: "var(--bg-subtle)" }}>

// In CSS classes (header/nav uses these)
.nav-link { color: var(--text-2); }
.nav-link:hover { color: var(--text); }
```

---

## How to Add a New Tool

### Step 1: Create the widget component

In `page.tsx`, add a new widget function above the `tools` array:

```tsx
function LoremIpsumWidget() {
  const [count, setCount] = useState(3);
  // Your tool logic here...
  return (
    <WidgetShell>
      {/* Your UI here */}
    </WidgetShell>
  );
}
```

> [!TIP]
> Wrap your widget in `<WidgetShell>` — it provides consistent padding, border, and background styling.

### Step 2: Add it to the tools array

```tsx
const tools: Tool[] = [
  // ... existing tools ...
  {
    slug: "lorem-ipsum",           // URL-safe identifier
    name: "Lorem Ipsum Generator", // Display name
    description: "Generate placeholder text for mockups and prototypes.",
    category: "text",              // Must match a Category type
    badge: "new",                  // Optional: "new" or "popular"
    Widget: LoremIpsumWidget,      // The component you just created
  },
];
```

### Step 3: Add it to the sitemap

In `src/app/sitemap.ts`, add the slug to the `toolSlugs` array:

```tsx
const toolSlugs = [
  // ... existing slugs ...
  "lorem-ipsum",  // ← add this
];
```

### Step 4: (Future) Create a full-page route

When you build dedicated tool pages, create:
```
src/app/tools/lorem-ipsum/page.tsx
```

This automatically creates the route `/tools/lorem-ipsum`.

---

## Edge & Serverless Optimizations

Here's a plain-English breakdown of every optimization and **why** it matters:

### Build Optimizations

| What                    | Why                                                                         |
|-------------------------|-----------------------------------------------------------------------------|
| `output: "standalone"`  | Copies only the files needed to run into `.next/standalone/`. The final Docker image is ~80MB instead of 500MB+ with `node_modules`. |
| `compress: false`       | CDNs like Vercel compress with Brotli (30% smaller than gzip). If Node also compresses, you waste CPU doing it twice. |
| `poweredByHeader: false`| Removes `X-Powered-By: Next.js` header. One less thing for attackers to fingerprint. |

### Runtime Optimizations

| What                          | Why                                                                   |
|-------------------------------|-----------------------------------------------------------------------|
| Edge Proxy (`proxy.ts`)       | Runs on V8 at the CDN edge. Starts in <1ms vs ~200ms for a cold Node.js Lambda. |
| Static Generation (SSG)       | All pages are pre-built as HTML at `npm run build` time. The server just sends a file — no rendering on each request. |
| `loading.tsx` (Streaming)     | Shows a loading spinner instantly while the page JS loads. Users see something immediately instead of a blank screen. |
| `display: "swap"` (Fonts)     | Browser shows text in a fallback font instantly, then swaps to the Google Font when it downloads. No invisible text flash. |

### Caching Strategy

```
Request → Edge Proxy → CDN Cache → Origin Server

Static assets (JS, CSS, images, fonts):
  ┌──────────────────────────────────────────────────┐
  │ Cache-Control: public, max-age=31536000, immutable │
  │                                                    │
  │ Translation: "Cache this for 1 year. Never check   │
  │ if it changed. If we update it, the filename will   │
  │ change (style.abc123.css → style.def456.css)."     │
  └──────────────────────────────────────────────────┘

HTML pages:
  ┌──────────────────────────────────────────────────┐
  │ max-age=0          → Browser always asks CDN      │
  │ s-maxage=86400     → CDN can serve cached for 24h │
  │ stale-while-revalidate=604800                     │
  │   → If cache is stale, serve it anyway while      │
  │     fetching a fresh copy in the background.      │
  │     Users never wait, content stays fresh.        │
  └──────────────────────────────────────────────────┘
```

---

## Deployment

### Option A: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com), import the repo
3. Set the environment variable: `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app`
4. Deploy — Vercel auto-detects Next.js and handles everything

The `vercel.json` file configures the edge region (US-East), clean URLs, and extra security headers.

### Option B: Docker (Any Cloud)

```bash
# Build the image
docker build -t devtools-hub .

# Run it
docker run -p 3000:3000 devtools-hub
```

The Dockerfile uses a **3-stage build**:

```
Stage 1 (deps)    → Install node_modules
Stage 2 (builder) → Build the Next.js app
Stage 3 (runner)  → Copy only the standalone output (~80MB image)
```

This works on AWS ECS, Google Cloud Run, Fly.io, Railway, or any container platform.

---

## Common Tasks

### "I want to change the accent color"

Edit `--accent`, `--accent-fg`, and `--accent-light` in `src/app/globals.css`:

```css
:root {
  --accent: #2563EB;       /* your new color */
  --accent-light: #DBEAFE; /* a light tint of it */
  --accent-fg: #3B82F6;    /* slightly lighter for text */
}
```

### "I want to change the site title"

Edit the `metadata` export in `src/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: { template: "%s — MyBrand", default: "MyBrand — Free tools" },
  description: "Your new description here",
};
```

### "I want to add a dark mode"

1. Add dark mode variables in `globals.css` inside a media query:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0F0F10;
    --text: #FAFAFA;
    /* ... etc */
  }
}
```

2. Update the header's `background` in `site-chrome.tsx` to handle dark backgrounds.

### "The build is slow"

The `--webpack` flag is slower than Turbopack. If you're on a platform where native binaries work (Mac/Linux with x64 or arm64), remove `--webpack` from the scripts in `package.json`:

```json
"dev": "next dev",
"build": "next build",
```

---

## Troubleshooting

### `@next/swc-win32-x64-msvc is not a valid Win32 application`

**Not a real error.** Next.js tries to load native SWC binaries, fails, and falls back to WebAssembly. Everything works fine — just a warning.

### `Turbopack is not supported on this platform`

Already handled — our scripts use `--webpack`. If you see this, make sure `package.json` has:
```json
"dev": "next dev --webpack"
```

### `ENOSPC: no space left on device`

npm cache is on C: drive which is full. Fix:
```bash
npm config set cache D:\npm-cache
npm cache clean --force
```

### Hydration mismatch warnings

If a component renders differently on server vs client (e.g., `new Date()`, `Math.random()`), you'll see hydration errors. Fix by:
1. Adding `suppressHydrationWarning` to the element
2. Using `useEffect` to set the dynamic value only on the client

---

## Glossary

| Term | Plain English |
|------|---------------|
| **SSG (Static Site Generation)** | Pages are built into HTML files at `npm run build` time. No server needed to show them. |
| **SSR (Server-Side Rendering)** | Pages are built into HTML on each request. Slower, but shows fresh data. |
| **Edge Runtime** | A lightweight JavaScript runtime that runs at CDN locations worldwide. Faster than Node.js because it's just V8 (Chrome's engine). |
| **CDN** | Content Delivery Network — servers all over the world that cache your site close to users. |
| **Standalone Output** | A Next.js build mode that copies only the needed files into a self-contained folder. No `node_modules` needed. |
| **Hydration** | When React "takes over" the static HTML that was sent from the server and makes it interactive (attaching event listeners, etc.). |
| **Proxy (formerly Middleware)** | Code that runs at the edge before your page code. Used for redirects, auth checks, headers. |
| **Cold Start** | The time it takes for a serverless function to boot up when it hasn't been used recently. Edge Runtime has near-zero cold starts. |
| **Stale-While-Revalidate** | A caching strategy: serve the old (stale) version immediately, then update the cache in the background. Users never wait. |
| **CSS Custom Properties** | Variables in CSS (e.g., `--accent: #5B21B6`). Set once, use everywhere with `var(--accent)`. |
| **Client Component** | A React component with `"use client"` that ships JavaScript to the browser for interactivity. |
| **Server Component** | A React component that runs only on the server/build. Ships zero JS. Default in App Router. |
