import Link from "next/link";

/**
 * Custom 404 page — static, zero-JS, edge-cached.
 */
export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      <span
        style={{
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: "var(--border-strong)",
          lineHeight: 1,
          fontFamily: "var(--mono)",
        }}
      >
        404
      </span>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text)",
          marginTop: 12,
          letterSpacing: "-0.02em",
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "var(--text-2)",
          marginTop: 8,
          maxWidth: 380,
          lineHeight: 1.6,
        }}
      >
        The tool or page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 24,
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 600,
          background: "var(--accent)",
          color: "white",
          borderRadius: 9,
          textDecoration: "none",
          transition: "opacity 0.15s",
        }}
      >
        ← Back to all tools
      </Link>
    </div>
  );
}
