import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";

// GET (admin): all bookings, most recent first.
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const bookings = await (prisma as any).booking.findMany({
      orderBy: { date: "desc" },
      take: 500,
    });
    return NextResponse.json(bookings);
  } catch {
    // Table may not exist yet.
    return NextResponse.json([]);
  }
}

// PATCH (admin): update a booking's status (new | done | cancelled).
export async function PATCH(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const { id, status } = await request.json();
    if (!id || !["new", "done", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
    }
    const updated = await (prisma as any).booking.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Failed to update booking:", e);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

// DELETE (admin): remove a booking.
export async function DELETE(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await (prisma as any).booking.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to delete booking:", e);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
