import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// POST: Reorder galleries by accepting an array of gallery IDs in desired order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { galleryIds } = body;

    if (!galleryIds || !Array.isArray(galleryIds) || galleryIds.length === 0) {
      return NextResponse.json(
        { error: "galleryIds array is required" },
        { status: 400 }
      );
    }

    // Update sortOrder for each gallery based on position in array
    // Note: sortOrder field pending schema migration
    await Promise.all(
      galleryIds.map((id: string, index: number) =>
        prisma.gallery.update({
          where: { id },
          data: { sortOrder: index } as any,
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder galleries:", error);
    return NextResponse.json(
      { error: "Failed to reorder galleries" },
      { status: 500 }
    );
  }
}
