/** Client-side formatting & deadline helpers. */
import type { OpportunityDTO } from "@/lib/types";
import {
  CATEGORY_LABELS,
  EDUCATION_RANK,
} from "@/lib/types";

export type DeadlineKey = "rolling" | "expired" | "critical" | "soon" | "upcoming";

export interface DeadlineInfo {
  key: DeadlineKey;
  label: string;
  badgeClass: string;
  days: number | null;
}

/** Compute deadline status relative to today. */
export function deadlineInfo(deadline: string | null): DeadlineInfo {
  if (!deadline) {
    return {
      key: "rolling",
      label: "Rolling / open enrollment",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      days: null,
    };
  }
  const dl = new Date(deadline);
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const days = Math.ceil((dl.getTime() - endOfToday.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) {
    return {
      key: "expired",
      label: "Expired",
      badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
      days,
    };
  }
  if (days <= 7) {
    return {
      key: "critical",
      label: days === 0 ? "Closes today!" : `Closing soon · ${days} day${days === 1 ? "" : "s"} left`,
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      days,
    };
  }
  if (days <= 30) {
    return {
      key: "soon",
      label: `${days} days left`,
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      days,
    };
  }
  return {
    key: "upcoming",
    label: `${days} days left`,
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    days,
  };
}

export interface VerificationInfo {
  label: string;
  badgeClass: string;
  icon: "verified" | "unverified" | "expired";
  title: string;
}

export function verificationInfo(o: OpportunityDTO): VerificationInfo {
  const expiredByDate = deadlineInfo(o.deadline).key === "expired";
  if (o.verificationStatus === "EXPIRED" || expiredByDate) {
    return {
      label: "Expired",
      badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
      icon: "expired",
      title: "This listing's deadline has passed. Kept for reference — watch the source for the next cycle.",
    };
  }
  if (o.verificationStatus === "VERIFIED") {
    return {
      label: "Verified",
      badgeClass: "bg-teal-600 text-white border-teal-600",
      icon: "verified",
      title: "A human editor checked this listing against the official source.",
    };
  }
  return {
    label: "Unverified",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "unverified",
    title: "This listing has not completed our verification process yet. Double-check details on the official page.",
  };
}

export function categoryLabel(c: string): string {
  return CATEGORY_LABELS[c] ?? c;
}

export function categoryBadgeClass(c: string): string {
  switch (c) {
    case "SCHOLARSHIP":
      return "bg-navy-50 text-navy-800 border-navy-100";
    case "INTERNSHIP":
      return "bg-sky-50 text-sky-800 border-sky-100";
    case "FREE_COURSE":
      return "bg-teal-50 text-teal-800 border-teal-100";
    case "SKILL_PROGRAM":
      return "bg-emerald-50 text-emerald-800 border-emerald-100";
    case "GOVT_EXAM":
      return "bg-indigo-50 text-indigo-800 border-indigo-100";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Does a listing accept a student at the given education level? */
export function educationMatches(listingMin: string, studentLevel: string): boolean {
  if (!studentLevel) return true;
  if (listingMin === "ANY") return true;
  const l = EDUCATION_RANK[listingMin] ?? 0;
  const s = EDUCATION_RANK[studentLevel] ?? 0;
  if (s === 0) return true;
  return l <= s;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}
