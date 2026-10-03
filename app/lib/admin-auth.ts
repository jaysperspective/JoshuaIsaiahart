import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest, NextResponse } from "next/server";

// Server-side admin session. Stateless: the cookie value is an HMAC of a fixed
// string keyed by ADMIN_PASSWORD, so it can be verified without any storage and
// is invalidated automatically if the password changes. Mirrors the hashed
// per-gallery cookie approach in app/lib/pin.ts.

export const ADMIN_COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function adminToken(): string | null {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  return createHmac("sha256", secret).update("admin-session").digest("hex");
}

/** True when the request carries a valid admin session cookie. */
export function requireAdmin(request: NextRequest): boolean {
  // Local-dev convenience: skip the login entirely under `next dev`. This is
  // NEVER true under `next build` / `next start` (production on the box), so
  // the deployed site stays fully guarded even if this ships in a commit.
  if (process.env.NODE_ENV === "development") return true;
  const expected = adminToken();
  if (!expected) return false;
  const got = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!got) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function setAdminCookie(res: NextResponse): void {
  const token = adminToken();
  if (!token) return;
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearAdminCookie(res: NextResponse): void {
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
}

/** Shared 401 body for guarded routes. */
export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
