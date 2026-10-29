"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OpportunityCard } from "@/components/opportunity/opportunity-card";
import { useSavedIds } from "@/hooks/use-saved";
import { useAppStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import {
  EDUCATION_LABELS,
  EDUCATION_LEVELS,
  FIELD_OPTIONS,
  SKILL_OPTIONS,
  INTEREST_HINTS,
} from "@/lib/types";
import type { ProfileDTO, RecommendationsResponse } from "@/lib/types";
import {
  User,
  Sparkles,
  Loader2,
  Save,
  Info,
  AlertTriangle,
  CheckCircle2,
  UserRoundSearch,
} from "lucide-react";

const EMPTY_PROFILE: ProfileDTO = {
  educationLevel: "",
  fieldOfStudy: "",
  location: "",
  skills: "",
  interests: "",
  careerGoal: "",
};

export function ProfileView() {
  const { user, setAuthModalOpen, openDetail } = useAppStore();
  const { savedIds, toggleSave } = useSavedIds();
  const [profile, setProfile] = useState<ProfileDTO>(EMPTY_PROFILE);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recs, setRecs] = useState<RecommendationsResponse | null>(null);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d: { profile: ProfileDTO }) => {
        if (!cancelled) {
          setProfile(d.profile);
          setProfileLoaded(true);
        }
      })
      .catch(() => !cancelled && setProfileLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleToken = (field: "skills" | "interests", token: string) => {
    setProfile((p) => {
      const current = p[field]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const next = current.includes(token)
        ? current.filter((t) => t !== token)
        : [...current, token];
      return { ...p, [field]: next.join(", ") };
    });
  };

  const tokenSelected = (field: "skills" | "interests", token: string) =>
    profile[field]
      .split(",")
      .map((s) => s.trim())
      .includes(token);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: "Could not save profile",
          description: data.error ?? "Please check your entries and try again.",
          variant: "destructive",
        });
        return;
      }
      setProfile(data.profile);
      toast({
        title: "Profile saved",
        description: "Your profile is ready to use for AI recommendations.",
      });
    } catch {
      toast({
        title: "Network problem",
        description: "We could not reach the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getRecommendations = async () => {
    setRecsLoading(true);
    setRecsError("");
    try {
      const res = await fetch("/api/recommendations", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as RecommendationsResponse & {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setRecsError(
          data.message ?? data.error ?? "Recommendations are unavailable right now. Please try again."
        );
        return;
      }
      setRecs(data);
    } catch {
      setRecsError("Network problem — please check your connection and try again.");
    } finally {
      setRecsLoading(false);
    }
  };

  // ---------- Signed-out gate ----------
  if (!user) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-card p-8 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50">
            <UserRoundSearch className="h-6 w-6 text-navy-800" aria-hidden />
          </span>
          <h1 className="mt-4 text-xl font-bold text-navy-900">Sign in to build your profile</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your profile powers personalised, explainable AI recommendations and keeps your saved
            opportunities and deadline tracker in sync. Everything you enter is voluntary and used
            only for matching within this platform.
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

  // ---------- Profile form ----------
  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-600 text-base font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My profile</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {user.email} · all fields are voluntary
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
        <section aria-labelledby="profile-form-heading" className="rounded-2xl border border-slate-200 bg-card p-6">
          <h2 id="profile-form-heading" className="flex items-center gap-2 font-semibold text-navy-900">
            <User className="h-4 w-4 text-teal-600" aria-hidden /> Education, skills &amp; goals
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This information is compared against opportunity requirements to explain matches.
          </p>

          {!profileLoaded ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="p-edu">Education level</Label>
                  <Select
                    value={profile.educationLevel || "none"}
                    onValueChange={(v) => setProfile((p) => ({ ...p, educationLevel: v === "none" ? "" : v }))}
                  >
                    <SelectTrigger id="p-edu" className="mt-1.5">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Prefer not to say</SelectItem>
                      {EDUCATION_LEVELS.filter((e) => e !== "ANY").map((e) => (
                        <SelectItem key={e} value={e}>
                          {EDUCATION_LABELS[e]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="p-field">Field of study</Label>
                  <Select
                    value={profile.fieldOfStudy || "none"}
                    onValueChange={(v) => setProfile((p) => ({ ...p, fieldOfStudy: v === "none" ? "" : v }))}
                  >
                    <SelectTrigger id="p-field" className="mt-1.5">
                      <SelectValue placeholder="Select a field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Prefer not to say</SelectItem>
                      {FIELD_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="p-location">Location</Label>
                <Input
                  id="p-location"
                  value={profile.location}
                  onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Jaipur, Rajasthan — or Remote"
                  className="mt-1.5"
                />
              </div>

              <fieldset>
                <legend className="text-sm font-medium">Skills</legend>
                <p className="mt-0.5 text-xs text-muted-foreground">Pick all that apply.</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SKILL_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={tokenSelected("skills", s)}
                      onClick={() => toggleToken("skills", s)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        tokenSelected("skills", s)
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-700"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-medium">Interests</legend>
                <p className="mt-0.5 text-xs text-muted-foreground">What kind of opportunities excite you?</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {INTEREST_HINTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={tokenSelected("interests", s)}
                      onClick={() => toggleToken("interests", s)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        tokenSelected("interests", s)
                          ? "border-navy-800 bg-navy-900 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-navy-400 hover:text-navy-800"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <Label htmlFor="p-goal">Career goal (optional)</Label>
                <Textarea
                  id="p-goal"
                  value={profile.careerGoal}
                  onChange={(e) => setProfile((p) => ({ ...p, careerGoal: e.target.value }))}
                  placeholder="e.g. I want to work in data science in the public sector after my B.Tech."
                  className="mt-1.5 min-h-20"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-navy-900 text-white hover:bg-navy-800"
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Save className="mr-2 h-4 w-4" aria-hidden />}
                  Save profile
                </Button>
                <p className="text-xs text-muted-foreground">Saved securely to your account.</p>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4 self-start lg:sticky lg:top-24">
          <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-teal-900">
              <Info className="h-4 w-4" aria-hidden /> Your data, your choice
            </h2>
            <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-teal-900/80">
              <li>Profile details are voluntary and used only to match opportunities inside OpportunityHub.</li>
              <li>We never sell or share your data, and you can change it anytime.</li>
              <li>AI matching is advisory — always verify eligibility on the official page.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* ---------- AI Recommendations ---------- */}
      <section aria-labelledby="recs-heading" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="recs-heading" className="flex items-center gap-2 text-xl font-bold text-navy-900">
              <Sparkles className="h-5 w-5 text-teal-600" aria-hidden /> AI recommendations
              <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-700">Optional</span>
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Compares your saved profile against verified listings on this platform and explains
              why each one is suggested. The AI cannot add new opportunities, deadlines or links.
            </p>
          </div>
          <Button
            onClick={getRecommendations}
            disabled={recsLoading}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            {recsLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" aria-hidden />
            )}
            {recsLoading ? "Analysing your profile…" : recs ? "Refresh recommendations" : "Get recommendations"}
          </Button>
        </div>

        {recsError && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {recsError}
          </div>
        )}

        {recsLoading && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        )}

        {recs && !recsLoading && (
          <div className="mt-5">
            {recs.message && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {recs.message}
              </div>
            )}
            {recs.recommendations.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-muted-foreground">
                No strong matches found for your profile yet. Add more skills or interests, or
                browse the full catalogue in Explore.
              </p>
            ) : (
              <div className="space-y-4">
                {recs.recommendations.map(({ opportunity, score, reasons }) => (
                  <article
                    key={opportunity.id}
                    className="rounded-2xl border border-slate-200 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          onClick={() => openDetail(opportunity.id)}
                          className="text-left font-semibold text-navy-900 hover:text-teal-700"
                        >
                          {opportunity.title}
                        </button>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {opportunity.provider} · {opportunity.location}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-800"
                        title="Match score based on your profile"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                        {score}% match
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Why this is recommended
                      </p>
                      <ul className="mt-1.5 space-y-1.5">
                        {reasons.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-teal-200 text-teal-800 hover:bg-teal-50"
                        onClick={() => openDetail(opportunity.id)}
                      >
                        View details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSave(opportunity)}
                        aria-pressed={savedIds.has(opportunity.id)}
                      >
                        {savedIds.has(opportunity.id) ? "Saved ✓" : "Save"}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
              {recs.disclaimer}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
