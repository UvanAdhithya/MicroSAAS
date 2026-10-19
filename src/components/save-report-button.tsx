"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthChange, type ClientUser } from "@/lib/auth-client";

interface Props {
  toolName: string;
  data: unknown;
  title?: string;
}

/** Safely read a non-empty string field from an unknown, untrusted payload. */
function readString(source: unknown, key: string): string | null {
  if (!source || typeof source !== "object") return null;
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function deriveTitle(toolName: string, data: unknown): string {
  // Tools name their subject URL differently: most use `url`, the link
  // checker uses `scannedUrl`, and the sitemap extractor only has a list.
  const direct = readString(data, "url") ?? readString(data, "scannedUrl");
  if (direct) return `${toolName}: ${direct}`;

  const urls = data && typeof data === "object" ? (data as Record<string, unknown>).urls : null;
  if (Array.isArray(urls)) {
    const first = readString(urls[0], "url");
    if (first) return `${toolName}: ${first}`;
  }

  return `${toolName} report`;
}

/** Saves the current tool result to the signed-in user's dashboard. */
export function SaveReportButton({ toolName, data, title }: Props) {
  const [user, setUser] = useState<ClientUser | null | undefined>(undefined);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [lastData, setLastData] = useState(data);

  useEffect(() => onAuthChange(setUser), []);
  if (lastData !== data) {
    setLastData(data);
    setState("idle");
  }

  if (user === undefined) return null;

  const wrap: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12,
    margin: "16px 0", fontSize: 14, color: "var(--text-3)",
  };

  if (!user) {
    return (
      <div style={wrap}>
        <span><Link href="/signup" style={{ color: "var(--accent-fg)", fontWeight: 600 }}>Create a free account</Link> to save this report.</span>
      </div>
    );
  }

  const save = async () => {
    setState("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName, reportTitle: title ?? deriveTitle(toolName, data), reportData: data }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to save");
      setState("saved");
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "Failed to save");
    }
  };

  return (
    <div style={wrap}>
      {state === "error" && <span style={{ color: "#dc2626" }}>{message}</span>}
      {state === "saved" ? (
        <span>Saved ✓ <Link href="/dashboard" style={{ color: "var(--accent-fg)", fontWeight: 600 }}>View in dashboard</Link></span>
      ) : (
        <button type="button" className="nav-cta" style={{ border: "none", cursor: "pointer" }} onClick={save} disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Save report"}
        </button>
      )}
    </div>
  );
}
