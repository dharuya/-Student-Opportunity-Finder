"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { OpportunityCard } from "@/components/opportunity/opportunity-card";
import { useSavedIds } from "@/hooks/use-saved";
import { useAppStore } from "@/lib/store";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  EDUCATION_LEVELS,
  EDUCATION_LABELS,
  FIELD_OPTIONS,
  COST_TYPE_LABELS,
} from "@/lib/types";
import type { OpportunityDTO, PagedOpportunities } from "@/lib/types";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  SearchX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Filters {
  q: string;
  category: string;
  education: string;
  field: string;
  location: string;
  cost: string;
  status: string;
  deadlineWithin: string;
  sort: string;
}

const DEFAULT_FILTERS: Filters = {
  q: "",
  category: "",
  education: "",
  field: "",
  location: "",
  cost: "",
  status: "",
  deadlineWithin: "",
  sort: "deadline_asc",
};

const SORT_OPTIONS = [
  { value: "deadline_asc", label: "Deadline: soonest first" },
  { value: "deadline_desc", label: "Deadline: latest first" },
  { value: "newest", label: "Recently added" },
  { value: "title_asc", label: "Title A–Z" },
];

export function ExploreView() {
  const { openDetail, dataVersion } = useAppStore();
  const { savedIds, toggleSave } = useSavedIds();
  // Seed query/category is read once at mount — Home sets it right before navigating here.
  const [filters, setFilters] = useState<Filters>(() => {
    const seed = useAppStore.getState();
    return { ...DEFAULT_FILTERS, q: seed.exploreSeedQuery, category: seed.exploreSeedCategory };
  });
  const [data, setData] = useState<PagedOpportunities | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Consume the seed once so navigating away and back starts clean.
  useEffect(() => {
    useAppStore.getState().clearExploreSeed();
  }, []);

  const buildQuery = useCallback(
    (p: number, f: Filters) => {
      const sp = new URLSearchParams();
      if (f.q) sp.set("q", f.q);
      if (f.category) sp.set("category", f.category);
      if (f.education) sp.set("education", f.education);
      if (f.field) sp.set("field", f.field);
      if (f.location) sp.set("location", f.location);
      if (f.cost) sp.set("cost", f.cost);
      if (f.status) sp.set("status", f.status);
      if (f.deadlineWithin) sp.set("deadlineWithin", f.deadlineWithin);
      sp.set("sort", f.sort);
      sp.set("page", String(p));
      sp.set("pageSize", "9");
      return sp.toString();
    },
    []
  );

  const fetchResults = useCallback(
    (p: number, f: Filters) => {
      setLoading(true);
      fetch(`/api/opportunities?${buildQuery(p, f)}`)
        .then((r) => r.json())
        .then((d: PagedOpportunities & { error?: string }) => {
          if (d.error) {
            setData(null);
          } else {
            setData(d);
          }
        })
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    },
    [buildQuery]
  );

  // Fetch when filters / page / data version change (with small debounce for typing).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(page, filters), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, page, fetchResults, dataVersion]);

  const setFilter = (patch: Partial<Filters>) => {
    setPage(1);
    setFilters((f) => ({ ...f, ...patch }));
  };

  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const activeCount = useMemo(
    () =>
      Object.entries(filters).filter(
        ([k, v]) => k !== "sort" && v !== "" && v !== DEFAULT_FILTERS[k as keyof Filters]
      ).length,
    [filters]
  );

  const filterControls = (
    <div className="space-y-4">
      <div>
        <Label htmlFor="f-search">Search</Label>
        <div className="relative mt-1.5">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            id="f-search"
            value={filters.q}
            onChange={(e) => setFilter({ q: e.target.value })}
            placeholder="Keyword in title or description"
            className="pl-8"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="f-category">Opportunity type</Label>
        <Select value={filters.category || "all"} onValueChange={(v) => setFilter({ category: v === "all" ? "" : v })}>
          <SelectTrigger id="f-category" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="f-education">My qualification level</Label>
        <Select value={filters.education || "all"} onValueChange={(v) => setFilter({ education: v === "all" ? "" : v })}>
          <SelectTrigger id="f-education" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any qualification</SelectItem>
            {EDUCATION_LEVELS.filter((e) => e !== "ANY").map((e) => (
              <SelectItem key={e} value={e}>
                {EDUCATION_LABELS[e]} or above
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="f-field">Subject / career field</Label>
        <Select value={filters.field || "all"} onValueChange={(v) => setFilter({ field: v === "all" ? "" : v })}>
          <SelectTrigger id="f-field" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fields</SelectItem>
            {FIELD_OPTIONS.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="f-location">Location</Label>
        <Input
          id="f-location"
          value={filters.location}
          onChange={(e) => setFilter({ location: e.target.value })}
          placeholder="e.g. Delhi, Remote"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="f-cost">Paid / unpaid · free / paid</Label>
        <Select value={filters.cost || "all"} onValueChange={(v) => setFilter({ cost: v === "all" ? "" : v })}>
          <SelectTrigger id="f-cost" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Show everything</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="STIPENDED">With stipend / paid internship</SelectItem>
            <SelectItem value="PAID">Paid (course fee)</SelectItem>
            <SelectItem value="NOT_APPLICABLE">Not applicable (scholarships / exams)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="f-status">Verification status</Label>
        <Select value={filters.status || "all"} onValueChange={(v) => setFilter({ status: v === "all" ? "" : v })}>
          <SelectTrigger id="f-status" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All active listings</SelectItem>
            <SelectItem value="VERIFIED">Verified only</SelectItem>
            <SelectItem value="UNVERIFIED">Unverified only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="f-deadline">Application deadline</Label>
        <Select
          value={filters.deadlineWithin || "all"}
          onValueChange={(v) => setFilter({ deadlineWithin: v === "all" ? "" : v })}
        >
          <SelectTrigger id="f-deadline" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
            <SelectItem value="7">Closes within 7 days</SelectItem>
            <SelectItem value="30">Closes within 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={clearAll}>
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden /> Clear all filters
      </Button>
    </div>
  );

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Explore opportunities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? "Searching…"
              : data
                ? `${data.total} opportunit${data.total === 1 ? "y" : "ies"} found · page ${data.page} of ${data.totalPages}`
                : "Could not load results."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filters.sort} onValueChange={(v) => setFilter({ sort: v })}>
            <SelectTrigger className="w-52" aria-label="Sort results">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden" aria-label="Open filters">
                <SlidersHorizontal className="mr-1.5 h-4 w-4" aria-hidden />
                Filters{activeCount > 0 ? ` (${activeCount})` : ""}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-navy-900">Filters</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">{filterControls}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden self-start rounded-xl border border-slate-200 bg-card p-5 lg:sticky lg:top-24 lg:block" aria-label="Filters">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-navy-900">
            <SlidersHorizontal className="h-4 w-4 text-teal-600" aria-hidden /> Filters
          </h2>
          {filterControls}
        </aside>

        <div>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opp={opp}
                    saved={savedIds.has(opp.id)}
                    onToggleSave={toggleSave}
                    onOpen={openDetail}
                  />
                ))}
              </div>
              {data.totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden /> Prev
                  </Button>
                  <span className="px-3 text-sm text-muted-foreground">
                    Page {data.page} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Next page"
                  >
                    Next <ChevronRight className="h-4 w-4" aria-hidden />
                  </Button>
                </nav>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 px-6 py-16 text-center">
              <SearchX className="h-10 w-10 text-slate-300" aria-hidden />
              <h3 className="mt-4 font-semibold text-navy-900">No opportunities match your filters</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try removing a filter, widening the deadline window, or searching a different
                keyword. New listings are added regularly.
              </p>
              <Button variant="outline" className="mt-5" onClick={clearAll}>
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden /> Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
