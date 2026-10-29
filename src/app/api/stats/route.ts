import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { daysUntil, isExpired, loadAllOpportunities } from "@/lib/opportunity-query";
import { CATEGORIES } from "@/lib/types";

/** GET /api/stats — platform-wide counts for the home page & admin dashboard. */
export async function GET() {
  try {
    const all = await loadAllOpportunities();
    const byCategory: Record<string, number> = {};
    for (const c of CATEGORIES) byCategory[c] = 0;
    let verified = 0;
    let unverified = 0;
    let expired = 0;
    let closingSoon = 0;
    let lastUpdated = new Date(0);

    for (const o of all) {
      byCategory[o.category] = (byCategory[o.category] ?? 0) + 1;
      if (o.updatedAt > lastUpdated) lastUpdated = o.updatedAt;
      if (isExpired(o)) {
        expired += 1;
        continue;
      }
      if (o.verificationStatus === "VERIFIED") verified += 1;
      else if (o.verificationStatus === "UNVERIFIED") unverified += 1;
      if (o.deadline) {
        const days = daysUntil(o.deadline);
        if (days >= 0 && days <= 7) closingSoon += 1;
      }
    }

    return NextResponse.json({
      total: all.length,
      verified,
      unverified,
      expired,
      closingSoon,
      byCategory,
      lastUpdated: lastUpdated.toISOString(),
    });
  } catch (e) {
    console.error("stats error", e);
    return NextResponse.json({ error: "Could not load platform statistics." }, { status: 500 });
  }
}
