import { ImageResponse } from "next/og";

/* ─────────────────────────────────────────────────────────
 * Shared renderer for OpenGraph images.
 * ─────────────────────────────────────────────────────────
 * Used by the site-wide image at src/app/opengraph-image.tsx
 * and by the per-tool images at src/app/tools/<tool>/opengraph-image.tsx.
 *
 * Satori, the renderer behind ImageResponse, supports only a
 * subset of flexbox CSS: no CSS variables, no class names, and
 * every container needs an explicit `display: flex`. Colors are
 * therefore written out here rather than read from globals.css,
 * and the palette below must be kept in step with it by hand.
 * ───────────────────────────────────────────────────────── */

/* Route files declare `size` and `contentType` as inline literals rather than
 * importing them, so Next.js can read those values statically for the
 * og:image:width and og:image:height meta tags. */
const SIZE = { width: 1200, height: 630 };

const ACCENT = "#5B21B6";
const INK = "#18181B";
const BODY = "#45454F";
const MUTED = "#6E6E7E";
const CHIP_BG = "#F5F5F8";
const CHIP_BORDER = "#E4E4EC";

type OgImageOptions = {
  /** Small uppercase label above the headline. */
  eyebrow?: string;
  /** Headline, rendered in ink. */
  title: string;
  /** Optional second headline line, rendered in the accent colour. */
  titleAccent?: string;
  /** Supporting sentence under the headline. */
  subtitle?: string;
  /** Short feature labels rendered as pills. */
  chips?: string[];
  /** Left-hand footer text. */
  footnote?: string;
};

export function renderOgImage({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  chips = [],
  footnote,
}: OgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FFFFFF",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 54,
              height: 54,
              borderRadius: 15,
              background: ACCENT,
              color: "#FFFFFF",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ display: "flex", marginLeft: 18, fontSize: 31, fontWeight: 700, color: INK }}>
            SEOSnap
          </div>
        </div>

        {eyebrow ? (
          <div
            style={{
              display: "flex",
              marginTop: 40,
              fontSize: 21,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            {eyebrow}
          </div>
        ) : null}

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: eyebrow ? 14 : 46,
          }}
        >
          <div style={{ display: "flex", fontSize: 62, fontWeight: 800, color: INK, lineHeight: 1.1 }}>
            {title}
          </div>
          {titleAccent ? (
            <div style={{ display: "flex", fontSize: 62, fontWeight: 800, color: ACCENT, lineHeight: 1.1 }}>
              {titleAccent}
            </div>
          ) : null}
        </div>

        {subtitle ? (
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 25,
              color: BODY,
              lineHeight: 1.45,
              maxWidth: 900,
            }}
          >
            {subtitle}
          </div>
        ) : null}

        {/* Feature pills */}
        {chips.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 30 }}>
            {chips.map((chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  marginRight: 12,
                  marginBottom: 12,
                  padding: "10px 19px",
                  borderRadius: 999,
                  background: CHIP_BG,
                  border: `1px solid ${CHIP_BORDER}`,
                  color: BODY,
                  fontSize: 21,
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        ) : null}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", fontSize: 23, color: MUTED }}>{footnote ?? "No signup required"}</div>
          <div style={{ display: "flex", fontSize: 23, fontWeight: 600, color: ACCENT }}>seosnap.xyz</div>
        </div>
      </div>
    ),
    { ...SIZE }
  );
}
