"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  EDUCATION_LABELS,
  EDUCATION_LEVELS,
  COST_TYPE_LABELS,
  SOURCE_TYPE_LABELS,
  VERIFICATION_STATUSES,
  FIELD_OPTIONS,
  SKILL_OPTIONS,
} from "@/lib/types";
import type { OpportunityDTO } from "@/lib/types";
import { Loader2, Save } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: OpportunityDTO | null;
  onSaved: () => void;
}

const toDateInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function AdminFormDialog({ open, onOpenChange, initial, onSaved }: Props) {
  const bumpData = useAppStore((s) => s.bumpData);
  const isEdit = initial !== null;
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    category: "SCHOLARSHIP",
    provider: "",
    sourceType: "GOVERNMENT",
    description: "",
    eligibility: "",
    benefits: "",
    requiredDocuments: "",
    location: "All India",
    costType: "NOT_APPLICABLE",
    minEducation: "ANY",
    fields: "",
    skillsRequired: "",
    deadline: "",
    officialUrl: "",
    verificationStatus: "UNVERIFIED",
  });

  useEffect(() => {
    if (open) {
      setFormError("");
      setFieldErrors({});
      setForm(
        initial
          ? {
              title: initial.title,
              category: initial.category,
              provider: initial.provider,
              sourceType: initial.sourceType,
              description: initial.description,
              eligibility: initial.eligibility,
              benefits: initial.benefits,
              requiredDocuments: initial.requiredDocuments,
              location: initial.location,
              costType: initial.costType,
              minEducation: initial.minEducation,
              fields: initial.fields,
              skillsRequired: initial.skillsRequired,
              deadline: toDateInput(initial.deadline),
              officialUrl: initial.officialUrl,
              verificationStatus: initial.verificationStatus,
            }
          : {
              title: "",
              category: "SCHOLARSHIP",
              provider: "",
              sourceType: "GOVERNMENT",
              description: "",
              eligibility: "",
              benefits: "",
              requiredDocuments: "",
              location: "All India",
              costType: "NOT_APPLICABLE",
              minEducation: "ANY",
              fields: "",
              skillsRequired: "",
              deadline: "",
              officialUrl: "",
              verificationStatus: "UNVERIFIED",
            }
      );
    }
  }, [open, initial]);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    setSaving(true);
    setFormError("");
    setFieldErrors({});
    try {
      const res = await fetch(isEdit ? `/api/opportunities/${initial!.id}` : "/api/opportunities", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, deadline: form.deadline || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error ?? "Could not save the listing.");
        setFieldErrors(data.errors ?? {});
        return;
      }
      toast({
        title: isEdit ? "Listing updated" : "Listing created",
        description: `"${form.title}" has been ${isEdit ? "updated" : "added to the catalogue"}.`,
      });
      bumpData();
      onSaved();
      onOpenChange(false);
    } catch {
      setFormError("Network problem — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const err = (k: string) =>
    fieldErrors[k] ? <p className="mt-1 text-xs text-red-600" role="alert">{fieldErrors[k]}</p> : null;
  const cls = (k: string) => (fieldErrors[k] ? "border-red-400 focus-visible:ring-red-300" : "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-navy-900">
            {isEdit ? "Edit listing" : "Add a new listing"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details below. Content edits do not change the last-verified date — use the Verify action for that."
              : "Add a real opportunity from an official source. All fields marked required must be filled."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {formError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {formError}
            </p>
          )}

          <div>
            <Label htmlFor="a-title">Title *</Label>
            <Input id="a-title" value={form.title} onChange={(e) => set({ title: e.target.value })} className={`mt-1.5 ${cls("title")}`} />
            {err("title")}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="a-category">Category *</Label>
              <Select value={form.category} onValueChange={(v) => set({ category: v })}>
                <SelectTrigger id="a-category" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("category")}
            </div>
            <div>
              <Label htmlFor="a-source">Source type *</Label>
              <Select value={form.sourceType} onValueChange={(v) => set({ sourceType: v })}>
                <SelectTrigger id="a-source" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SOURCE_TYPE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("sourceType")}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="a-provider">Provider / organisation *</Label>
              <Input id="a-provider" value={form.provider} onChange={(e) => set({ provider: e.target.value })} className={`mt-1.5 ${cls("provider")}`} />
              {err("provider")}
            </div>
            <div>
              <Label htmlFor="a-location">Location</Label>
              <Input id="a-location" value={form.location} onChange={(e) => set({ location: e.target.value })} className="mt-1.5" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="a-cost">Cost *</Label>
              <Select value={form.costType} onValueChange={(v) => set({ costType: v })}>
                <SelectTrigger id="a-cost" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(COST_TYPE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("costType")}
            </div>
            <div>
              <Label htmlFor="a-edu">Min. education *</Label>
              <Select value={form.minEducation} onValueChange={(v) => set({ minEducation: v })}>
                <SelectTrigger id="a-edu" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((e) => (
                    <SelectItem key={e} value={e}>{EDUCATION_LABELS[e]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("minEducation")}
            </div>
            <div>
              <Label htmlFor="a-status">Verification status *</Label>
              <Select value={form.verificationStatus} onValueChange={(v) => set({ verificationStatus: v })}>
                <SelectTrigger id="a-status" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VERIFICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("verificationStatus")}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="a-deadline">Application deadline (optional)</Label>
              <Input
                id="a-deadline"
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => set({ deadline: e.target.value })}
                className="mt-1.5"
              />
              {err("deadline")}
              <p className="mt-1 text-xs text-muted-foreground">Leave empty for rolling deadlines.</p>
            </div>
            <div>
              <Label htmlFor="a-url">Official URL *</Label>
              <Input id="a-url" value={form.officialUrl} onChange={(e) => set({ officialUrl: e.target.value })} placeholder="https://…" className={`mt-1.5 ${cls("officialUrl")}`} />
              {err("officialUrl")}
            </div>
          </div>

          <div>
            <Label htmlFor="a-desc">Description *</Label>
            <Textarea id="a-desc" value={form.description} onChange={(e) => set({ description: e.target.value })} className="mt-1.5 min-h-20" />
            {err("description")}
          </div>

          <div>
            <Label htmlFor="a-elig">Eligibility *</Label>
            <Textarea id="a-elig" value={form.eligibility} onChange={(e) => set({ eligibility: e.target.value })} className="mt-1.5 min-h-20" />
            {err("eligibility")}
          </div>

          <div>
            <Label htmlFor="a-benefits">Benefits *</Label>
            <Textarea id="a-benefits" value={form.benefits} onChange={(e) => set({ benefits: e.target.value })} className="mt-1.5 min-h-16" />
            {err("benefits")}
          </div>

          <div>
            <Label htmlFor="a-docs">Required documents (one per line)</Label>
            <Textarea id="a-docs" value={form.requiredDocuments} onChange={(e) => set({ requiredDocuments: e.target.value })} className="mt-1.5 min-h-16" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="a-fields">Fields of study (comma separated)</Label>
              <Input id="a-fields" value={form.fields} onChange={(e) => set({ fields: e.target.value })} placeholder="e.g. Computer Science, Any Field" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="a-skills">Skills (comma separated)</Label>
              <Input id="a-skills" value={form.skillsRequired} onChange={(e) => set({ skillsRequired: e.target.value })} placeholder="e.g. Programming, None (Beginner Friendly)" className="mt-1.5" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Suggested values — fields: {FIELD_OPTIONS.slice(0, 4).join(", ")}… · skills: {SKILL_OPTIONS.slice(0, 3).join(", ")}…
          </p>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving} className="bg-teal-600 text-white hover:bg-teal-700">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Save className="mr-2 h-4 w-4" aria-hidden />}
              {isEdit ? "Save changes" : "Create listing"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
