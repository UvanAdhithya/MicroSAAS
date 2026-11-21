import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedReports } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { ReportView } from "./report-views";
import { ExportPdfButton } from "./export-pdf-button";

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

  // A filesystem-safe name. The tool name is the useful discriminator in a
  // folder of exports; reportTitle usually contains a whole URL.
  const pdfFilename = `SEOSnap-${report.toolName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}-${new Date(report.createdAt).toISOString().slice(0, 10)}.pdf`;

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <Link href="/dashboard" style={{ color: "var(--accent-fg)", fontSize: 14 }}>← Back to dashboard</Link>
        <ExportPdfButton filename={pdfFilename} />
      </div>

      {/* The PDF captures exactly this element, so the toolbar above and the
          raw JSON below stay out of the exported file. */}
      <div id="report-root" style={{ marginTop: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>{report.reportTitle ?? report.toolName}</h1>
        <p style={{ color: "var(--text-3)", marginBottom: 32, fontSize: 14 }}>
          {report.toolName} · {report.createdAt.toLocaleString("en-IN")}
        </p>

        <ReportView toolName={report.toolName} data={report.reportData} />
      </div>

      {/* Escape hatch: report_data is untyped jsonb, so keep the exact payload
          reachable for fields the structured views above don't surface. */}
      <details style={{ marginTop: 32 }}>
        <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>
          Raw JSON
        </summary>
        <pre style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, overflow: "auto", fontSize: 13, fontFamily: "var(--mono)", maxHeight: "70vh", marginTop: 12 }}>
          {JSON.stringify(report.reportData, null, 2)}
        </pre>
      </details>
    </div>
  );
}
