import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";

// POST /api/shop/reorder  (admin) → { ids: string[] } sets sortOrder by index
export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 });
    }
    await Promise.all(
      ids.map((id: string, index: number) =>
        prisma.shopProduct.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder shop products:", error);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
