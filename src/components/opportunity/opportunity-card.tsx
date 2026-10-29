"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  CategoryBadge,
  CostBadge,
  DeadlineBadge,
  VerificationBadge,
} from "@/components/opportunity/badges";
import { categoryLabel, truncate } from "@/lib/format";
import type { OpportunityDTO } from "@/lib/types";
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  MapPin,
  ArrowRight,
} from "lucide-react";

interface Props {
  opp: OpportunityDTO;
  saved: boolean;
  onToggleSave: (opp: OpportunityDTO) => void;
  onOpen: (id: string) => void;
}

export function OpportunityCard({ opp, saved, onToggleSave, onOpen }: Props) {
  return (
    <Card className="group flex h-full flex-col border border-[--border] bg-card shadow-sm transition-all hover:shadow-md hover:border-teal-200">
      <CardContent className="flex-1 p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={opp.category} />
            <VerificationBadge opp={opp} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={saved ? `Remove ${opp.title} from saved` : `Save ${opp.title}`}
            aria-pressed={saved}
            onClick={() => onToggleSave(opp)}
            className={`h-8 w-8 shrink-0 ${saved ? "text-teal-600 hover:text-teal-700" : "text-slate-400 hover:text-teal-600"}`}
          >
            {saved ? <BookmarkCheck className="h-4.5 w-4.5" /> : <Bookmark className="h-4 w-4" />}
          </Button>
        </div>

        <button
          onClick={() => onOpen(opp.id)}
          className="mt-3 block text-left"
          aria-label={`View details of ${opp.title}`}
        >
          <h3 className="line-clamp-2 font-semibold leading-snug text-navy-900 group-hover:text-teal-700 transition-colors">
            {opp.title}
          </h3>
        </button>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{opp.provider}</span>
        </p>

        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{truncate(opp.description, 140)}</p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-slate-600 border border-slate-100">
            <MapPin className="h-3 w-3" aria-hidden /> {opp.location}
          </span>
          <CostBadge opp={opp} />
          <DeadlineBadge opp={opp} />
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-slate-100 p-4 pt-3">
        <span className="text-xs font-medium text-slate-400">{categoryLabel(opp.category)}</span>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
          onClick={() => onOpen(opp.id)}
        >
          View details <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Button>
      </CardFooter>
    </Card>
  );
}
