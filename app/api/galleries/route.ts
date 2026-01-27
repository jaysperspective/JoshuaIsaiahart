import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const galleries = await prisma.gallery.findMany({
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
      // Order by sortOrder first (nulls last), then by createdAt as fallback
      // Note: sortOrder field pending schema migration
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ] as any,
    });
    return NextResponse.json(galleries);
  } catch (error) {
    console.error("Failed to fetch galleries:", error);
    return NextResponse.json(
      { error: "Failed to fetch galleries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, downloadable } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Get the highest current sortOrder to place new gallery at the end
    // Note: sortOrder field pending schema migration
    const lastGallery = await prisma.gallery.findFirst({
      orderBy: { sortOrder: "desc" } as any,
      select: { sortOrder: true } as any,
    });
    const nextSortOrder = ((lastGallery as any)?.sortOrder ?? -1) + 1;

    const gallery = await prisma.gallery.create({
      data: {
        title,
        description: description || null,
        downloadable: downloadable || false,
        sortOrder: nextSortOrder,
      } as any,
    });

    return NextResponse.json(gallery, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery:", error);
    return NextResponse.json(
      { error: "Failed to create gallery" },
      { status: 500 }
    );
  }
}
