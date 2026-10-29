import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, requireAdmin } from "@/lib/auth";
import { getSavedIds, isExpired, serializeOpp } from "@/lib/opportunity-query";
import { VERIFICATION_STATUSES } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

/** GET /api/opportunities/[id] — full detail incl. "saved by me". */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const opp = await db.opportunity.findUnique({ where: { id } });
    if (!opp) {
      return NextResponse.json({ error: "This opportunity could not be found. It may have been removed." }, { status: 404 });
    }
    const user = await getSessionUser();
    let savedByMe = false;
    if (user) {
      const saved = await db.savedOpportunity.findUnique({
        where: { userId_opportunityId: { userId: user.id, opportunityId: id } },
      });
      savedByMe = Boolean(saved);
    }
    const serialized = serializeOpp(opp);
    return NextResponse.json({
      opportunity: serialized,
      savedByMe,
      computedExpired: isExpired(serialized),
    });
  } catch (e) {
    console.error("opportunity GET error", e);
    return NextResponse.json({ error: "Could not load this opportunity." }, { status: 500 });
  }
}

/** PUT /api/opportunities/[id] — admin only: edit or change verification status. */
export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Only administrators can edit listings." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const existing = await db.opportunity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    const b = await req.json().catch(() => null);

    // Explicit verification action: { markVerified: true } or { setStatus: "EXPIRED" | "UNVERIFIED" }
    const data: Record<string, unknown> = {};
    if (b?.markVerified === true) {
      data.verificationStatus = "VERIFIED";
      data.lastVerifiedAt = new Date();
    } else if (typeof b?.setStatus === "string") {
      if (!VERIFICATION_STATUSES.includes(b.setStatus)) {
        return NextResponse.json({ error: "Invalid verification status." }, { status: 400 });
      }
      data.verificationStatus = b.setStatus;
      if (b.setStatus === "VERIFIED") data.lastVerifiedAt = new Date();
    } else {
      // Full/partial edit
      const strFields = [
        "title", "category", "provider", "sourceType", "description", "eligibility",
        "benefits", "requiredDocuments", "location", "costType", "minEducation",
        "fields", "skillsRequired", "officialUrl", "verificationStatus",
      ] as const;
      for (const f of strFields) {
        if (typeof b?.[f] === "string" && b[f].trim().length > 0) data[f] = b[f].trim();
      }
      if (b?.deadline !== undefined) {
        if (b.deadline === null || b.deadline === "") data.deadline = null;
        else {
          const d = new Date(String(b.deadline));
          if (isNaN(d.getTime())) {
            return NextResponse.json({ error: "Invalid deadline date." }, { status: 400 });
          }
          data.deadline = d;
        }
      }
      if (data.verificationStatus === "VERIFIED" && existing.verificationStatus !== "VERIFIED") {
        data.lastVerifiedAt = new Date();
      }
      if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
      }
    }

    const updated = await db.opportunity.update({ where: { id }, data });
    return NextResponse.json({ opportunity: serializeOpp(updated) });
  } catch (e) {
    console.error("opportunity PUT error", e);
    return NextResponse.json({ error: "Could not update this listing." }, { status: 500 });
  }
}

/** DELETE /api/opportunities/[id] — admin only. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Only administrators can remove listings." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const existing = await db.opportunity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    await db.savedOpportunity.deleteMany({ where: { opportunityId: id } });
    await db.opportunity.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("opportunity DELETE error", e);
    return NextResponse.json({ error: "Could not remove this listing." }, { status: 500 });
  }
}
