import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createHash } from "crypto";

const VALID_TYPES = new Set(["view", "book_click"]);
const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|curl|wget|python-requests|headless/i;

export async function POST(request: NextRequest) {
  try {
    const { type, path, referrer } = await request.json();

    if (!VALID_TYPES.has(type) || typeof path !== "string" || path.startsWith("/admin")) {
      return NextResponse.json({ ok: true });
    }

    const ua = request.headers.get("user-agent") || "";
    if (BOT_RE.test(ua)) return NextResponse.json({ ok: true });

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Daily-rotating anonymous visitor hash — no cookies, not reversible
    const day = new Date().toISOString().slice(0, 10);
    const visitor = createHash("sha256").update(`${ip}|${ua}|${day}`).digest("hex").slice(0, 16);
    const device = /mobile|iphone|android/i.test(ua) ? "mobile" : "desktop";

    // Only external referrers are interesting
    let ref: string | null = null;
    if (typeof referrer === "string" && referrer) {
      try {
        const host = new URL(referrer).hostname;
        if (host && !host.includes("joshuaisaiah.art") && !host.includes("localhost")) {
          ref = host;
        }
      } catch {}
    }

    await (prisma as any).metric.create({
      data: { type, path: path.slice(0, 200), referrer: ref, visitor, device },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
