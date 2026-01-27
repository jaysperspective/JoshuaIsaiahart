import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify gallery exists
    const gallery = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Create gallery directory if it doesn't exist
    const galleryDir = path.join(process.cwd(), "public", "galleries", id);
    await mkdir(galleryDir, { recursive: true });

    // Get current max order
    const maxOrderImage = await prisma.image.findFirst({
      where: { galleryId: id },
      orderBy: { order: "desc" },
    });
    let currentOrder = maxOrderImage ? maxOrderImage.order + 1 : 0;

    const uploadedImages = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${timestamp}-${sanitizedName}`;
      const filepath = path.join(galleryDir, filename);

      // Write file
      await writeFile(filepath, buffer);

      // Create database entry
      const image = await prisma.image.create({
        data: {
          filename,
          path: `/galleries/${id}/${filename}`,
          galleryId: id,
          order: currentOrder++,
        },
      });

      uploadedImages.push(image);

      // Set first image as cover if gallery has no cover
      if (!gallery.coverImage) {
        await prisma.gallery.update({
          where: { id },
          data: { coverImage: `/galleries/${id}/${filename}` },
        });
      }
    }

    return NextResponse.json(uploadedImages, { status: 201 });
  } catch (error) {
    console.error("Failed to upload images:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
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
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    await prisma.image.delete({
      where: { id: imageId, galleryId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
