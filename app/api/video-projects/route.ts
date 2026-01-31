import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const videoProjects = await (prisma as any).videoProject.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
    });
    return NextResponse.json(videoProjects);
  } catch (error) {
    console.error("Failed to fetch video projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch video projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, videoUrl, thumbnailUrl } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Get the highest current sortOrder to place new project at the end
    const lastProject = await (prisma as any).videoProject.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const nextSortOrder = (lastProject?.sortOrder ?? -1) + 1;

    const videoProject = await (prisma as any).videoProject.create({
      data: {
        title,
        description: description || null,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json(videoProject, { status: 201 });
  } catch (error) {
    console.error("Failed to create video project:", error);
    return NextResponse.json(
      { error: "Failed to create video project" },
      { status: 500 }
    );
  }
}
