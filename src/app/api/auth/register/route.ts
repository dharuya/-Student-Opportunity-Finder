import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const name = (body?.name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const password = (body?.password ?? "").toString();

    const errors: Record<string, string> = {};
    if (name.length < 2) errors.name = "Please enter your full name (at least 2 characters).";
    if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
    if (password.length < 8) errors.password = "Password must be at least 8 characters long.";
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Please fix the highlighted fields.", errors }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in instead.", errors: { email: "Email already registered." } },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: { email, name, passwordHash: hashPassword(password), role: "STUDENT" },
      select: { id: true, email: true, name: true, role: true },
    });

    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(SESSION_COOKIE, createSessionToken(user.id, user.role), sessionCookieOptions());
    return res;
  } catch (e) {
    console.error("register error", e);
    return NextResponse.json({ error: "Could not create your account right now. Please try again." }, { status: 500 });
  }
}
