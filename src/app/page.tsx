"use client";
import { useState, useEffect } from "react";

/* ─── Types ─────────────────────────────────────────── */
type Category = "all" | "data" | "text" | "encoding" | "security" | "generators" | "design";

type Tool = {
  slug: string;
  name: string;
  description: string;
  category: Exclude<Category, "all">;
  badge?: "popular" | "new";
  Widget: () => React.JSX.Element;
};

/* ─── Inline widget components ───────────────────────── */

function JsonWidget() {
  const [val, setVal] = useState(`{"name":"Alice","age":30,"active":true}`);
  let pretty = "";
  let error = "";
  try { pretty = JSON.stringify(JSON.parse(val), null, 2); }
  catch (e) { error = (e as Error).message; }
  return (
    <WidgetShell>
      <textarea suppressHydrationWarning
        value={val}
        onChange={e => setVal(e.target.value)}
        style={{
          width: "100%", height: 52, resize: "none", fontSize: 11,
          fontFamily: "var(--mono)", background: "var(--bg-subtle)",
          border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px",
          color: "var(--text)", outline: "none",
        }}
      />
      {error
        ? <div style={{ fontSize: 11, color: "var(--red)", fontFamily: "var(--mono)", marginTop: 4 }}>✗ {error}</div>
        : <pre style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--green)", margin: "4px 0 0", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{pretty}</pre>
      }
    </WidgetShell>
  );
}

function RegexWidget() {
  const [pattern, setPattern] = useState("\\b\\w{4}\\b");
  const [text, setText] = useState("The quick brown fox jumps over a lazy dog");
  let highlighted: React.ReactNode = text;
  let matchCount = 0;
  try {
    const re = new RegExp(pattern, "g");
    const parts: React.ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push(<mark key={m.index} style={{ background: "#FBBF24", color: "#18181B", borderRadius: 2, padding: "0 1px" }}>{m[0]}</mark>);
      last = m.index + m[0].length;
      matchCount++;
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    if (last < text.length) parts.push(text.slice(last));
    highlighted = parts;
  } catch { }
  return (
    <WidgetShell>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-3)", padding: "4px 6px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "6px 0 0 6px", userSelect: "none" }}>/</span>
        <input suppressHydrationWarning value={pattern} onChange={e => setPattern(e.target.value)}
          style={{ flex: 1, fontSize: 11, fontFamily: "var(--mono)", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "0 6px 6px 0", padding: "4px 6px", color: "var(--text)", outline: "none" }} />
        <span style={{ fontSize: 10, color: "var(--text-3)", padding: "4px 6px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 6, fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>{matchCount} match{matchCount !== 1 ? "es" : ""}</span>
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.6, padding: "6px 8px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 6 }}>{highlighted}</div>
    </WidgetShell>
  );
}

function Base64Widget() {
  const [input, setInput] = useState("Hello, world!");
  const encoded = btoa(unescape(encodeURIComponent(input)));
  return (
    <WidgetShell>
      <input suppressHydrationWarning value={input} onChange={e => setInput(e.target.value)}
        placeholder="Type something…"
        style={{ width: "100%", fontSize: 12, padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text)", outline: "none", marginBottom: 6 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)", flexShrink: 0 }}>b64</span>
        <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--accent-fg)", background: "var(--accent-light)", borderRadius: 6, padding: "5px 8px", flex: 1, wordBreak: "break-all" }}>{encoded}</div>
      </div>
    </WidgetShell>
  );
}

function UuidWidget() {
  function genUuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  const [uuids, setUuids] = useState<string[]>([]);
  useEffect(() => { setUuids([genUuid()]); }, []);
  return (
    <WidgetShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
        {uuids.slice(-3).map((u, i) => (
          <div key={i} style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: "var(--text-2)", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 5, padding: "4px 8px", letterSpacing: "0.02em" }}>{u}</div>
        ))}
      </div>
      <button onClick={() => setUuids(p => [...p, genUuid()])}
        style={{ fontSize: 12, fontWeight: 600, color: "white", background: "var(--accent)", border: "none", borderRadius: 7, padding: "6px 14px", cursor: "pointer" }}>
        + Generate
      </button>
    </WidgetShell>
  );
}

function JwtWidget() {
  const demo = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJBbGljZSIsImV4cCI6MTcxOTk5OTk5OX0.sig";
  const [token, setToken] = useState(demo);
  let header = null; let payload = null;
  try {
    const parts = token.split(".");
    header = JSON.parse(atob(parts[0]));
    payload = JSON.parse(atob(parts[1]));
  } catch { }
  return (
    <WidgetShell>
      <input suppressHydrationWarning value={token} onChange={e => setToken(e.target.value)}
        style={{ width: "100%", fontSize: 10, fontFamily: "var(--mono)", padding: "5px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text)", outline: "none", marginBottom: 6 }} />
      {payload && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {[["header", header], ["payload", payload]].map(([label, obj]) => (
            <div key={String(label)} style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 8px" }}>
              <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--text-3)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{String(label)}</div>
              <pre style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text)", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{JSON.stringify(obj, null, 1)}</pre>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}

function HashWidget() {
  const [input, setInput] = useState("hello");
  // Deterministic fake hash for demo (real SHA needs Web Crypto async)
  function fakeHash(s: string, len: number) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) >>> 0;
    const base = h.toString(16).padStart(8, "0");
    return (base.repeat(Math.ceil(len / 8))).slice(0, len);
  }
  const hashes = [
    { label: "MD5", value: fakeHash(input, 32) },
    { label: "SHA-1", value: fakeHash(input + "1", 40) },
    { label: "SHA-256", value: fakeHash(input + "256", 64) },
  ];
  return (
    <WidgetShell>
      <input suppressHydrationWarning value={input} onChange={e => setInput(e.target.value)} placeholder="Input string"
        style={{ width: "100%", fontSize: 12, padding: "5px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text)", outline: "none", marginBottom: 6 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {hashes.map(h => (
          <div key={h.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--text-3)", width: 40, flexShrink: 0, textTransform: "uppercase" }}>{h.label}</span>
            <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--blue)", background: "var(--blue-light)", borderRadius: 4, padding: "2px 6px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.value}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

function ColorWidget() {
  const [hex, setHex] = useState("#5B21B6");
  function hexToRgb(h: string) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
  }
  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  return (
    <WidgetShell>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <input suppressHydrationWarning type="color" value={hex} onChange={e => setHex(e.target.value)}
          style={{ width: 40, height: 40, border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", padding: 2, background: "var(--bg-subtle)" }} />
        <input suppressHydrationWarning value={hex} onChange={e => setHex(e.target.value)}
          style={{ fontFamily: "var(--mono)", fontSize: 14, padding: "6px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text)", outline: "none", width: 90 }} />
      </div>
      {rgb && hsl && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[
            { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
            { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--text-3)", width: 28, textTransform: "uppercase" }}>{row.label}</span>
              <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-2)" }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}

function DiffWidget() {
  const a = "The quick brown fox";
  const b = "The slow brown wolf";
  const wordsA = a.split(" "), wordsB = b.split(" ");
  return (
    <WidgetShell>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[{ words: wordsA, other: wordsB, color: "var(--red)", bg: "var(--red-light)", label: "Before" },
        { words: wordsB, other: wordsA, color: "var(--green)", bg: "var(--green-light)", label: "After" }].map(({ words, other, color, bg, label }) => (
          <div key={label}>
            <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, padding: "6px 8px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 6 }}>
              {words.map((w, i) => (
                <span key={i}>{i > 0 ? " " : ""}{!other.includes(w) ? <span style={{ background: bg, color, borderRadius: 3, padding: "0 2px" }}>{w}</span> : w}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

function UrlWidget() {
  const [input, setInput] = useState("Hello World! <special> chars: &=?#");
  const encoded = encodeURIComponent(input);
  return (
    <WidgetShell>
      <input suppressHydrationWarning value={input} onChange={e => setInput(e.target.value)}
        style={{ width: "100%", fontSize: 12, padding: "6px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text)", outline: "none", marginBottom: 6 }} />
      <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--amber)", background: "var(--amber-light)", borderRadius: 6, padding: "6px 8px", wordBreak: "break-all", lineHeight: 1.5 }}>{encoded}</div>
    </WidgetShell>
  );
}

function CronWidget() {
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const descriptions: Record<string, string> = {
    "0 9 * * 1-5": "Every weekday at 9:00 AM",
    "*/5 * * * *": "Every 5 minutes",
    "0 0 * * *": "Daily at midnight",
    "0 0 1 * *": "First of every month",
    "@hourly": "Every hour",
  };
  const desc = descriptions[expr] ?? "Custom schedule";
  const nexts = ["Mon Jun 16 09:00", "Tue Jun 17 09:00", "Wed Jun 18 09:00"];
  return (
    <WidgetShell>
      <input suppressHydrationWarning value={expr} onChange={e => setExpr(e.target.value)}
        style={{ width: "100%", fontFamily: "var(--mono)", fontSize: 13, padding: "6px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text)", outline: "none", marginBottom: 6 }} />
      <div style={{ fontSize: 12, color: "var(--accent-fg)", fontWeight: 500, marginBottom: 6 }}>{desc}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {nexts.map((t, i) => (
          <div key={i} style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-3)", display: "flex", gap: 8 }}>
            <span style={{ color: "var(--text-3)" }}>#{i + 1}</span>
            <span style={{ color: "var(--text-2)" }}>{t}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

/* ─── Shared widget shell ──────────────────────────── */
function WidgetShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-raised)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 12, marginBottom: 2,
    }}>
      {children}
    </div>
  );
}

/* ─── Tool list ──────────────────────────────────────── */
const tools: Tool[] = [
  { slug: "json-formatter", name: "JSON Formatter", description: "Validate, pretty-print, and minify JSON. Pinpoints syntax errors with line numbers.", category: "data", badge: "popular", Widget: JsonWidget },
  { slug: "regex-tester", name: "Regex Tester", description: "Live regex matching with per-match highlights. Supports JS, Python, and PCRE flavors.", category: "text", badge: "popular", Widget: RegexWidget },
  { slug: "base64", name: "Base64 Encode / Decode", description: "Encode strings and binary files to Base64, or decode them back instantly.", category: "encoding", Widget: Base64Widget },
  { slug: "uuid-generator", name: "UUID Generator", description: "Generate v4 UUIDs on demand. Copy individually or bulk-export thousands.", category: "generators", badge: "new", Widget: UuidWidget },
  { slug: "jwt-debugger", name: "JWT Debugger", description: "Decode JWT headers and payloads. Verify signatures client-side — tokens never leave your browser.", category: "security", badge: "popular", Widget: JwtWidget },
  { slug: "hash-generator", name: "Hash Generator", description: "Compute MD5, SHA-1, SHA-256, and SHA-512 hashes for any string or uploaded file.", category: "security", Widget: HashWidget },
  { slug: "color-converter", name: "Color Converter", description: "Convert between HEX, RGB, HSL, and OKLCH. Visual picker included.", category: "design", Widget: ColorWidget },
  { slug: "diff-viewer", name: "Text Diff", description: "Side-by-side or inline diff of any two text blocks. Word and character-level modes.", category: "text", badge: "new", Widget: DiffWidget },
  { slug: "url-encoder", name: "URL Encoder", description: "Percent-encode or decode URL components. Handles all special characters correctly.", category: "encoding", Widget: UrlWidget },
  { slug: "cron-parser", name: "Cron Parser", description: "Translate cron expressions to plain English and preview the next 10 scheduled runs.", category: "data", Widget: CronWidget },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "data", label: "Data" },
  { id: "text", label: "Text" },
  { id: "encoding", label: "Encoding" },
  { id: "security", label: "Security" },
  { id: "generators", label: "Generators" },
  { id: "design", label: "Design" },
];

const CAT_COLOR: Record<string, string> = {
  data: "#D97706", text: "#2563EB", encoding: "#7C3AED",
  security: "#DC2626", generators: "#16A34A", design: "#DB2777",
};

/* ─── Page ───────────────────────────────────────────── */
export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<Category>("all");
  const [query, setQuery] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const visible = tools.filter(t => {
    const catOk = active === "all" || t.category === active;
    const q = query.toLowerCase();
    const searchOk = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.includes(q);
    return catOk && searchOk;
  });

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
      {/* ── Hero ── */}
      <div style={{ paddingTop: 56, paddingBottom: 40, borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
          Free tools
        </p>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08, color: "var(--text)", margin: "0 0 14px", maxWidth: 560 }}>
          Developer utilities<br />
          <span style={{ color: "var(--accent-fg)" }}>that respect your time.</span>
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.6, maxWidth: 440, margin: 0 }}>
          {tools.length} tools. No login. No ads. Everything runs in your browser.
        </p>
      </div>

      {/* ── Controls ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "0 0 220px" }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input suppressHydrationWarning value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tools…"
            style={{ width: "100%", fontSize: 13.5, padding: "8px 10px 8px 30px", border: "1px solid var(--border)", borderRadius: 9, background: "var(--bg-subtle)", color: "var(--text)", outline: "none", transition: "border-color 0.15s" }}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActive(c.id)}
              style={{
                padding: "6px 13px", fontSize: 13, fontWeight: active === c.id ? 600 : 450,
                borderRadius: 99, border: "1px solid",
                borderColor: active === c.id ? "var(--accent)" : "var(--border)",
                background: active === c.id ? "var(--accent)" : "transparent",
                color: active === c.id ? "white" : "var(--text-2)",
                cursor: "pointer", transition: "all 0.15s",
              }}>{c.label}</button>
          ))}
        </div>

        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-3)", fontFamily: "var(--mono)" }}>
          {visible.length}/{tools.length}
        </span>
      </div>

      {/* ── Grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 16,
        paddingBottom: 64,
      }}>
        {visible.map(tool => <ToolCard key={tool.slug} tool={tool} />)}
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const [hovered, setHovered] = useState(false);
  const accent = CAT_COLOR[tool.category] ?? "#6B6B6A";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-raised)",
        border: "1px solid",
        borderColor: hovered ? "var(--border-strong)" : "var(--border)",
        borderRadius: 14,
        padding: "18px 18px 14px",
        display: "flex", flexDirection: "column", gap: 10,
        boxShadow: hovered ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        transition: "box-shadow 0.2s, border-color 0.2s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        cursor: "default",
      }}
    >
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.02em", color: "var(--text)", margin: "0 0 3px" }}>{tool.name}</h2>
          <p style={{ fontSize: 12.5, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>{tool.description}</p>
        </div>
      </div>

      {/* Tags row */}
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <span style={{
          fontSize: 10, fontFamily: "var(--mono)", padding: "2px 7px",
          borderRadius: 99, border: `1px solid ${accent}22`,
          color: accent, background: accent + "12",
          letterSpacing: "0.03em", textTransform: "lowercase",
        }}>{tool.category}</span>
        {tool.badge && (
          <span style={{
            fontSize: 10, fontFamily: "var(--mono)", padding: "2px 7px", borderRadius: 99,
            ...(tool.badge === "new"
              ? { background: "var(--green-light)", color: "var(--green)", border: "1px solid #16A34A22" }
              : { background: "var(--amber-light)", color: "var(--amber)", border: "1px solid #D9770622" }),
          }}>{tool.badge}</span>
        )}
      </div>

      {/* Live widget */}
      <tool.Widget />

      {/* CTA */}
      <a href={`/tools/${tool.slug}`} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        padding: "9px 0", fontSize: 13.5, fontWeight: 600,
        color: "white", background: "var(--accent)", borderRadius: 9,
        textDecoration: "none", transition: "opacity 0.15s",
        opacity: hovered ? 1 : 0.88,
      }}>
        Open tool
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}
