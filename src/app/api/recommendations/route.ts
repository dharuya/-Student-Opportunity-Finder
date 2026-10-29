/**
 * POST /api/recommendations — optional AI-powered matching between the student's
 * saved profile and VERIFIED listings already on the platform.
 *
 * Guardrails (per product spec):
 *  - Only listings that exist in OUR database are ever recommended. The AI never
 *    invents scholarships, exams, deadlines or links.
 *  - Every recommendation includes human-readable reasons and a disclaimer.
 *  - No eligibility/selection guarantees are made anywhere.
 *  - If the AI service is unavailable, a transparent rule-based matcher is used
 *    instead, and the response says which engine produced the results.
 */
import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isExpired, loadAllOpportunities, serializeOpp } from "@/lib/opportunity-query";
import { AI_DISCLAIMER, CATEGORY_LABELS, EDUCATION_LABELS } from "@/lib/types";
import { educationMatches } from "@/lib/format";
import type { OpportunityDTO, RecommendationDTO } from "@/lib/types";

interface RawRec {
  id?: string;
  score?: number;
  reasons?: string[];
}

function clampScore(n: unknown): number {
  const v = typeof n === "number" ? n : parseFloat(String(n));
  if (isNaN(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function cleanReasons(reasons: unknown): string[] {
  if (!Array.isArray(reasons)) return [];
  return reasons
    .filter((r) => typeof r === "string" && r.trim().length > 0)
    .map((r) => r.trim().slice(0, 220))
    .slice(0, 4);
}

/** Deterministic keyword-overlap matcher used when the AI is unavailable. */
function ruleBasedRecommend(
  profile: { educationLevel: string; fieldOfStudy: string; location: string; skills: string; interests: string; careerGoal: string },
  listings: OpportunityDTO[]
): RecommendationDTO[] {
  const tokens = [
    ...profile.skills.split(","),
    ...profile.interests.split(","),
    ...profile.fieldOfStudy.split(","),
    ...profile.careerGoal.split(/\s+/),
  ]
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 2);

  const results: RecommendationDTO[] = [];
  for (const o of listings) {
    if (!educationMatches(o.minEducation, profile.educationLevel)) continue;
    const hay = `${o.title} ${o.fields} ${o.skillsRequired} ${o.category} ${o.description}`.toLowerCase();
    const matched = tokens.filter((t) => hay.includes(t));
    const score = Math.min(95, 40 + matched.length * 15);
    if (matched.length === 0) continue;
    const reasons = [
      `Matches your interests: ${matched.slice(0, 3).join(", ")}.`,
      educationMatches(o.minEducation, profile.educationLevel) && profile.educationLevel
        ? `Open to students at your education level (${EDUCATION_LABELS[profile.educationLevel] ?? profile.educationLevel}).`
        : `Minimum requirement: ${EDUCATION_LABELS[o.minEducation] ?? "Any level"}.`,
      o.verificationStatus === "VERIFIED"
        ? "Verified listing from an official source."
        : "Source listed below — verify details before applying.",
    ];
    results.push({ opportunity: o, score, reasons: reasons.slice(0, 3) });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 6);
}

export async function POST() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to get AI recommendations." }, { status: 401 });
  }

  try {
    const profileRow = await db.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profileRow) {
      return NextResponse.json(
        { error: "PROFILE_MISSING", message: "Fill in and save your profile first so the AI has something to compare against." },
        { status: 400 }
      );
    }
    const profile = {
      educationLevel: profileRow.educationLevel,
      fieldOfStudy: profileRow.fieldOfStudy,
      location: profileRow.location,
      skills: profileRow.skills,
      interests: profileRow.interests,
      careerGoal: profileRow.careerGoal,
    };
    if (!profile.educationLevel && !profile.fieldOfStudy && !profile.skills && !profile.interests) {
      return NextResponse.json(
        { error: "PROFILE_MISSING", message: "Your profile is nearly empty. Add your education, skills or interests, save it, then try again." },
        { status: 400 }
      );
    }

    // Candidate pool: active (non-expired) listings that actually exist in our DB.
    const all = await loadAllOpportunities();
    const candidates = all
      .filter((o) => !isExpired(o))
      .slice(0, 40)
      .map(serializeOpp);

    let engine: "ai" | "rules" = "ai";
    let recommendations: RecommendationDTO[] = [];
    let message: string | undefined;

    try {
      const zai = await ZAI.create();
      const systemPrompt = [
        "You are the recommendation engine of OpportunityHub, a platform for Indian students that lists scholarships, internships, free online courses, skill-development programs and government exam notifications.",
        "You will receive a student profile and a JSON array of REAL listings from our verified database.",
        "Rules you MUST follow:",
        "1. Recommend ONLY listings whose ids appear in the provided array. Never invent opportunities, providers, deadlines or links.",
        "2. For each pick, give 1-3 short reasons that compare the student's education, skills, interests or goals to the listing's requirements and benefits.",
        "3. Do not guarantee eligibility or selection. Do not exaggerate. If a listing is only a partial match, say so honestly.",
        "4. Return STRICT JSON only, no markdown fences, in this exact shape:",
        '{"recommendations":[{"id":"<listing id>","score":<0-100 integer>,"reasons":["reason 1","reason 2"]}]}',
        "Return at most 6 recommendations, best match first. If nothing matches well, return fewer or an empty array.",
      ].join(" ");

      const userPrompt = [
        `Student profile: ${JSON.stringify(profile)}`,
        `Available listings: ${JSON.stringify(
          candidates.map((o) => ({
            id: o.id,
            title: o.title,
            category: o.category,
            provider: o.provider,
            location: o.location,
            minEducation: o.minEducation,
            fields: o.fields,
            skillsRequired: o.skillsRequired,
            eligibility: o.eligibility.slice(0, 200),
            deadline: o.deadline,
          }))
        )}`,
      ].join("\n\n");

      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        thinking: { type: "disabled" },
      });

      const text = completion.choices[0]?.message?.content ?? "";
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd <= jsonStart) throw new Error("AI response was not valid JSON");
      const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as { recommendations?: RawRec[] };
      const byId = new Map(candidates.map((o) => [o.id, o]));
      recommendations = (parsed.recommendations ?? [])
        .filter((r) => r.id && byId.has(r.id))
        .map((r) => ({
          opportunity: byId.get(r.id)!,
          score: clampScore(r.score),
          reasons: cleanReasons(r.reasons).length
            ? cleanReasons(r.reasons)
            : [`Matched your profile (${CATEGORY_LABELS[byId.get(r.id)!.category] ?? byId.get(r.id)!.category}).`],
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
    } catch (aiError) {
      console.error("AI recommendation failed, falling back to rules:", aiError);
      engine = "rules";
      message =
        "The AI service is unavailable right now, so these suggestions come from our transparent rule-based matcher (keyword overlap with your profile).";
    }

    if (recommendations.length === 0) {
      if (engine === "ai") {
        // AI answered but found nothing convincing — try the rule engine before giving up.
        const ruleResults = ruleBasedRecommend(profile, candidates);
        if (ruleResults.length > 0) {
          engine = "rules";
          message = "The AI found no strong matches, so here are keyword-based suggestions instead.";
          recommendations = ruleResults;
        }
      } else {
        recommendations = ruleBasedRecommend(profile, candidates);
      }
    }

    return NextResponse.json({
      recommendations,
      source: engine,
      disclaimer: AI_DISCLAIMER,
      message,
    });
  } catch (e) {
    console.error("recommendations error", e);
    return NextResponse.json(
      { error: "Could not generate recommendations right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}
