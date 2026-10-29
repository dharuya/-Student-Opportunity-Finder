import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EDUCATION_LABELS } from "@/lib/types";

function serializeProfile(p: {
  educationLevel: string; fieldOfStudy: string; location: string;
  skills: string; interests: string; careerGoal: string;
}) {
  return {
    educationLevel: p.educationLevel,
    fieldOfStudy: p.fieldOfStudy,
    location: p.location,
    skills: p.skills,
    interests: p.interests,
    careerGoal: p.careerGoal,
  };
}

/** GET /api/profile — current user's student profile. */
export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to view your profile." }, { status: 401 });
  }
  const profile = await db.studentProfile.findUnique({ where: { userId: user.id } });
  return NextResponse.json({
    profile: profile
      ? serializeProfile(profile)
      : { educationLevel: "", fieldOfStudy: "", location: "", skills: "", interests: "", careerGoal: "" },
  });
}

/** PUT /api/profile — create or update the student profile. */
export async function PUT(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to save your profile." }, { status: 401 });
  }
  try {
    const b = await req.json().catch(() => null);
    const educationLevel = (b?.educationLevel ?? "").toString();
    if (educationLevel && !(educationLevel in EDUCATION_LABELS)) {
      return NextResponse.json({ error: "Please choose a valid education level." }, { status: 400 });
    }
    const data = {
      educationLevel,
      fieldOfStudy: (b?.fieldOfStudy ?? "").toString().slice(0, 120),
      location: (b?.location ?? "").toString().slice(0, 120),
      skills: (b?.skills ?? "").toString().slice(0, 400),
      interests: (b?.interests ?? "").toString().slice(0, 400),
      careerGoal: (b?.careerGoal ?? "").toString().slice(0, 500),
    };
    if (!educationLevel && !data.fieldOfStudy && !data.skills && !data.interests) {
      return NextResponse.json(
        { error: "Please fill at least your education level, field of study or interests before saving." },
        { status: 400 }
      );
    }
    const profile = await db.studentProfile.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });
    return NextResponse.json({ profile: serializeProfile(profile) });
  } catch (e) {
    console.error("profile PUT error", e);
    return NextResponse.json({ error: "Could not save your profile right now." }, { status: 500 });
  }
}
