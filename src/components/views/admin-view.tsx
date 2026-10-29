"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminFormDialog } from "@/components/views/admin-form-dialog";
import { CategoryBadge, VerificationBadge } from "@/components/opportunity/badges";
import { useAppStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import { deadlineInfo, formatDate, truncate } from "@/lib/format";
import type { OpportunityDTO, StatsDTO } from "@/lib/types";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  ShieldOff,
  CalendarX,
  Trash2,
  LayoutDashboard,
  Lock,
  Info,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
} from "lucide-react";

export function AdminView() {
  const { user, setAuthModalOpen, openDetail, dataVersion, bumpData } = useAppStore();
  const [items, setItems] = useState<OpportunityDTO[] | null>(null);
  const [stats, setStats] = useState<StatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OpportunityDTO | null>(null);
  const [deleting, setDeleting] = useState<OpportunityDTO | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/opportunities?sort=newest&pageSize=50&showExpired=1").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ])
      .then(([list, st]) => {
        setItems(list.items ?? []);
        setStats(st.total !== undefined ? st : null);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load, dataVersion, user]);

  if (!user) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-card p-8 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50">
            <Lock className="h-6 w-6 text-navy-800" aria-hidden />
          </span>
          <h1 className="mt-4 text-xl font-bold text-navy-900">Admin access required</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The admin dashboard is restricted to platform administrators. Sign in with an admin
            account to add, verify, edit or remove listings.
          </p>
          <div className="mt-4 rounded-md bg-navy-50 p-3 text-xs text-navy-700">
            Demo admin: <b>admin@opportunityhub.in / Admin@1234</b>
          </div>
          <Button className="mt-5 bg-navy-900 text-white hover:bg-navy-800" onClick={() => setAuthModalOpen(true)}>
            Sign in
          </Button>
        </div>
      </main>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" aria-hidden />
          <h1 className="mt-4 text-xl font-bold text-amber-900">You don&apos;t have admin access</h1>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            You are signed in as a student. Only administrator accounts can manage listings. If you
            believe you should have admin rights, contact the platform team.
          </p>
        </div>
      </main>
    );
  }

  const setStatus = async (opp: OpportunityDTO, action: "verify" | "unverify" | "expire") => {
    const body =
      action === "verify"
        ? { markVerified: true }
        : { setStatus: action === "expire" ? "EXPIRED" : "UNVERIFIED" };
    const res = await fetch(`/api/opportunities/${opp.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast({
        title: "Action failed",
        description: d.error ?? "Please try again.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title:
        action === "verify"
          ? "Listing verified"
          : action === "expire"
            ? "Marked as expired"
            : "Marked as unverified",
      description:
        action === "verify"
          ? `"${truncate(opp.title, 40)}" is now shown as Verified with an updated last-checked date.`
          : `Status updated for "${truncate(opp.title, 40)}".`,
    });
    bumpData();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/opportunities/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast({ title: "Could not delete", description: d.error ?? "Please try again.", variant: "destructive" });
        return;
      }
      toast({ title: "Listing removed", description: `"${truncate(deleting.title, 40)}" was deleted.` });
      setDeleting(null);
      bumpData();
    } finally {
      setDeleteBusy(false);
    }
  };

  const statCards = stats
    ? [
        { label: "Total listings", value: stats.total, icon: Database, cls: "text-navy-800 bg-navy-50" },
        { label: "Verified", value: stats.verified, icon: CheckCircle2, cls: "text-teal-700 bg-teal-50" },
        { label: "Unverified", value: stats.unverified, icon: AlertTriangle, cls: "text-amber-700 bg-amber-50" },
        { label: "Expired", value: stats.expired, icon: Clock, cls: "text-slate-600 bg-slate-100" },
        { label: "Closing ≤7 days", value: stats.closingSoon, icon: CalendarX, cls: "text-red-700 bg-red-50" },
      ]
    : [];

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-900">
            <LayoutDashboard className="h-6 w-6 text-teal-600" aria-hidden /> Admin dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, verify, edit and remove listings. Verification stamps the last-checked date honestly.
          </p>
        </div>
        <Button
          className="bg-teal-600 text-white hover:bg-teal-700"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" aria-hidden /> Add new listing
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats === null
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          : statCards.map(({ label, value, icon: Icon, cls }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-card p-4">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${cls}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="mt-2 text-xl font-bold text-navy-900">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
      </div>

      {/* Listings table */}
      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-card">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead className="w-[34%]">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Deadline</TableHead>
                <TableHead className="hidden md:table-cell">Last checked</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(items ?? []).map((opp) => {
                const info = deadlineInfo(opp.deadline);
                return (
                  <TableRow key={opp.id}>
                    <TableCell>
                      <button
                        onClick={() => openDetail(opp.id)}
                        className="text-left text-sm font-medium text-navy-900 hover:text-teal-700"
                        title={opp.title}
                      >
                        {truncate(opp.title, 60)}
                      </button>
                      <p className="mt-0.5 text-xs text-muted-foreground">{opp.provider}</p>
                    </TableCell>
                    <TableCell>
                      <CategoryBadge category={opp.category} />
                    </TableCell>
                    <TableCell>
                      <VerificationBadge opp={opp} showTooltipText={false} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">{opp.deadline ? formatDate(opp.deadline) : "Rolling"}</div>
                      <div className={`mt-0.5 text-xs ${info.key === "critical" ? "text-red-600" : "text-muted-foreground"}`}>
                        {info.key === "rolling" ? "Open enrollment" : info.label}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {formatDate(opp.lastVerifiedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${opp.title}`}>
                            <MoreHorizontal className="h-4 w-4" aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(opp);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" aria-hidden /> Edit details
                          </DropdownMenuItem>
                          {opp.verificationStatus !== "VERIFIED" && (
                            <DropdownMenuItem onClick={() => setStatus(opp, "verify")}>
                              <ShieldCheck className="mr-2 h-4 w-4 text-teal-600" aria-hidden /> Mark verified
                            </DropdownMenuItem>
                          )}
                          {opp.verificationStatus !== "UNVERIFIED" && (
                            <DropdownMenuItem onClick={() => setStatus(opp, "unverify")}>
                              <ShieldOff className="mr-2 h-4 w-4" aria-hidden /> Mark unverified
                            </DropdownMenuItem>
                          )}
                          {opp.verificationStatus !== "EXPIRED" && (
                            <DropdownMenuItem onClick={() => setStatus(opp, "expire")}>
                              <CalendarX className="mr-2 h-4 w-4" aria-hidden /> Mark expired
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleting(opp)} variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" aria-hidden /> Delete listing
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Verification policy: only mark a listing <b>Verified</b> after you have actually checked it
        against the official source. Verification updates the publicly shown &ldquo;last checked&rdquo;
        date. Ordinary edits never touch that date.
      </p>

      <AdminFormDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} onSaved={load} />

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.title}&rdquo; will be permanently removed, including from every
              student&apos;s saved list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteBusy}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
