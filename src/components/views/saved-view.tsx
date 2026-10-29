"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OpportunityCard } from "@/components/opportunity/opportunity-card";
import { useSavedIds } from "@/hooks/use-saved";
import { useAppStore } from "@/lib/store";
import type { OpportunityDTO } from "@/lib/types";
import { Bookmark, Compass, Trash2 } from "lucide-react";

export function SavedView() {
  const { user, setAuthModalOpen, openDetail, setView, savedVersion, dataVersion } = useAppStore();
  const { savedIds, toggleSave } = useSavedIds();
  const [items, setItems] = useState<OpportunityDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user) return;
    fetch("/api/saved")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("unauthorized"))))
      .then((d: { items: { opportunity: OpportunityDTO }[] }) => setItems(d.items.map((i) => i.opportunity)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
      load();
    });
    return () => {
      cancelled = true;
    };
  }, [user, savedVersion, dataVersion]);

  const removeFromSaved = async (opp: OpportunityDTO) => {
    await toggleSave(opp);
    setItems((prev) => (prev ? prev.filter((o) => o.id !== opp.id) : prev));
  };

  if (!user) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-card p-8 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50">
            <Bookmark className="h-6 w-6 text-navy-800" aria-hidden />
          </span>
          <h1 className="mt-4 text-xl font-bold text-navy-900">Your saved opportunities live here</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sign in to bookmark opportunities and keep them — with their deadlines — in one place.
          </p>
          <Button
            className="mt-6 bg-teal-600 text-white hover:bg-teal-700"
            onClick={() => setAuthModalOpen(true)}
          >
            Sign in or create a free account
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Saved opportunities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? "Loading your bookmarks…"
              : items
                ? `${items.length} saved opportunit${items.length === 1 ? "y" : "ies"}`
                : ""}
          </p>
        </div>
        <Button variant="outline" onClick={() => setView("deadlines")}>
          Open deadline tracker
        </Button>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              saved={savedIds.has(opp.id)}
              onToggleSave={removeFromSaved}
              onOpen={openDetail}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-slate-300 px-6 py-16 text-center">
          <Bookmark className="h-10 w-10 text-slate-300" aria-hidden />
          <h2 className="mt-4 font-semibold text-navy-900">Nothing saved yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Tap the bookmark icon on any opportunity card to keep it here and follow its deadline.
          </p>
          <Button className="mt-5 bg-navy-900 text-white hover:bg-navy-800" onClick={() => setView("explore")}>
            <Compass className="mr-2 h-4 w-4" aria-hidden /> Browse opportunities
          </Button>
        </div>
      )}

      {items && items.length > 0 && (
        <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          Tip: use the bookmark icon on a card to remove it from this list.
        </p>
      )}
    </main>
  );
}
