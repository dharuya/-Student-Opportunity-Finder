"use client";

/** Global client state (navigation, session, cross-view communication). */
import { create } from "zustand";
import type { SessionUser, ViewName } from "@/lib/types";

interface AppState {
  view: ViewName;
  selectedOpportunityId: string | null;
  user: SessionUser | null;
  authModalOpen: boolean;
  /** Search text typed on Home that should prefill Explore. */
  exploreSeedQuery: string;
  exploreSeedCategory: string;
  /** Increments whenever saved items change so views can refresh. */
  savedVersion: number;
  /** Increments whenever listings change (admin edits) so lists refresh. */
  dataVersion: number;

  setView: (view: ViewName) => void;
  openDetail: (id: string) => void;
  setUser: (user: SessionUser | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  seedExplore: (query: string, category?: string) => void;
  clearExploreSeed: () => void;
  bumpSaved: () => void;
  bumpData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "home",
  selectedOpportunityId: null,
  user: null,
  authModalOpen: false,
  exploreSeedQuery: "",
  exploreSeedCategory: "",
  savedVersion: 0,
  dataVersion: 0,

  setView: (view) => set({ view, selectedOpportunityId: view === "detail" ? undefined : null }),
  openDetail: (id) => set({ view: "detail", selectedOpportunityId: id }),
  setUser: (user) => set({ user }),
  setAuthModalOpen: (authModalOpen) => set({ authModalOpen }),
  seedExplore: (query, category = "") =>
    set({ view: "explore", exploreSeedQuery: query, exploreSeedCategory: category }),
  clearExploreSeed: () => set({ exploreSeedQuery: "", exploreSeedCategory: "" }),
  bumpSaved: () => set((s) => ({ savedVersion: s.savedVersion + 1 })),
  bumpData: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));
