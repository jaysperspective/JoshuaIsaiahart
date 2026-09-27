import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, setAdminCookie, clearAdminCookie } from "@/app/lib/admin-auth";

// Verify an existing session (used by the client on mount).
export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: requireAdmin(request) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD not set in environment");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      const res = NextResponse.json({ authenticated: true });
      setAdminCookie(res);
      return res;
    }

    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// Logout — clear the session cookie.
export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  clearAdminCookie(res);
  return res;
}
