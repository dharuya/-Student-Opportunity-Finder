/**
 * Session auth helpers (server only).
 * Lightweight HMAC-signed token stored in an httpOnly cookie.
 * The signing secret lives ONLY on the server — never exposed to frontend code.
 */
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/types";

const SECRET =
  process.env.AUTH_SECRET ?? "opportunityhub-dev-secret-change-in-production";

export const SESSION_COOKIE = "oh_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface TokenPayload {
  uid: string;
  role: string;
  exp: number;
}

function b64urlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function b64urlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function createSessionToken(uid: string, role: string): string {
  const payload: TokenPayload = {
    uid,
    role,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const body = b64urlEncode(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): TokenPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body)) as TokenPayload;
    if (!payload.uid || !payload.exp || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    secure: false, // works over both http (sandbox) and https (preview gateway)
  };
}

/** Read the current session user from the request cookie (null if signed out). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const payload = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const user = await db.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, email: true, name: true, role: true },
  });
  return user ?? null;
}

/** Require a logged-in user; returns null when unauthenticated. */
export async function requireUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

/** Require an admin user; returns null when not admin. */
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
