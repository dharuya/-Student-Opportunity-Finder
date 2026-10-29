/** Shared server-side opportunity query/filter logic (SQLite lacks case-insensitive contains). */
import { db } from "@/lib/db";
import { EDUCATION_RANK } from "@/lib/types";
import { parseList } from "@/lib/format";
import type { OpportunityDTO } from "@/lib/types";

export type OppRecord = {
  id: string;
  title: string;
  category: string;
  provider: string;
  sourceType: string;
  description: string;
  eligibility: string;
  benefits: string;
  requiredDocuments: string;
  location: string;
  costType: string;
  minEducation: string;
  fields: string;
  skillsRequired: string;
  deadline: Date | null;
  officialUrl: string;
  verificationStatus: string;
  lastVerifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeOpp(o: OppRecord): OpportunityDTO {
  return {
    ...o,
    deadline: o.deadline ? o.deadline.toISOString() : null,
    lastVerifiedAt: o.lastVerifiedAt.toISOString(),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

export function isExpired(o: { deadline: string | Date | null; verificationStatus: string }): boolean {
  if (o.verificationStatus === "EXPIRED") return true;
  if (!o.deadline) return false;
  const d = typeof o.deadline === "string" ? new Date(o.deadline) : o.deadline;
  return d.getTime() < Date.now();
}

export function daysUntil(date: string | Date): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return Math.ceil((d.getTime() - endOfToday.getTime()) / (1000 * 60 * 60 * 24));
}

export interface OpportunityFilters {
  q?: string;
  category?: string;
  education?: string;
  field?: string;
  location?: string;
  cost?: string;
  status?: string;
  deadlineWithin?: number;
  savedOnly?: boolean;
  showExpired?: boolean;
  sort?: string;
  page: number;
  pageSize: number;
}

export function parseFilters(sp: URLSearchParams): OpportunityFilters {
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(sp.get("pageSize") ?? "9", 10) || 9));
  const dwRaw = sp.get("deadlineWithin");
  return {
    q: sp.get("q")?.trim() || undefined,
    category: sp.get("category") || undefined,
    education: sp.get("education") || undefined,
    field: sp.get("field") || undefined,
    location: sp.get("location") || undefined,
    cost: sp.get("cost") || undefined,
    status: sp.get("status") || undefined,
    deadlineWithin: dwRaw ? parseInt(dwRaw, 10) || undefined : undefined,
    savedOnly: sp.get("saved") === "1",
    showExpired: sp.get("showExpired") === "1",
    sort: sp.get("sort") || "deadline_asc",
    page,
    pageSize,
  };
}

function locationMatches(listingLocation: string, filter: string): boolean {
  const a = listingLocation.toLowerCase();
  const b = filter.toLowerCase();
  if (a === "all india" || a.includes("all india")) return true;
  return a.includes(b) || b.includes(a);
}

function fieldMatches(listingFields: string, filter: string): boolean {
  const fields = parseList(listingFields);
  return fields.some((f) => f.toLowerCase() === filter.toLowerCase() || f === "Any Field");
}

export function applyFilters(items: OppRecord[], f: OpportunityFilters, savedIds: Set<string>): OppRecord[] {
  const q = f.q?.toLowerCase().trim();
  const tokens = q ? q.split(/\s+/).filter((t) => t.length > 1) : [];

  const scored = items.map((o) => {
    let relevance = 0;
    if (tokens.length > 0) {
      const title = `${o.title} ${o.provider}`.toLowerCase();
      const hay = `${o.title} ${o.provider} ${o.description} ${o.location} ${o.fields} ${o.skillsRequired} ${o.eligibility} ${o.benefits}`.toLowerCase();
      for (const t of tokens) {
        if (title.includes(t)) relevance += 3;
        else if (hay.includes(t)) relevance += 1;
      }
    }
    return { o, relevance };
  });

  let out = scored
    .filter(({ o, relevance }) => {
      if (tokens.length > 0 && relevance === 0) return false;
      if (!f.showExpired && isExpired(o)) return false;
      if (f.savedOnly && !savedIds.has(o.id)) return false;
      if (f.category && o.category !== f.category) return false;
      if (f.status && o.verificationStatus !== f.status) return false;
      if (f.cost && o.costType !== f.cost) return false;
      if (f.field && !fieldMatches(o.fields, f.field)) return false;
      if (f.location && !locationMatches(o.location, f.location)) return false;
      if (f.education) {
        if (o.minEducation !== "ANY") {
          const l = EDUCATION_RANK[o.minEducation] ?? 0;
          const s = EDUCATION_RANK[f.education] ?? 0;
          if (s > 0 && l > s) return false;
        }
      }
      if (f.deadlineWithin !== undefined) {
        if (!o.deadline) return false;
        const days = daysUntil(o.deadline);
        if (days < 0 || days > f.deadlineWithin) return false;
      }
      return true;
    })
    .map(({ o }) => o);

  const relevanceOf = (o: OppRecord): number => {
    if (tokens.length === 0) return 0;
    const title = `${o.title} ${o.provider}`.toLowerCase();
    const hay = `${o.title} ${o.provider} ${o.description} ${o.location} ${o.fields} ${o.skillsRequired} ${o.eligibility} ${o.benefits}`.toLowerCase();
    let r = 0;
    for (const t of tokens) {
      if (title.includes(t)) r += 3;
      else if (hay.includes(t)) r += 1;
    }
    return r;
  };

  if (tokens.length > 0) {
    // Keyword searches rank by relevance first, then by the chosen order.
    out = out.sort((a, b) => relevanceOf(b) - relevanceOf(a));
    if (f.sort === "deadline_asc") {
      return out;
    }
  }

  switch (f.sort) {
    case "deadline_desc":
      out = out.sort((a, b) => (b.deadline?.getTime() ?? 0) - (a.deadline?.getTime() ?? 0));
      break;
    case "newest":
      out = out.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "title_asc":
      out = out.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "deadline_asc":
    default:
      out = out.sort((a, b) => {
        if (!a.deadline && !b.deadline) return a.title.localeCompare(b.title);
        if (!a.deadline) return 1; // rolling deadlines go last
        if (!b.deadline) return -1;
        return a.deadline.getTime() - b.deadline.getTime();
      });
      break;
  }
  return out;
}

export async function loadAllOpportunities(): Promise<OppRecord[]> {
  return db.opportunity.findMany();
}

export async function getSavedIds(userId: string): Promise<Set<string>> {
  const saved = await db.savedOpportunity.findMany({
    where: { userId },
    select: { opportunityId: true },
  });
  return new Set(saved.map((s) => s.opportunityId));
}
