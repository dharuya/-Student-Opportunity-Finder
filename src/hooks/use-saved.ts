"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import type { OpportunityDTO } from "@/lib/types";

interface SavedRow {
  savedAt: string;
  opportunity: OpportunityDTO;
}

/** Shared saved-items state: fetches bookmarked ids and toggles saves with feedback. */
export function useSavedIds() {
  const user = useAppStore((s) => s.user);
  const savedVersion = useAppStore((s) => s.savedVersion);
  const bumpSaved = useAppStore((s) => s.bumpSaved);
  const setAuthModalOpen = useAppStore((s) => s.setAuthModalOpen);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    fetch("/api/saved")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((d: { items: SavedRow[] }) => {
        if (!cancelled) setSavedIds(new Set(d.items.map((i) => i.opportunity.id)));
      })
      .catch(() => {
        /* silent — saved list is non-critical */
      });
    return () => {
      cancelled = true;
    };
  }, [user, savedVersion]);

  const toggleSave = useCallback(
    async (opp: OpportunityDTO) => {
      if (!user) {
        toast({
          title: "Sign in to save opportunities",
          description: "Create a free account to bookmark opportunities and track their deadlines.",
        });
        setAuthModalOpen(true);
        return;
      }
      const isSaved = savedIds.has(opp.id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.delete(opp.id);
        else next.add(opp.id);
        return next;
      });
      try {
        const res = await fetch(isSaved ? `/api/saved?opportunityId=${opp.id}` : "/api/saved", {
          method: isSaved ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: isSaved ? undefined : JSON.stringify({ opportunityId: opp.id }),
        });
        if (!res.ok) throw new Error("failed");
        toast({
          title: isSaved ? "Removed from saved" : "Saved",
          description: isSaved
            ? `"${opp.title}" was removed from your saved list.`
            : `"${opp.title}" added to your saved list. Track it on the Deadline Tracker.`,
        });
        bumpSaved();
      } catch {
        // revert on failure
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (isSaved) next.add(opp.id);
          else next.delete(opp.id);
          return next;
        });
        toast({
          title: "Could not update saved items",
          description: "Please check your connection and try again.",
          variant: "destructive",
        });
      }
    },
    [user, savedIds, bumpSaved, setAuthModalOpen]
  );

  return { savedIds, toggleSave };
}
