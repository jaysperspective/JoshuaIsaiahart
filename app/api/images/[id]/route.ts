import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const { id } = await params;
    const body = await request.json();
    const { caption } = body;

    const image = await prisma.image.update({
      where: { id },
      data: { caption },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error("Failed to update image:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}
