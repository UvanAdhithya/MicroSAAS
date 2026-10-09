import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedReports } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/dashboard");
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [report] = await db
    .select()
    .from(savedReports)
    .where(and(eq(savedReports.id, id), eq(savedReports.userId, userId)))
    .limit(1);

  if (!report) notFound();

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "48px 24px" }}>
      <Link href="/dashboard" style={{ color: "var(--accent-fg)", fontSize: 14 }}>← Back to dashboard</Link>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "16px 0 4px" }}>{report.reportTitle ?? report.toolName}</h1>
      <p style={{ color: "var(--text-3)", marginBottom: 24, fontSize: 14 }}>
        {report.toolName} · {report.createdAt.toLocaleString("en-IN")}
      </p>
      <pre style={{ background: "var(--surface, #f6f6f7)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, overflow: "auto", fontSize: 13, fontFamily: "var(--mono)", maxHeight: "70vh" }}>
        {JSON.stringify(report.reportData, null, 2)}
      </pre>
    </div>
  );
}
