import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

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

    const video = await (prisma as any).socialVideo.findUnique({ where: { id } });

    await (prisma as any).socialVideo.delete({
      where: { id },
    });

    // Remove locally stored files (uploaded thumbnail and/or self-hosted video)
    for (const url of [video?.thumbnailUrl, video?.sourceUrl]) {
      if (url?.startsWith("/reels/")) {
        try {
          await unlink(path.join(process.cwd(), "public", url));
        } catch (e: any) {
          if (e.code !== "ENOENT") console.error("Could not delete reel file:", e);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete social video:", error);
    return NextResponse.json(
      { error: "Failed to delete social video" },
      { status: 500 }
    );
  }
}
