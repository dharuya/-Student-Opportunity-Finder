import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { serializeOpp } from "@/lib/opportunity-query";

/** GET /api/saved — current user's bookmarked opportunities (newest first). */
export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to see your saved opportunities." }, { status: 401 });
  }
  const rows = await db.savedOpportunity.findMany({
    where: { userId: user.id },
    include: { opportunity: true },
    orderBy: { savedAt: "desc" },
  });
  return NextResponse.json({
    items: rows.map((r) => ({ savedAt: r.savedAt.toISOString(), opportunity: serializeOpp(r.opportunity) })),
  });
}

/** POST /api/saved — bookmark an opportunity. */
export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to save opportunities." }, { status: 401 });
  }
  const b = await req.json().catch(() => null);
  const opportunityId = (b?.opportunityId ?? "").toString();
  if (!opportunityId) {
    return NextResponse.json({ error: "Missing opportunity." }, { status: 400 });
  }
  const opp = await db.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opp) {
    return NextResponse.json({ error: "This opportunity no longer exists." }, { status: 404 });
  }
  await db.savedOpportunity.upsert({
    where: { userId_opportunityId: { userId: user.id, opportunityId } },
    update: {},
    create: { userId: user.id, opportunityId },
  });
  return NextResponse.json({ ok: true, saved: true });
}

/** DELETE /api/saved?opportunityId=... — remove a bookmark. */
export async function DELETE(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }
  const opportunityId = req.nextUrl.searchParams.get("opportunityId") ?? "";
  if (!opportunityId) {
    return NextResponse.json({ error: "Missing opportunity." }, { status: 400 });
  }
  await db.savedOpportunity.deleteMany({ where: { userId: user.id, opportunityId } });
  return NextResponse.json({ ok: true, saved: false });
}
