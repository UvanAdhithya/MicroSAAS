import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedReports } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_REPORT_BYTES = 500_000;
const ALLOWED_TOOLS = new Set([
  "SEO Analyzer",
  "Broken Link Checker",
  "Content Extractor",
  "Sitemap Extractor",
  "Free SEO Report",
]);

const unauthorized = () => NextResponse.json({ error: "Not signed in" }, { status: 401 });

/** List the current user's saved reports (metadata only). */
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const rows = await db
    .select({
      id: savedReports.id,
      toolName: savedReports.toolName,
      reportTitle: savedReports.reportTitle,
      createdAt: savedReports.createdAt,
    })
    .from(savedReports)
    .where(eq(savedReports.userId, userId))
    .orderBy(desc(savedReports.createdAt))
    .limit(100);

  return NextResponse.json({ reports: rows });
}

/** Save a new report for the current user. */
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const raw = await request.text();
  if (raw.length > MAX_REPORT_BYTES) {
    return NextResponse.json({ error: "Report is too large to save" }, { status: 413 });
  }

  let body: { toolName?: unknown; reportTitle?: unknown; reportData?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.toolName !== "string" || !ALLOWED_TOOLS.has(body.toolName) || body.reportData == null) {
    return NextResponse.json({ error: "Invalid report payload" }, { status: 400 });
  }

  const [row] = await db
    .insert(savedReports)
    .values({
      userId,
      toolName: body.toolName,
      reportTitle: typeof body.reportTitle === "string" ? body.reportTitle.slice(0, 300) : null,
      reportData: body.reportData,
    })
    .returning({ id: savedReports.id });

  return NextResponse.json({ id: row.id }, { status: 201 });
}

/** Delete one of the current user's reports: DELETE /api/reports?id=<uuid> */
export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await db.delete(savedReports).where(and(eq(savedReports.id, id), eq(savedReports.userId, userId)));
  return NextResponse.json({ ok: true });
}
