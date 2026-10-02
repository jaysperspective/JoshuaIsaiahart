import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";
import { resolveConfig, DEFAULT_BOOKING_CONFIG } from "@/app/lib/booking-config";

// GET (admin): the current resolved booking config, for the editor.
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const settings = await (prisma as any).settings.findFirst();
    const cfg = settings?.bookingConfig
      ? resolveConfig(JSON.parse(settings.bookingConfig))
      : DEFAULT_BOOKING_CONFIG;
    return NextResponse.json(cfg);
  } catch {
    return NextResponse.json(DEFAULT_BOOKING_CONFIG);
  }
}

// PUT (admin): save the booking config (stored as JSON on Settings).
export async function PUT(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const body = await request.json();
    const cfg = resolveConfig(body);
    const json = JSON.stringify(cfg);

    const existing = await (prisma as any).settings.findFirst();
    if (existing) {
      await (prisma as any).settings.update({
        where: { id: existing.id },
        data: { bookingConfig: json },
      });
    } else {
      await (prisma as any).settings.create({
        data: {
          instagramUrl: "",
          linkedinUrl: "",
          youtubeUrl: "",
          bookingConfig: json,
        },
      });
    }
    return NextResponse.json(cfg);
  } catch (e) {
    console.error("Failed to save booking config:", e);
    return NextResponse.json({ error: "Failed to save booking config" }, { status: 500 });
  }
}
