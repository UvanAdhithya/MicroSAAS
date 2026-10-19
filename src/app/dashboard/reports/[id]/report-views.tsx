import type { ReactNode } from "react";

/* ─────────────────────────────────────────────────────────
 * Saved report views
 * ─────────────────────────────────────────────────────────
 * Renders a stored `saved_reports.report_data` payload in the
 * same visual language as the tool page that produced it.
 *
 * `report_data` is a jsonb column, so it arrives as `unknown`
 * and may have been written by an older build of a tool. Every
 * field below is therefore read through the narrowing helpers
 * rather than cast — a missing or renamed field degrades to an
 * empty state instead of throwing during render.
 *
 * These are server components: no state, no event handlers.
 * ───────────────────────────────────────────────────────── */

type Json = Record<string, unknown>;

/* ── Narrowing helpers ──────────────────────────────────── */

function asRecord(value: unknown): Json | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Json) : null;
}

/** Non-empty trimmed string, else null. */
function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function strList(value: unknown): string[] {
  return list(value)
    .map((entry) => str(entry))
    .filter((entry): entry is string => entry !== null);
}

/* ── Formatting helpers ─────────────────────────────────── */

/** Google-style breadcrumb: drop the protocol and a bare trailing slash. */
function hostPath(raw: string): string {
  try {
    const parsed = new URL(raw);
    return `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return raw;
  }
}

/** Resolve a possibly-relative href (e.g. og:image) against the scanned page. */
function absoluteUrl(href: string | null, base: string | null): string | null {
  if (!href) return null;
  try {
    return new URL(href, base ?? undefined).href;
  } catch {
    return null;
  }
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Sitemap `lastmod` is a free-text string in the wild — never trust it to parse. */
function formatLastmod(raw: string | null): string {
  if (!raw) return "-";
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : parsed.toLocaleDateString();
}

/* ── Shared presentation primitives ─────────────────────── */

type Tone = "green" | "red" | "amber" | "blue" | "accent" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  green: "bg-[var(--green-light)] text-[var(--green)]",
  red: "bg-[var(--red-light)] text-[var(--red)]",
  amber: "bg-[var(--amber-light)] text-[var(--amber)]",
  blue: "bg-[var(--blue-light)] text-[var(--blue)]",
  accent: "bg-[var(--accent-light)] text-[var(--accent)]",
  neutral: "bg-[var(--bg-subtle)] text-[var(--text-2)]",
};

function Pill({
  tone,
  uppercase = false,
  children,
}: {
  tone: Tone;
  uppercase?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-bold ${
        uppercase ? "text-[10px] uppercase" : "text-[11px]"
      } ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}

function Card({
  title,
  icon,
  span = false,
  children,
}: {
  title: string;
  icon: string;
  span?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-sm${
        span ? " md:col-span-2" : ""
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          {icon}
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-3)]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] px-5 py-4 shadow-sm">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
        {label}
      </span>
      <span className="text-2xl font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function EmptyBlock({ emoji, message }: { emoji: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="mb-2 text-4xl" aria-hidden="true">
        {emoji}
      </span>
      <p className="text-sm font-medium text-[var(--text-2)]">{message}</p>
    </div>
  );
}

/** Amber "this was missing on the page" marker. */
function EmptyTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--amber)] bg-[var(--amber-light)] px-3 py-1.5 text-xs font-medium text-[var(--amber)]">
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
      {label}
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="mb-2 flex items-start gap-2">
      <code className="mt-0.5 flex-shrink-0 rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent)]">
        {label}
      </code>
      <span className="text-sm break-words text-[var(--text-2)]">{value}</span>
    </div>
  );
}

function TechDetail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
        {label}
      </span>
      <span className="font-mono text-[13px] break-all">
        {value ?? <span className="text-[var(--text-3)]">—</span>}
      </span>
    </div>
  );
}

function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] shadow-sm">
      <div className="max-h-[500px] overflow-auto">{children}</div>
    </div>
  );
}

function TableHead({ columns }: { columns: { label: string; right?: boolean }[] }) {
  return (
    <thead className="sticky top-0 bg-[var(--bg-subtle)] text-xs uppercase text-[var(--text-3)] shadow-[0_1px_0_var(--border)]">
      <tr>
        {columns.map((column) => (
          <th
            key={column.label}
            className={`px-6 py-4 font-medium${column.right ? " text-right" : ""}`}
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/** Non-blocking footnote explaining why a report may be incomplete. */
function LimitNote({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-xs text-[var(--text-3)]">{children}</p>;
}

/* ── 1. SEO Analyzer ────────────────────────────────────── */

const TITLE_IDEAL = [30, 60] as const;
const DESC_IDEAL = [120, 160] as const;
const HEADING_CAP = 20;

function CharBadge({ count, ideal }: { count: number; ideal?: readonly [number, number] }) {
  let tone: Tone = "neutral";
  if (count === 0) tone = "red";
  else if (ideal && count >= ideal[0] && count <= ideal[1]) tone = "green";
  else if (count > 0) tone = "amber";

  return <Pill tone={tone}>{count} chars</Pill>;
}

function HeadingRow({ level, text }: { level: "H1" | "H2"; text: string }) {
  const isH1 = level === "H1";
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-[var(--border)] px-3 py-2${
        isH1 ? "" : " ml-4"
      }`}
    >
      <span
        className={`mt-0.5 flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
          isH1
            ? "bg-[var(--accent-light)] text-[var(--accent)]"
            : "bg-[var(--blue-light)] text-[var(--blue)]"
        }`}
      >
        {level}
      </span>
      <span className={`text-sm ${isH1 ? "font-medium text-[var(--text)]" : "text-[var(--text-2)]"}`}>
        {text}
      </span>
    </div>
  );
}

function SeoAnalyzerView({ data }: { data: Json }) {
  const url = str(data.url);
  const title = str(data.title);
  const metaDescription = str(data.metaDescription);
  const canonical = str(data.canonical);
  const favicon = str(data.favicon);
  const language = str(data.language);

  const og = asRecord(data.og) ?? {};
  const twitter = asRecord(data.twitter) ?? {};
  const ogTitle = str(og.title);
  const ogDescription = str(og.description);
  const ogImage = str(og.image);
  const ogType = str(og.type);
  const ogUrl = str(og.url);
  const twitterCard = str(twitter.card);
  const twitterTitle = str(twitter.title);
  const twitterDescription = str(twitter.description);

  const h1Tags = strList(data.h1Tags);
  const h2Tags = strList(data.h2Tags);

  // The SERP preview falls back through OpenGraph the way the tool page does.
  const serpTitle = title ?? ogTitle ?? "Untitled Page";
  const serpDescription = metaDescription ?? ogDescription ?? "No description available.";
  const faviconSrc = absoluteUrl(favicon, url);

  const noSocialTags =
    !ogTitle && !ogDescription && !ogImage && !ogType && !ogUrl &&
    !twitterCard && !twitterTitle && !twitterDescription;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Google SERP Preview" icon="🔍" span>
        <div className="rounded-xl border border-[#E8EAED] bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            {faviconSrc && (
              // eslint-disable-next-line @next/next/no-img-element -- remote 16px favicon; next/image would emit the same <img> here (unoptimized, and no remotePatterns are configured).
              <img src={faviconSrc} alt="" width={16} height={16} className="h-4 w-4 rounded-sm" />
            )}
            <span className="truncate text-[13px] text-[#202124]">{url ? hostPath(url) : "—"}</span>
          </div>
          <h3
            className="mb-1 text-[20px] font-normal leading-snug text-[#1A0DAB]"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {serpTitle}
          </h3>
          <p
            className="text-[14px] leading-[1.5] text-[#4D5156]"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {truncate(serpDescription, 160)}
          </p>
        </div>
      </Card>

      <Card title="Title & Description" icon="🏷️">
        <div className="mb-5">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-3)]">
              Title
            </span>
            <CharBadge count={title?.length ?? 0} ideal={TITLE_IDEAL} />
          </div>
          {title ? (
            <p className="text-[15px] font-semibold leading-snug text-[var(--text)]">{title}</p>
          ) : (
            <EmptyTag label="No title tag found" />
          )}
        </div>
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-3)]">
              Meta Description
            </span>
            <CharBadge count={metaDescription?.length ?? 0} ideal={DESC_IDEAL} />
          </div>
          {metaDescription ? (
            <p className="text-sm leading-relaxed text-[var(--text-2)]">{metaDescription}</p>
          ) : (
            <EmptyTag label="No meta description found" />
          )}
        </div>
      </Card>

      <Card title={`Headings (${h1Tags.length + h2Tags.length})`} icon="📑">
        {h1Tags.length === 0 && h2Tags.length === 0 ? (
          <EmptyTag label="No H1 or H2 tags found" />
        ) : (
          <div className="max-h-[320px] space-y-2 overflow-auto pr-1">
            {h1Tags.map((text, index) => (
              <HeadingRow key={`h1-${index}`} level="H1" text={text} />
            ))}
            {h2Tags.map((text, index) => (
              <HeadingRow key={`h2-${index}`} level="H2" text={text} />
            ))}
          </div>
        )}
        {(h1Tags.length >= HEADING_CAP || h2Tags.length >= HEADING_CAP) && (
          <LimitNote>Analysis captures at most {HEADING_CAP} headings per level.</LimitNote>
        )}
      </Card>

      <Card title="OpenGraph & Twitter" icon="🔗">
        <MetaRow label="og:title" value={ogTitle} />
        <MetaRow label="og:description" value={ogDescription} />
        <MetaRow label="og:image" value={absoluteUrl(ogImage, url) ?? ogImage} />
        <MetaRow label="og:type" value={ogType} />
        <MetaRow label="og:url" value={ogUrl} />
        <MetaRow label="twitter:card" value={twitterCard} />
        <MetaRow label="twitter:title" value={twitterTitle} />
        <MetaRow label="twitter:description" value={twitterDescription} />
        {noSocialTags && <EmptyTag label="No OpenGraph or Twitter tags found" />}
      </Card>

      <Card title="Technical Details" icon="⚙️" span>
        <div className="grid gap-3 sm:grid-cols-3">
          <TechDetail label="Canonical" value={canonical} />
          <TechDetail label="Language" value={language} />
          <TechDetail label="Favicon" value={favicon} />
        </div>
      </Card>
    </div>
  );
}

/* ── 2. Free SEO Report ─────────────────────────────────── */

/** Mirrors the scoring weights used by the Free SEO Report tool. */
function scoreReport(input: {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  h1Count: number;
  linkCount: number;
  wordCount: number;
}): number {
  let score = 0;
  if (input.title) score += 20;
  if (input.description) score += 20;
  if (input.h1Count > 0 && input.h1Count <= 2) score += 20;
  else if (input.h1Count > 2) score += 10;
  if (input.ogImage) score += 15;
  if (input.linkCount > 0) score += 10;
  if (input.wordCount > 300) score += 15;
  else if (input.wordCount > 100) score += 5;
  return Math.min(score, 100);
}

function scoreColor(score: number): string {
  if (score >= 80) return "#16A34A";
  if (score >= 50) return "#D97706";
  return "#DC2626";
}

const DONUT_PATH = "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";

function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[var(--bg-subtle)] shadow-inner">
      <svg className="absolute h-full w-full -rotate-90 transform" viewBox="0 0 36 36" aria-hidden="true">
        <path d={DONUT_PATH} fill="none" stroke="#E5E7EB" strokeWidth="3" />
        <path d={DONUT_PATH} fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${score}, 100`} />
      </svg>
      <span className="text-2xl font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function MetricBox({
  title,
  value,
  pass,
  isUrl = false,
}: {
  title: string;
  value: string | null;
  pass: boolean;
  isUrl?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-[var(--text-2)]">{title}</span>
        <Pill tone={pass ? "green" : "red"} uppercase>
          {pass ? "Pass" : "Missing"}
        </Pill>
      </div>
      {value ? (
        isUrl ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-sm text-[var(--blue)] hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm leading-relaxed text-[var(--text-2)]">{value}</p>
        )
      ) : (
        <p className="text-sm italic text-[var(--text-3)]">
          No {title.toLowerCase()} found.
        </p>
      )}
    </div>
  );
}

function ProgressBar({
  label,
  value,
  max,
  ideal,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  ideal: number;
  suffix?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const barColor = value >= ideal ? "bg-[var(--green)]" : value > 0 ? "bg-[var(--amber)]" : "bg-[var(--red)]";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--text-2)]">{label}</span>
        <span className="font-mono text-[13px] text-[var(--text)]">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div className={`h-2.5 rounded-full ${barColor}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function FreeSeoReportView({ data }: { data: Json }) {
  const url = str(data.url);
  const title = str(data.title);
  const description = str(data.metaDescription);
  const ogImage = str(data.ogImage);
  const h1Count = num(data.h1Count) ?? 0;
  const h2Count = num(data.h2Count) ?? 0;
  const linkCount = num(data.linkCount) ?? 0;
  const wordCount = num(data.wordCount) ?? 0;

  const score = scoreReport({ title, description, ogImage, h1Count, linkCount, wordCount });

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        <div className="flex flex-col gap-6 border-b border-[var(--border)] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-[var(--text)]">SEO Health Report</h2>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-sm break-all text-[var(--blue)] hover:underline"
              >
                {url}
              </a>
            )}
          </div>
          <ScoreRing score={score} />
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricBox title="Title Tag" value={title} pass={!!title} />
          <MetricBox title="Meta Description" value={description} pass={!!description} />
          <MetricBox title="OG Image" value={ogImage} pass={!!ogImage} isUrl />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-6">
        <h3 className="mb-6 text-lg font-bold text-[var(--text)]">Content Structure</h3>
        <div className="space-y-5">
          <ProgressBar label="H1 Tags" value={h1Count} max={3} ideal={1} />
          <ProgressBar label="H2 Tags" value={h2Count} max={20} ideal={3} />
          <ProgressBar label="Total Links" value={linkCount} max={100} ideal={20} />
          <ProgressBar label="Word Count" value={wordCount} max={2000} ideal={500} suffix=" words" />
        </div>
        {ogImage && (
          <LimitNote>
            The report stores the OpenGraph image URL only — the image itself is not downloaded.
          </LimitNote>
        )}
      </div>
    </div>
  );
}

/* ── 3. Content Extractor ───────────────────────────────── */

const HEADING_LIMIT = 100;

const HEADING_INDENT: Record<number, string> = {
  1: "1.5rem",
  2: "3rem",
  3: "4.5rem",
};

function HeadingBadge({ level }: { level: number }) {
  const tone: Tone = level === 1 ? "accent" : level === 2 ? "blue" : level === 3 ? "amber" : "neutral";
  return <Pill tone={tone}>H{level}</Pill>;
}

function ContentExtractorView({ data }: { data: Json }) {
  const url = str(data.url);
  const title = str(data.title);
  const wordCount = num(data.wordCount) ?? 0;

  const headings = list(data.headings)
    .map((entry) => {
      const node = asRecord(entry);
      const text = node ? str(node.text) : null;
      const level = node ? num(node.level) : null;
      return text && level !== null ? { text, level } : null;
    })
    .filter((entry): entry is { text: string; level: number } => entry !== null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Words" value={wordCount} color="var(--text)" />
        <StatCard label="Total Headings" value={headings.length} color="var(--accent)" />
        <StatCard label="H2 Tags" value={headings.filter((h) => h.level === 2).length} color="var(--blue)" />
        <StatCard label="H3 Tags" value={headings.filter((h) => h.level === 3).length} color="var(--amber)" />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text)]">Document Tree</h2>
        </div>
        {title && (
          <p className="mt-1 text-sm text-[var(--text-2)]">
            <span className="font-semibold text-[var(--text)]">Title: </span>
            {title}
          </p>
        )}
        {url && (
          <p className="mt-0.5 text-sm break-all text-[var(--text-3)]">{url}</p>
        )}
      </div>

      <TableShell>
        {headings.length === 0 ? (
          <EmptyBlock emoji="📭" message="No H1, H2, or H3 tags found on this page." />
        ) : (
          <table className="w-full text-left text-sm">
            <TableHead columns={[{ label: "Heading Text" }, { label: "Level", right: true }]} />
            <tbody className="divide-y divide-[var(--border)]">
              {headings.map((heading, index) => (
                <tr key={index} className="transition-colors hover:bg-[var(--bg-subtle)]">
                  <td
                    className="px-6 py-3 text-[14px] text-[var(--text)]"
                    style={{ paddingLeft: HEADING_INDENT[heading.level] ?? "1.5rem" }}
                  >
                    <span
                      className={
                        heading.level === 1
                          ? "font-semibold text-[var(--text)]"
                          : "text-[var(--text-2)]"
                      }
                    >
                      {heading.text}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-right">
                    <HeadingBadge level={heading.level} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableShell>

      {headings.length >= HEADING_LIMIT && (
        <LimitNote>Extraction stops after {HEADING_LIMIT} headings.</LimitNote>
      )}
    </div>
  );
}

/* ── 4. Sitemap Extractor ───────────────────────────────── */

function SitemapExtractorView({ data }: { data: Json }) {
  const urls = list(data.urls)
    .map((entry) => {
      const node = asRecord(entry);
      const url = node ? str(node.url) : null;
      return url ? { url, lastmod: str(node?.lastmod) } : null;
    })
    .filter((entry): entry is { url: string; lastmod: string | null } => entry !== null);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[var(--text)]">
        Results{" "}
        <span className="ml-2 text-sm font-normal text-[var(--text-3)]">
          ({urls.length} {urls.length === 1 ? "URL" : "URLs"} found)
        </span>
      </h2>

      <TableShell>
        {urls.length === 0 ? (
          <EmptyBlock emoji="📭" message="No URLs were captured in this sitemap report." />
        ) : (
          <table className="w-full text-left text-sm text-[var(--text-2)]">
            <TableHead columns={[{ label: "URL" }, { label: "Last Modified" }]} />
            <tbody className="divide-y divide-[var(--border)]">
              {urls.map((entry, index) => (
                <tr key={index} className="transition-colors hover:bg-[var(--bg-subtle)]">
                  <td className="px-6 py-3 font-mono text-[13px] text-[var(--text)]">
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all hover:text-[var(--accent)] hover:underline"
                    >
                      {entry.url}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 font-mono text-[12px]">
                    {formatLastmod(entry.lastmod)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableShell>

      <LimitNote>
        Up to three sitemaps are read per extraction. Nested sitemap indexes are listed rather than
        followed, so the URL count can be lower than the site&apos;s true total.
      </LimitNote>
    </div>
  );
}

/* ── 5. Broken Link Checker ─────────────────────────────── */

const LINK_CAP = 50;

function StatusBadge({ ok, status, error }: { ok: boolean; status: number | null; error: string | null }) {
  if (ok) return <Pill tone="green">{status ?? "OK"}</Pill>;
  return <Pill tone="red">{status ?? error ?? "Error"}</Pill>;
}

function LinkTable({
  title,
  links,
  tone,
  emptyEmoji,
  emptyMessage,
}: {
  title: string;
  links: { url: string; ok: boolean; status: number | null; error: string | null }[];
  tone: "green" | "red";
  emptyEmoji: string;
  emptyMessage: string;
}) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--text)]">
        {title}
        <Pill tone={tone}>{links.length}</Pill>
      </h3>
      <TableShell>
        {links.length === 0 ? (
          <EmptyBlock emoji={emptyEmoji} message={emptyMessage} />
        ) : (
          <table className="w-full text-left text-sm">
            <TableHead columns={[{ label: "URL" }, { label: "Status", right: true }]} />
            <tbody className="divide-y divide-[var(--border)]">
              {links.map((link, index) => (
                <tr key={index} className="transition-colors hover:bg-[var(--bg-subtle)]">
                  <td className="max-w-[500px] truncate px-6 py-3 font-mono text-[13px] text-[var(--text)]">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[var(--accent)] hover:underline"
                    >
                      {link.url}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-right">
                    <StatusBadge ok={link.ok} status={link.status} error={link.error} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableShell>
    </div>
  );
}

function BrokenLinkCheckerView({ data }: { data: Json }) {
  const scannedUrl = str(data.scannedUrl);
  const totalFound = num(data.totalFound) ?? 0;
  const totalChecked = num(data.totalChecked) ?? 0;

  const toLinks = (value: unknown) =>
    list(value)
      .map((entry) => {
        const node = asRecord(entry);
        const url = node ? str(node.url) : null;
        if (!url) return null;
        return {
          url,
          ok: node?.ok === true,
          status: node ? num(node.status) : null,
          error: node ? str(node.error) : null,
        };
      })
      .filter((entry): entry is { url: string; ok: boolean; status: number | null; error: string | null } => entry !== null);

  const broken = toLinks(data.broken);
  const working = toLinks(data.working);

  return (
    <div className="space-y-6">
      {scannedUrl && (
        <p className="text-sm break-all text-[var(--text-3)]">
          Scanned <span className="font-mono text-[var(--text-2)]">{scannedUrl}</span>
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Links Found" value={totalFound} color="var(--text)" />
        <StatCard label="Working" value={working.length} color="var(--green)" />
        <StatCard label="Broken" value={broken.length} color="var(--red)" />
      </div>

      {totalFound > totalChecked && (
        <p className="text-center text-xs text-[var(--text-3)]">
          Showing {totalChecked} of {totalFound} links found. The scan caps at {LINK_CAP} links.
        </p>
      )}

      <LinkTable
        title="Broken links"
        links={broken}
        tone="red"
        emptyEmoji="🎉"
        emptyMessage="No broken links found — your page is healthy!"
      />
      <LinkTable
        title="Working links"
        links={working}
        tone="green"
        emptyEmoji="📭"
        emptyMessage="No working links to display."
      />
    </div>
  );
}

/* ── Fallback for unrecognised tools ────────────────────── */

function GenericReport({ data }: { data: Json }) {
  const scalars = Object.entries(data).filter(
    ([, value]) => typeof value === "string" || typeof value === "number" || typeof value === "boolean",
  );
  const arrays = Object.entries(data).filter(([, value]) => Array.isArray(value));

  return (
    <div className="space-y-6">
      <Card title="Report Fields" icon="📄">
        {scalars.length === 0 ? (
          <EmptyBlock emoji="📭" message="No scalar fields in this report." />
        ) : (
          scalars.map(([key, value]) => (
            <MetaRow key={key} label={key} value={String(value)} />
          ))
        )}
      </Card>

      {arrays.map(([key, value]) => {
        const entries = list(value);
        return (
          <Card key={key} title={`${key} (${entries.length})`} icon="📋">
            {entries.length === 0 ? (
              <EmptyBlock emoji="📭" message={`No entries in ${key}.`} />
            ) : (
              <TableShell>
                <table className="w-full text-left text-sm">
                  <TableHead columns={[{ label: "Value" }]} />
                  <tbody className="divide-y divide-[var(--border)]">
                    {entries.map((entry, index) => (
                      <tr key={index} className="transition-colors hover:bg-[var(--bg-subtle)]">
                        <td className="px-6 py-3 font-mono text-[13px] break-all text-[var(--text-2)]">
                          {typeof entry === "string" || typeof entry === "number"
                            ? String(entry)
                            : JSON.stringify(entry)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ── Dispatch ───────────────────────────────────────────── */

export function ReportView({ toolName, data }: { toolName: string; data: unknown }) {
  const record = asRecord(data);
  if (!record) return <GenericReport data={{ value: data }} />;

  switch (toolName) {
    case "SEO Analyzer":
      return <SeoAnalyzerView data={record} />;
    case "Free SEO Report":
      return <FreeSeoReportView data={record} />;
    case "Content Extractor":
      return <ContentExtractorView data={record} />;
    case "Sitemap Extractor":
      return <SitemapExtractorView data={record} />;
    case "Broken Link Checker":
      return <BrokenLinkCheckerView data={record} />;
    default:
      return <GenericReport data={record} />;
  }
}
