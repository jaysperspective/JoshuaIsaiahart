import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [totals, topPages, topReferrers, byDay] = await Promise.all([
      prisma.$queryRaw`
        SELECT "type", COUNT(*)::int AS count, COUNT(DISTINCT "visitor")::int AS visitors
        FROM "Metric" WHERE "createdAt" >= ${since} GROUP BY "type"`,
      prisma.$queryRaw`
        SELECT "path", COUNT(*)::int AS count
        FROM "Metric" WHERE "createdAt" >= ${since} AND "type" = 'view'
        GROUP BY "path" ORDER BY count DESC LIMIT 10`,
      prisma.$queryRaw`
        SELECT "referrer", COUNT(*)::int AS count
        FROM "Metric" WHERE "createdAt" >= ${since} AND "type" = 'view' AND "referrer" IS NOT NULL
        GROUP BY "referrer" ORDER BY count DESC LIMIT 10`,
      prisma.$queryRaw`
        SELECT to_char(date_trunc('day', "createdAt"), 'MM-DD') AS day, COUNT(*)::int AS count
        FROM "Metric" WHERE "createdAt" >= ${since} AND "type" = 'view'
        GROUP BY 1 ORDER BY 1`,
    ]);

    return NextResponse.json({ totals, topPages, topReferrers, byDay });
  } catch (error) {
    console.error("Failed to load metrics summary:", error);
    return NextResponse.json({ error: "Failed to load metrics" }, { status: 500 });
  }
}
