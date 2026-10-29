"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  CategoryBadge,
  CostBadge,
  DeadlineBadge,
  VerificationBadge,
} from "@/components/opportunity/badges";
import { useSavedIds } from "@/hooks/use-saved";
import { useAppStore } from "@/lib/store";
import { deadlineInfo, formatDate, parseList } from "@/lib/format";
import { SOURCE_TYPE_LABELS } from "@/lib/types";
import type { OpportunityDTO } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  Gift,
  Info,
  ListChecks,
  MapPin,
  Share2,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export function DetailView() {
  const { selectedOpportunityId, setView, openDetail } = useAppStore();
  const { savedIds, toggleSave } = useSavedIds();
  const [state, setState] = useState<{
    id: string | null;
    opp: OpportunityDTO | null;
    notFound: boolean;
  }>({ id: null, opp: null, notFound: false });
  // Derived: still loading whenever the requested id hasn't loaded yet.
  const loading = state.id !== selectedOpportunityId;
  const notFound = state.notFound;
  const opp = state.opp;

  useEffect(() => {
    if (!selectedOpportunityId) return;
    let cancelled = false;
    const id = selectedOpportunityId;
    fetch(`/api/opportunities/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { opportunity: OpportunityDTO }) => {
        if (!cancelled) setState({ id, opp: d.opportunity, notFound: false });
      })
      .catch(() => {
        if (!cancelled) setState({ id, opp: null, notFound: true });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedOpportunityId]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/?opportunity=${opp?.id ?? ""}`
      );
      toast({ title: "Link copied", description: "A direct link to this opportunity is on your clipboard." });
    } catch {
      toast({
        title: "Could not copy link",
        description: "Your browser blocked clipboard access.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-40" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </main>
    );
  }

  if (notFound || !opp) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-bold text-navy-900">Opportunity not found</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          This listing may have been removed by our editors. Browse the catalogue for similar
          opportunities.
        </p>
        <Button className="mt-6 bg-navy-900 text-white hover:bg-navy-800" onClick={() => setView("explore")}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Back to Explore
        </Button>
      </main>
    );
  }

  const dl = deadlineInfo(opp.deadline);
  const docs = parseList(opp.requiredDocuments);
  const isSaved = savedIds.has(opp.id);

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Button
        variant="ghost"
        className="mb-4 -ml-2 gap-1.5 text-slate-600 hover:text-navy-900"
        onClick={() => setView("explore")}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Explore
      </Button>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={opp.category} />
          <VerificationBadge opp={opp} />
          <CostBadge opp={opp} />
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-snug text-navy-900">{opp.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4" aria-hidden /> {opp.provider}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden /> {opp.location}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              onClick={copyLink}
              aria-label="Copy link to this opportunity"
              className="border-slate-200"
            >
              <Share2 className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              onClick={() => toggleSave(opp)}
              className={
                isSaved
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "bg-navy-900 text-white hover:bg-navy-800"
              }
              aria-pressed={isSaved}
            >
              {isSaved ? <BookmarkCheck className="mr-1.5 h-4 w-4" aria-hidden /> : <Bookmark className="mr-1.5 h-4 w-4" aria-hidden />}
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main content */}
        <div className="space-y-6">
          <section aria-labelledby="about-opp" className="rounded-2xl border border-slate-200 bg-card p-6">
            <h2 id="about-opp" className="flex items-center gap-2 font-semibold text-navy-900">
              <Info className="h-4 w-4 text-teal-600" aria-hidden /> About this opportunity
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{opp.description}</p>
          </section>

          <section aria-labelledby="eligibility" className="rounded-2xl border border-slate-200 bg-card p-6">
            <h2 id="eligibility" className="flex items-center gap-2 font-semibold text-navy-900">
              <ListChecks className="h-4 w-4 text-teal-600" aria-hidden /> Eligibility
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{opp.eligibility}</p>
          </section>

          <section aria-labelledby="benefits" className="rounded-2xl border border-slate-200 bg-card p-6">
            <h2 id="benefits" className="flex items-center gap-2 font-semibold text-navy-900">
              <Gift className="h-4 w-4 text-teal-600" aria-hidden /> Benefits
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{opp.benefits}</p>
          </section>

          {docs.length > 0 && (
            <section aria-labelledby="documents" className="rounded-2xl border border-slate-200 bg-card p-6">
              <h2 id="documents" className="flex items-center gap-2 font-semibold text-navy-900">
                <FileText className="h-4 w-4 text-teal-600" aria-hidden /> Required documents
              </h2>
              <ul className="mt-3 space-y-2">
                {docs.map((doc) => (
                  <li key={doc} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                    {doc}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="apply" className="rounded-2xl border border-slate-200 bg-card p-6">
            <h2 id="apply" className="flex items-center gap-2 font-semibold text-navy-900">
              <Wallet className="h-4 w-4 text-teal-600" aria-hidden /> How to apply
            </h2>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                <b>1.</b> Read the eligibility details above carefully and keep the required
                documents ready.
              </li>
              <li>
                <b>2.</b> Open the official page using the button in the panel beside this one —
                always verify the details there before you apply.
              </li>
              <li>
                <b>3.</b> Complete your application before the deadline
                {opp.deadline ? ` (${formatDate(opp.deadline)})` : " — this listing has rolling enrollment"}.
              </li>
            </ol>
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
              OpportunityHub only points to the official application page. We never collect
              application fees or personal documents, and we are never involved in selection
              decisions.
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 self-start lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-200 bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarClock className="h-4 w-4" aria-hidden /> Deadline
            </h2>
            <p className="mt-2 text-xl font-bold text-navy-900">
              {opp.deadline ? formatDate(opp.deadline) : "Rolling / open"}
            </p>
            <div className="mt-2">
              <DeadlineBadge opp={opp} />
            </div>
            {dl.days !== null && dl.days >= 0 && (
              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden>
                  <div
                    className={`h-full rounded-full ${dl.days <= 7 ? "bg-red-500" : dl.days <= 30 ? "bg-amber-500" : "bg-teal-500"}`}
                    style={{ width: `${Math.max(6, Math.min(100, (dl.days / 90) * 100))}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">Timeline until the application closes</p>
              </div>
            )}
            <Button
              className="mt-4 w-full bg-teal-600 text-white hover:bg-teal-700"
              onClick={() => toggleSave(opp)}
              aria-pressed={isSaved}
            >
              {isSaved ? "In your deadline tracker" : "Add to deadline tracker"}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Saved opportunities appear on your Deadline Tracker page.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="h-4 w-4" aria-hidden /> Source &amp; verification
            </h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Source type</dt>
                <dd className="font-medium text-navy-900">{SOURCE_TYPE_LABELS[opp.sourceType] ?? opp.sourceType}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Provider</dt>
                <dd className="text-right font-medium text-navy-900">{opp.provider}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Last checked</dt>
                <dd className="font-medium text-navy-900">{formatDate(opp.lastVerifiedAt)}</dd>
              </div>
            </dl>
            <Separator className="my-4" />
            <a href={opp.officialUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-navy-900 text-white hover:bg-navy-800">
                <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden /> Open official page
              </Button>
            </a>
            <p className="mt-2 break-all text-center text-[11px] text-slate-400">{opp.officialUrl}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
