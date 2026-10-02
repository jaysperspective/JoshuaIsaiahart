import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { resolveConfig, generateSlots, DEFAULT_BOOKING_CONFIG } from "@/app/lib/booking-config";

// Public: the booking card reads this to render available days/times and
// grey out slots that are already taken.
export async function GET() {
  let cfg = DEFAULT_BOOKING_CONFIG;
  try {
    const settings = await (prisma as any).settings.findFirst();
    if (settings?.bookingConfig) {
      cfg = resolveConfig(JSON.parse(settings.bookingConfig));
    }
  } catch {
    // defaults
  }

  const slots = generateSlots(cfg);

  // Already-booked slots (future only), keyed by calendar date -> times.
  const taken: Record<string, string[]> = {};
  try {
    const since = new Date();
    since.setDate(since.getDate() - 1);
    const rows = await (prisma as any).booking.findMany({
      where: { date: { gte: since }, status: { not: "cancelled" } },
      select: { dateYmd: true, time: true },
    });
    for (const r of rows as { dateYmd: string | null; time: string }[]) {
      if (!r.dateYmd) continue;
      (taken[r.dateYmd] ??= []).push(r.time);
    }
  } catch {
    // table may not exist yet — no conflicts known
  }

  return NextResponse.json({
    days: cfg.days,
    windowDays: cfg.windowDays,
    slots,
    taken,
  });
}
