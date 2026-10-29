import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const password = (body?.password ?? "").toString();

    if (!email || !password) {
      return NextResponse.json({ error: "Please enter both email and password." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Incorrect email or password. Please try again." }, { status: 401 });
    }

    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const res = NextResponse.json({ user: safeUser });
    res.cookies.set(SESSION_COOKIE, createSessionToken(user.id, user.role), sessionCookieOptions());
    return res;
  } catch (e) {
    console.error("login error", e);
    return NextResponse.json({ error: "Could not sign you in right now. Please try again." }, { status: 500 });
  }
}
