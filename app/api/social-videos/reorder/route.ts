import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoIds } = body;

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json(
        { error: "videoIds array is required" },
        { status: 400 }
      );
    }

    await Promise.all(
      videoIds.map((id: string, index: number) =>
        (prisma as any).socialVideo.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder social videos:", error);
    return NextResponse.json(
      { error: "Failed to reorder social videos" },
      { status: 500 }
    );
  }
}
