"use client";

export function SiteHeader() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      borderBottom: "1px solid var(--border)",
      background: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto", padding: "0 24px",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/" className="nav-logo">
          <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="var(--accent)"/>
            <path d="M9 10L5.5 14L9 18M19 10L22.5 14L19 18M15.5 8L12.5 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em" }}>
            dev<span style={{ color: "var(--accent-fg)" }}>tools</span>
          </span>
        </a>

        <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <a href="/" className="nav-link">All Tools</a>
          <a href="https://github.com" className="nav-link">GitHub</a>
          <a href="/try" className="nav-cta">Try free</a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", marginTop: 80 }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto", padding: "24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <span style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "var(--mono)" }}>
          MIT License — free forever
        </span>
        <span style={{ fontSize: 13, color: "var(--text-3)" }}>
          Everything runs in your browser. Zero server calls.
        </span>
      </div>
    </footer>
  );
}
