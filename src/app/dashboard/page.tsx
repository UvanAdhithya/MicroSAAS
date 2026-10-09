import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedReports } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { DeleteReportButton } from "./delete-button";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  let reports: { id: string; toolName: string; reportTitle: string | null; createdAt: Date }[] = [];
  let dbError = false;
  try {
    reports = await db
      .select({
        id: savedReports.id,
        toolName: savedReports.toolName,
        reportTitle: savedReports.reportTitle,
        createdAt: savedReports.createdAt,
      })
      .from(savedReports)
      .where(eq(savedReports.userId, user.id))
      .orderBy(desc(savedReports.createdAt))
      .limit(100);
  } catch (e) {
    console.error("Dashboard DB error:", e);
    dbError = true;
  }

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Your dashboard</h1>
      <p style={{ color: "var(--text-3)", marginBottom: 32 }}>Signed in as {user.email}</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Saved reports</h2>

      {dbError && (
        <p style={{ color: "#dc2626" }}>Couldn&apos;t load your reports right now. Please try again later.</p>
      )}

      {!dbError && reports.length === 0 && (
        <div style={{ border: "1px dashed var(--border)", borderRadius: 12, padding: 32, textAlign: "center", color: "var(--text-3)" }}>
          No saved reports yet. Run any <Link href="/" style={{ color: "var(--accent-fg)", fontWeight: 600 }}>SEO tool</Link> and click
          &nbsp;<strong>Save report</strong>.
        </div>
      )}

      {reports.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {reports.map((r) => (
            <li key={r.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <Link href={`/dashboard/reports/${r.id}`}>{r.reportTitle ?? r.toolName}</Link>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-3)" }}>
                  {r.toolName} · {new Date(r.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
              <DeleteReportButton id={r.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
