"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthModal } from "@/components/auth-modal";
import { HomeView } from "@/components/views/home-view";
import { ExploreView } from "@/components/views/explore-view";
import { DetailView } from "@/components/views/detail-view";
import { ProfileView } from "@/components/views/profile-view";
import { SavedView } from "@/components/views/saved-view";
import { DeadlinesView } from "@/components/views/deadlines-view";
import { AdminView } from "@/components/views/admin-view";
import { useAppStore } from "@/lib/store";
import type { SessionUser } from "@/lib/types";

export default function OpportunityHub() {
  const { view, setView, setUser } = useAppStore();

  // Restore the session (if any) on first load.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: SessionUser | null }) => d.user && setUser(d.user))
      .catch(() => {});
  }, [setUser]);

  // Always start a view change from the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [view]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        {view === "home" && <HomeView />}
        {view === "explore" && <ExploreView />}
        {view === "detail" && <DetailView />}
        {view === "profile" && <ProfileView />}
        {view === "saved" && <SavedView />}
        {view === "deadlines" && <DeadlinesView />}
        {view === "admin" && <AdminView />}
      </div>
      <Footer />
      <AuthModal />
    </div>
  );
}
