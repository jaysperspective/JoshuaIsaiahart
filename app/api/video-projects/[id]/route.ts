import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const videoProject = await (prisma as any).videoProject.findUnique({
      where: { id },
    });

    if (!videoProject) {
      return NextResponse.json(
        { error: "Video project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(videoProject);
  } catch (error) {
    console.error("Failed to fetch video project:", error);
    return NextResponse.json(
      { error: "Failed to fetch video project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, videoUrl, thumbnailUrl } = body;

    const videoProject = await (prisma as any).videoProject.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      },
    });

    return NextResponse.json(videoProject);
  } catch (error) {
    console.error("Failed to update video project:", error);
    return NextResponse.json(
      { error: "Failed to update video project" },
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

    await (prisma as any).videoProject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete video project:", error);
    return NextResponse.json(
      { error: "Failed to delete video project" },
      { status: 500 }
    );
  }
}
