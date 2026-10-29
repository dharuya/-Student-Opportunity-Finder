"use client";

import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import {
  categoryLabel,
  categoryBadgeClass,
  deadlineInfo,
  verificationInfo,
} from "@/lib/format";
import { COST_TYPE_LABELS } from "@/lib/types";
import type { OpportunityDTO } from "@/lib/types";

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge variant="outline" className={`${categoryBadgeClass(category)} font-medium`}>
      {categoryLabel(category)}
    </Badge>
  );
}

export function VerificationBadge({ opp, showTooltipText = true }: { opp: OpportunityDTO; showTooltipText?: boolean }) {
  const info = verificationInfo(opp);
  return (
    <span title={showTooltipText ? info.title : undefined} className="inline-flex">
      <Badge variant="outline" className={`${info.badgeClass} gap-1 font-medium`}>
        {info.icon === "verified" && <ShieldCheck className="h-3 w-3" aria-hidden />}
        {info.icon === "unverified" && <ShieldAlert className="h-3 w-3" aria-hidden />}
        {info.icon === "expired" && <Clock className="h-3 w-3" aria-hidden />}
        {info.label}
      </Badge>
    </span>
  );
}

export function DeadlineBadge({ opp }: { opp: OpportunityDTO }) {
  const info = deadlineInfo(opp.deadline);
  return (
    <Badge variant="outline" className={`${info.badgeClass} gap-1 font-medium`} title="Application deadline status">
      <Clock className="h-3 w-3" aria-hidden />
      {info.label}
    </Badge>
  );
}

export function CostBadge({ opp }: { opp: OpportunityDTO }) {
  if (opp.costType === "NOT_APPLICABLE") return null;
  const isFree = opp.costType === "FREE" || opp.costType === "STIPENDED";
  return (
    <Badge
      variant="outline"
      className={`font-medium ${isFree ? "bg-teal-50 text-teal-800 border-teal-100" : "bg-slate-100 text-slate-700 border-slate-200"}`}
    >
      {COST_TYPE_LABELS[opp.costType] ?? opp.costType}
    </Badge>
  );
}
