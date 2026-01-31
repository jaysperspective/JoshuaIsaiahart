import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectIds } = body;

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        { error: "projectIds array is required" },
        { status: 400 }
      );
    }

    // Update sortOrder for each video project based on position in array
    await Promise.all(
      projectIds.map((id: string, index: number) =>
        (prisma as any).videoProject.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder video projects:", error);
    return NextResponse.json(
      { error: "Failed to reorder video projects" },
      { status: 500 }
    );
  }
}
