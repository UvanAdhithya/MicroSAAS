"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, signOutUser, type ClientUser } from '@/lib/auth-client';

function UserMenu() {
  const [user, setUser] = useState<ClientUser | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => onAuthChange(setUser), []);

  // undefined = still loading; render nothing to avoid a flash of wrong state
  if (user === undefined) return <span style={{ width: 150 }} />;

  if (!user) {
    return (
      <>
        <Link href="/login" className="nav-link" style={{ fontWeight: 600 }}>Sign In</Link>
        <Link href="/signup" className="nav-cta">Try free</Link>
      </>
    );
  }

  return (
    <>
      <Link href="/dashboard" className="nav-link" style={{ fontWeight: 600 }}>Dashboard</Link>
      <span className="nav-link" title={user.email ?? ''} style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {user.email}
      </span>
      <button
        type="button"
        className="nav-cta"
        style={{ border: "none", cursor: "pointer" }}
        onClick={async () => {
          await signOutUser();
          router.push('/');
          router.refresh();
        }}
      >
        Sign out
      </button>
    </>
  );
}

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
        <Link href="/" className="nav-logo" aria-label="SEOSnap home">
          <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="var(--accent)" />
            <circle cx="12.5" cy="12.5" r="5.5" stroke="white" strokeWidth="2" />
            <path d="M16.5 16.5L21 21" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em" }}>
            seo<span style={{ color: "var(--accent-fg)" }}>snap</span>
          </span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" className="nav-link">All Tools</Link>
          <a href="https://github.com/UvanAdhithya/MicroSAAS" className="nav-link">GitHub</a>
          <UserMenu />
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
          © {new Date().getFullYear()} SEOSnap · seosnap.xyz
        </span>
        <span style={{ fontSize: 13, color: "var(--text-3)" }}>
          Free SEO tools. Sign up to save reports.
        </span>
      </div>
    </footer>
  );
}
