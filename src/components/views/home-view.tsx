"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { OpportunityCard } from "@/components/opportunity/opportunity-card";
import { useSavedIds } from "@/hooks/use-saved";
import { useAppStore } from "@/lib/store";
import { deadlineInfo, formatDate } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/types";
import type { OpportunityDTO, StatsDTO } from "@/lib/types";
import {
  Search,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  BookOpen,
  Wrench,
  Landmark,
  Bell,
  Sparkles,
  ArrowRight,
  CalendarClock,
  Database,
  BadgeCheck,
} from "lucide-react";

const CATEGORY_META: Record<string, { icon: React.ElementType; blurb: string }> = {
  SCHOLARSHIP: { icon: GraduationCap, blurb: "Merit & need-based funding for school, UG and PG studies." },
  INTERNSHIP: { icon: Briefcase, blurb: "Paid, stipended and research internships across India & remote." },
  FREE_COURSE: { icon: BookOpen, blurb: "Free online courses and certificates from IITs, Google, AWS & more." },
  SKILL_PROGRAM: { icon: Wrench, blurb: "Government-backed and industry skill-development programs." },
  GOVT_EXAM: { icon: Landmark, blurb: "Application windows for SSC, UPSC, IBPS, NEET & other exams." },
};

export function HomeView() {
  const { seedExplore, openDetail, setView, user, setAuthModalOpen, dataVersion } = useAppStore();
  const { savedIds, toggleSave } = useSavedIds();
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState<StatsDTO | null>(null);
  const [featured, setFeatured] = useState<OpportunityDTO[] | null>(null);
  const [deadlines, setDeadlines] = useState<OpportunityDTO[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: StatsDTO) => !cancelled && setStats(d))
      .catch(() => {});
    fetch("/api/opportunities?status=VERIFIED&sort=deadline_asc&pageSize=6")
      .then((r) => r.json())
      .then((d: { items: OpportunityDTO[] }) => !cancelled && setFeatured(d.items))
      .catch(() => {});
    fetch("/api/opportunities?sort=deadline_asc&pageSize=5")
      .then((r) => r.json())
      .then((d: { items: OpportunityDTO[] }) => !cancelled && setDeadlines(d.items))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [dataVersion]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    seedExplore(query.trim(), "");
  };

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-300">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Sources &amp; last-checked dates shown for every listing
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Every opportunity you need,
              <span className="text-teal-400"> in one trusted place</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-navy-100/85 sm:text-lg">
              Stop chasing scattered websites. Find verified scholarships, internships, free
              courses, skill programs and government exam notifications — with clear eligibility,
              real deadlines and official application links.
            </p>

            <form onSubmit={submitSearch} className="mx-auto mt-8 flex max-w-xl gap-2" role="search">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search e.g. scholarship for engineering, SSC exam, free AI course…"
                  aria-label="Search opportunities"
                  className="h-12 border-0 bg-white pl-9 text-navy-900 placeholder:text-slate-400 focus-visible:ring-teal-400"
                />
              </div>
              <Button type="submit" className="h-12 bg-teal-600 px-6 text-white hover:bg-teal-700">
                Search
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-navy-100/60">Popular:</span>
              {["Scholarship", "Internship", "Free AI course", "SSC exam"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => seedExplore(chip, "")}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-navy-100/90 transition-colors hover:border-teal-400/40 hover:text-teal-300"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Stats strip */}
          <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 text-center sm:grid-cols-4">
            {[
              { label: "Listings on platform", value: stats ? String(stats.total) : "—", icon: Database },
              { label: "Verified listings", value: stats ? String(stats.verified) : "—", icon: BadgeCheck },
              { label: "Close within 7 days", value: stats ? String(stats.closingSoon) : "—", icon: CalendarClock },
              { label: "Categories", value: "5", icon: Sparkles },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 backdrop-blur-sm">
                <Icon className="mx-auto h-4 w-4 text-teal-400" aria-hidden />
                <dd className="mt-1.5 text-2xl font-bold">{value}</dd>
                <dt className="text-xs text-navy-100/70">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* ---------- Categories ---------- */}
        <section className="py-14" aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="text-center text-2xl font-bold text-navy-900">
            Browse by category
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
            Five focused categories so you always know what kind of opportunity you are looking at.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => {
              const Icon = CATEGORY_META[value]?.icon ?? Sparkles;
              return (
                <button
                  key={value}
                  onClick={() => seedExplore("", value)}
                  className="group rounded-xl border border-slate-200 bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-800 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 font-semibold text-navy-900">{label}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {CATEGORY_META[value]?.blurb}
                  </p>
                  {stats?.byCategory && (
                    <p className="mt-2 text-xs font-medium text-teal-700">
                      {stats.byCategory[value] ?? 0} listing{(stats.byCategory[value] ?? 0) === 1 ? "" : "s"}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- Featured ---------- */}
        <section className="pb-14" aria-labelledby="featured-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="featured-heading" className="text-2xl font-bold text-navy-900">
                Verified opportunities closing soon
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Hand-checked listings, ordered by nearest deadline.
              </p>
            </div>
            <Button variant="outline" className="hidden shrink-0 sm:inline-flex" onClick={() => seedExplore("", "")}>
              View all <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured === null
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
              : featured.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opp={opp}
                    saved={savedIds.has(opp.id)}
                    onToggleSave={toggleSave}
                    onOpen={openDetail}
                  />
                ))}
          </div>
          {featured !== null && featured.length === 0 && (
            <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-muted-foreground">
              No verified listings right now — please check back soon.
            </p>
          )}
        </section>

        {/* ---------- Upcoming deadlines ---------- */}
        <section className="pb-14" aria-labelledby="deadlines-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="deadlines-heading" className="text-2xl font-bold text-navy-900">
                Upcoming deadlines
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The next application dates approaching across all categories.
              </p>
            </div>
            <Button variant="outline" className="hidden shrink-0 sm:inline-flex" onClick={() => setView("deadlines")}>
              Open deadline tracker <Bell className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          </div>

          <Card className="mt-6 overflow-hidden py-0">
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100">
                {deadlines === null &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <li key={i} className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </li>
                  ))}
                {deadlines?.map((opp) => {
                  const info = deadlineInfo(opp.deadline);
                  return (
                    <li key={opp.id}>
                      <button
                        onClick={() => openDetail(opp.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 sm:px-5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-navy-900">{opp.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {CATEGORY_LABELS[opp.category] ?? opp.category} · {opp.provider}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="hidden text-xs text-muted-foreground sm:inline">
                            {opp.deadline ? formatDate(opp.deadline) : "Rolling"}
                          </span>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${info.badgeClass}`}>
                            {info.label}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* ---------- How it works ---------- */}
        <section className="pb-14" aria-labelledby="how-heading">
          <h2 id="how-heading" className="text-center text-2xl font-bold text-navy-900">
            How OpportunityHub works
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Tell us about yourself",
                body: "Add your education level, field, skills and interests to your profile. It is completely voluntary and only used to match you with relevant listings.",
              },
              {
                step: "2",
                title: "Explore & filter",
                body: "Search the catalogue and filter by type, qualification, field, location, cost and deadline. Every card shows its verification status and last-checked date.",
              },
              {
                step: "3",
                title: "Save, track & apply",
                body: "Bookmark opportunities to your deadline tracker, then apply through the official link we display. We always link to the original source.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="rounded-xl border border-slate-200 bg-card p-6 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                  {step}
                </span>
                <h3 className="mt-3 font-semibold text-navy-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="pb-16">
          <div className="overflow-hidden rounded-2xl bg-navy-900 px-6 py-10 text-center sm:px-12">
            <Sparkles className="mx-auto h-6 w-6 text-teal-400" aria-hidden />
            <h2 className="mt-3 text-2xl font-bold text-white">
              {user ? "Get matches made for your profile" : "Let AI do the searching for you"}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-navy-100/80">
              Compare your education, skills and goals against every listing on the platform, with
              a clear explanation of why each one is suggested — no invented opportunities, ever.
            </p>
            <Button
              className="mt-6 bg-teal-600 px-6 text-white hover:bg-teal-700"
              onClick={() => (user ? setView("profile") : setAuthModalOpen(true))}
            >
              {user ? "Go to my profile" : "Create your free account"}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
