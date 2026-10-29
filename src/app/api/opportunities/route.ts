import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, requireAdmin } from "@/lib/auth";
import {
  applyFilters,
  getSavedIds,
  loadAllOpportunities,
  parseFilters,
  serializeOpp,
} from "@/lib/opportunity-query";
import { CATEGORIES, VERIFICATION_STATUSES, EDUCATION_LEVELS, COST_TYPE_LABELS, SOURCE_TYPE_LABELS } from "@/lib/types";

/** GET /api/opportunities — search, filter, sort and paginate listings. */
export async function GET(req: NextRequest) {
  try {
    const filters = parseFilters(req.nextUrl.searchParams);
    const all = await loadAllOpportunities();

    let savedIds = new Set<string>();
    if (filters.savedOnly) {
      const user = await getSessionUser();
      if (!user) {
        return NextResponse.json({ error: "Please sign in to see your saved opportunities." }, { status: 401 });
      }
      savedIds = await getSavedIds(user.id);
    }

    const filtered = applyFilters(all, filters, savedIds);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
    const page = Math.min(filters.page, totalPages);
    const items = filtered.slice((page - 1) * filters.pageSize, page * filters.pageSize);

    return NextResponse.json({
      items: items.map(serializeOpp),
      total,
      page,
      pageSize: filters.pageSize,
      totalPages,
    });
  } catch (e) {
    console.error("opportunities GET error", e);
    return NextResponse.json({ error: "Could not load opportunities right now. Please refresh." }, { status: 500 });
  }
}

const URL_RE = /^https?:\/\/.+\..+/;

/** POST /api/opportunities — admin only: create a listing. */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Only administrators can add listings." }, { status: 403 });
  }
  try {
    const b = await req.json().catch(() => null);
    const errors: Record<string, string> = {};
    const title = (b?.title ?? "").toString().trim();
    const category = (b?.category ?? "").toString();
    const provider = (b?.provider ?? "").toString().trim();
    const sourceType = (b?.sourceType ?? "").toString();
    const description = (b?.description ?? "").toString().trim();
    const eligibility = (b?.eligibility ?? "").toString().trim();
    const benefits = (b?.benefits ?? "").toString().trim();
    const requiredDocuments = (b?.requiredDocuments ?? "").toString().trim();
    const location = (b?.location ?? "All India").toString().trim();
    const costType = (b?.costType ?? "NOT_APPLICABLE").toString();
    const minEducation = (b?.minEducation ?? "ANY").toString();
    const fields = (b?.fields ?? "").toString().trim();
    const skillsRequired = (b?.skillsRequired ?? "").toString().trim();
    const officialUrl = (b?.officialUrl ?? "").toString().trim();
    const verificationStatus = (b?.verificationStatus ?? "UNVERIFIED").toString();
    const deadlineRaw = (b?.deadline ?? "").toString().trim();

    if (title.length < 5) errors.title = "Title must be at least 5 characters.";
    if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) errors.category = "Choose a valid category.";
    if (provider.length < 2) errors.provider = "Provider / organisation name is required.";
    if (!SOURCE_TYPE_LABELS[sourceType]) errors.sourceType = "Choose a valid source type.";
    if (description.length < 20) errors.description = "Description must be at least 20 characters.";
    if (eligibility.length < 10) errors.eligibility = "Eligibility details are required (at least 10 characters).";
    if (benefits.length < 5) errors.benefits = "Benefits are required.";
    if (!URL_RE.test(officialUrl)) errors.officialUrl = "Enter a valid official URL starting with https://";
    if (!EDUCATION_LEVELS.includes(minEducation as (typeof EDUCATION_LEVELS)[number])) errors.minEducation = "Choose a valid education level.";
    if (!(costType in COST_TYPE_LABELS)) errors.costType = "Choose a valid cost type.";
    if (!VERIFICATION_STATUSES.includes(verificationStatus as (typeof VERIFICATION_STATUSES)[number])) errors.verificationStatus = "Invalid verification status.";
    let deadline: Date | null = null;
    if (deadlineRaw) {
      const d = new Date(deadlineRaw);
      if (isNaN(d.getTime())) errors.deadline = "Invalid deadline date.";
      else deadline = d;
    }
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Please fix the highlighted fields.", errors }, { status: 400 });
    }

    const created = await db.opportunity.create({
      data: {
        title, category, provider, sourceType, description, eligibility, benefits,
        requiredDocuments, location, costType, minEducation, fields, skillsRequired,
        deadline, officialUrl, verificationStatus,
        lastVerifiedAt: verificationStatus === "VERIFIED" ? new Date() : new Date(),
      },
    });
    return NextResponse.json({ opportunity: serializeOpp(created) }, { status: 201 });
  } catch (e) {
    console.error("opportunities POST error", e);
    return NextResponse.json({ error: "Could not create the listing right now." }, { status: 500 });
  }
}
