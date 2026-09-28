import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";

// Lifetime view count per gallery, for the admin. View metrics are logged with
// the page path, so a gallery's views are the "view" metrics whose path is its
// public "/g/<slug>". LEFT JOIN keeps galleries with zero views. Admin-only.
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const rows = await prisma.$queryRaw<{ id: string; views: number }[]>`
      SELECT g."id", COUNT(m."id")::int AS views
      FROM "Gallery" g
      LEFT JOIN "Metric" m ON m."type" = 'view' AND m."path" = '/g/' || g."slug"
      GROUP BY g."id"`;

    const map: Record<string, number> = {};
    for (const r of rows) map[r.id] = r.views;
    return NextResponse.json(map);
  } catch (error) {
    console.error("Failed to load gallery views:", error);
    return NextResponse.json({ error: "Failed to load gallery views" }, { status: 500 });
  }
}
