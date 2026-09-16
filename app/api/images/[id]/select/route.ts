import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { pinToken, pinCookieName } from "@/app/lib/pin";

// Clients toggle their favorites from /g/<slug> — no auth beyond the
// gallery PIN (when one is set)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { selected } = await request.json();

    const image = await prisma.image.findUnique({
      where: { id },
      include: { gallery: true },
    });
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const pin = (image.gallery as any).pin;
    if (pin) {
      const cookie = request.cookies.get(pinCookieName(image.galleryId))?.value;
      if (cookie !== pinToken(image.galleryId, pin)) {
        return NextResponse.json({ error: "Locked" }, { status: 401 });
      }
    }

    const updated = await prisma.image.update({
      where: { id },
      data: { selected: Boolean(selected) } as any,
    });

    return NextResponse.json({ id: updated.id, selected: (updated as any).selected });
  } catch (error) {
    console.error("Failed to update selection:", error);
    return NextResponse.json({ error: "Failed to update selection" }, { status: 500 });
  }
}
