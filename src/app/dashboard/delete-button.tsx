"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteReportButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!confirm("Delete this report?")) return;
        setBusy(true);
        await fetch(`/api/reports?id=${id}`, { method: "DELETE" });
        router.refresh();
      }}
      style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "var(--text-3)", fontSize: 13 }}
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
