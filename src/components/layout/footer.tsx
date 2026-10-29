"use client";

import { useAppStore } from "@/lib/store";
import { GraduationCap, ShieldCheck, Bell, Compass } from "lucide-react";
import type { ViewName } from "@/lib/types";

export function Footer() {
  const setView = useAppStore((s) => s.setView);

  const link = (label: string, view: ViewName) => (
    <button
      onClick={() => setView(view)}
      className="text-sm text-navy-100/80 transition-colors hover:text-teal-300"
    >
      {label}
    </button>
  );

  return (
    <footer className="mt-auto border-t border-navy-800 bg-navy-950 pb-[env(safe-area-inset-bottom)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800">
                <GraduationCap className="h-4 w-4 text-teal-400" aria-hidden />
              </span>
              <span className="font-bold">OpportunityHub</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-navy-100/70">
              Helping students discover scholarships, internships, free courses, skill programs
              and government exam notifications in one accessible, trustworthy place.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-300">Explore</h3>
            <ul className="mt-3 space-y-2">
              <li>{link("Browse opportunities", "explore")}</li>
              <li>{link("Deadline tracker", "deadlines")}</li>
              <li>{link("Student profile & AI matches", "profile")}</li>
              <li>{link("Saved opportunities", "saved")}</li>
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-300">
              Trust &amp; safety
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-navy-100/70">
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" aria-hidden />
                We show the original source and the date each listing was last checked.
              </li>
              <li className="flex gap-2">
                <Bell className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" aria-hidden />
                Expired and unverified listings are clearly labelled — never hidden.
              </li>
              <li className="flex gap-2">
                <Compass className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" aria-hidden />
                Always confirm details on the official website before applying.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-navy-800/80 pt-5">
          <p className="text-xs leading-relaxed text-navy-100/50">
            Prototype notice: listings shown in this build are realistic sample data for
            demonstration purposes. OpportunityHub does not currently connect to live
            government feeds or send email notifications. © {new Date().getFullYear()} OpportunityHub.
          </p>
        </div>
      </div>
    </footer>
  );
}
