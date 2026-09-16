import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { caption, sourceUrl, thumbnailUrl } = body;

    const socialVideo = await (prisma as any).socialVideo.update({
      where: { id },
      data: {
        ...(caption !== undefined && { caption }),
        ...(sourceUrl !== undefined && { sourceUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      },
    });

    return NextResponse.json(socialVideo);
  } catch (error) {
    console.error("Failed to update social video:", error);
    return NextResponse.json(
      { error: "Failed to update social video" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await (prisma as any).socialVideo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete social video:", error);
    return NextResponse.json(
      { error: "Failed to delete social video" },
      { status: 500 }
    );
  }
}
