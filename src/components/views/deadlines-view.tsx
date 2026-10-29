"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSavedIds } from "@/hooks/use-saved";
import { useAppStore } from "@/lib/store";
import { deadlineInfo, formatDate } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/types";
import type { OpportunityDTO } from "@/lib/types";
import {
  Bell,
  CalendarClock,
  CalendarX2,
  ChevronRight,
  Hourglass,
  Info,
  AlarmClock,
} from "lucide-react";

interface Row {
  opp: OpportunityDTO;
  info: ReturnType<typeof deadlineInfo>;
}

const GROUPS: {
  key: "critical" | "soon" | "upcoming" | "rolling" | "expired";
  title: string;
  blurb: string;
  icon: React.ElementType;
  accent: string;
}[] = [
  {
    key: "critical",
    title: "Closing within 7 days",
    blurb: "Act now if you plan to apply.",
    icon: AlarmClock,
    accent: "text-red-600",
  },
  {
    key: "soon",
    title: "Closing in 8–30 days",
    blurb: "Start preparing your documents.",
    icon: Hourglass,
    accent: "text-amber-600",
  },
  {
    key: "upcoming",
    title: "More than 30 days away",
    blurb: "Plan ahead and set your schedule.",
    icon: CalendarClock,
    accent: "text-teal-700",
  },
  {
    key: "rolling",
    title: "Rolling / open enrollment",
    blurb: "No fixed deadline — verify current status on the official page.",
    icon: Info,
    accent: "text-slate-500",
  },
  {
    key: "expired",
    title: "Passed deadlines",
    blurb: "Kept for reference so you can watch for the next cycle.",
    icon: CalendarX2,
    accent: "text-slate-400",
  },
];

export function DeadlinesView() {
  const { openDetail, user, dataVersion } = useAppStore();
  const { savedIds, toggleSave } = useSavedIds();
  const [items, setItems] = useState<OpportunityDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExpired, setShowExpired] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      const sp = new URLSearchParams({ sort: "deadline_asc", pageSize: "50" });
      if (showExpired) sp.set("showExpired", "1");
      if (savedOnly) sp.set("saved", "1");
      fetch(`/api/opportunities?${sp.toString()}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
        .then((d: { items: OpportunityDTO[] }) => !cancelled && setItems(d.items))
        .catch(() => !cancelled && setItems([]))
        .finally(() => !cancelled && setLoading(false));
    });
    return () => {
      cancelled = true;
    };
  }, [showExpired, savedOnly, dataVersion]);

  const grouped = useMemo(() => {
    const map: Record<string, Row[]> = {
      critical: [],
      soon: [],
      upcoming: [],
      rolling: [],
      expired: [],
    };
    for (const opp of items ?? []) {
      map[deadlineInfo(opp.deadline).key].push({ opp, info: deadlineInfo(opp.deadline) });
    }
    return map;
  }, [items]);

  const criticalCount = grouped.critical.length;

  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Deadline tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All upcoming application dates across the platform — sorted by urgency.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          {user && (
            <div className="flex items-center gap-2">
              <Switch id="saved-only" checked={savedOnly} onCheckedChange={setSavedOnly} />
              <Label htmlFor="saved-only" className="text-sm">
                Only my saved items
              </Label>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Switch id="show-expired" checked={showExpired} onCheckedChange={setShowExpired} />
            <Label htmlFor="show-expired" className="text-sm">
              Show passed deadlines
            </Label>
          </div>
        </div>
      </div>

      {criticalCount > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
          <p className="text-sm leading-relaxed text-red-800">
            <b>{criticalCount} deadline{criticalCount === 1 ? "" : "s"} close within 7 days.</b> If
            you plan to apply, check the official page today — documents like income or caste
            certificates can take time to arrange.
          </p>
        </div>
      )}

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {GROUPS.map((group) => {
            const rows = grouped[group.key];
            if (rows.length === 0) return null;
            const Icon = group.icon;
            return (
              <section key={group.key} aria-labelledby={`grp-${group.key}`}>
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${group.accent}`} aria-hidden />
                  <h2 id={`grp-${group.key}`} className="font-semibold text-navy-900">
                    {group.title}
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {rows.length}
                    </span>
                  </h2>
                </div>
                <p className="mt-0.5 pl-7 text-xs text-muted-foreground">{group.blurb}</p>

                <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-card">
                  {rows.map(({ opp, info }) => (
                    <li
                      key={opp.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5"
                    >
                      <button
                        onClick={() => openDetail(opp.id)}
                        className="min-w-0 flex-1 text-left"
                        aria-label={`View details of ${opp.title}`}
                      >
                        <p className="truncate text-sm font-medium text-navy-900">{opp.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {CATEGORY_LABELS[opp.category] ?? opp.category} · {opp.provider} ·{" "}
                          {opp.deadline ? `Closes ${formatDate(opp.deadline)}` : "Rolling deadline"}
                        </p>
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${info.badgeClass}`}>
                          {info.label}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-pressed={savedIds.has(opp.id)}
                          onClick={() => toggleSave(opp)}
                          className={
                            savedIds.has(opp.id)
                              ? "text-teal-700 hover:bg-teal-50"
                              : "text-slate-500 hover:bg-slate-50"
                          }
                        >
                          {savedIds.has(opp.id) ? "Saved ✓" : "Save"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400"
                          onClick={() => openDetail(opp.id)}
                          aria-label={`Open ${opp.title}`}
                        >
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {(items ?? []).length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-muted-foreground">
              Nothing to show here yet. Try turning off filters, or save some opportunities first.
            </p>
          )}
        </div>
      )}

      <p className="mt-8 flex items-start gap-2 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Deadline data reflects what our editors recorded for each listing (see &ldquo;last checked&rdquo; on
        each opportunity). OpportunityHub does not yet send email reminders — bookmark items to keep
        them on this page and check back regularly.
      </p>
    </main>
  );
}
