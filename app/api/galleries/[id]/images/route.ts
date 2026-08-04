import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import Busboy from "busboy";
import { Readable } from "stream";

// Disable Next.js body parsing — we handle the stream ourselves
export const config = { api: { bodyParser: false } };

async function compress(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

function parseMultipart(req: NextRequest): Promise<{ fieldname: string; buffer: Buffer; filename: string; mimetype: string }[]> {
  return new Promise((resolve, reject) => {
    const contentType = req.headers.get("content-type") || "";
    const bb = Busboy({ headers: { "content-type": contentType }, limits: { fileSize: 70 * 1024 * 1024 } });

    const files: { fieldname: string; buffer: Buffer; filename: string; mimetype: string }[] = [];

    bb.on("file", (fieldname, stream, info) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => {
        files.push({ fieldname, buffer: Buffer.concat(chunks), filename: info.filename, mimetype: info.mimeType });
      });
      stream.on("error", reject);
    });

    bb.on("finish", () => resolve(files));
    bb.on("error", reject);

    // Pipe the request body into busboy
    req.arrayBuffer().then((ab) => {
      const readable = Readable.from(Buffer.from(ab));
      readable.pipe(bb);
    }).catch(reject);
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const gallery = await prisma.gallery.findUnique({ where: { id } });
    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    const parsed = await parseMultipart(request);
    const fileEntries = parsed.filter((f) => f.fieldname === "files");

    if (fileEntries.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const galleryDir = path.join(process.cwd(), "public", "galleries", id);
    await mkdir(galleryDir, { recursive: true });

    const maxOrderImage = await prisma.image.findFirst({
      where: { galleryId: id },
      orderBy: { order: "desc" },
    });
    let currentOrder = maxOrderImage ? maxOrderImage.order + 1 : 0;

    const uploadedImages = [];
    let hasCover = !!gallery.coverImage;

    for (const entry of fileEntries) {
      const compressed = await compress(entry.buffer);

      const timestamp = Date.now();
      const baseName = entry.filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-]/g, "_");
      const filename = `${timestamp}-${baseName}.jpg`;
      const filepath = path.join(galleryDir, filename);

      await writeFile(filepath, compressed);

      const image = await prisma.image.create({
        data: {
          filename,
          path: `/galleries/${id}/${filename}`,
          galleryId: id,
          order: currentOrder++,
        },
      });

      uploadedImages.push(image);

      if (!hasCover) {
        await prisma.gallery.update({
          where: { id },
          data: { coverImage: `/galleries/${id}/${filename}` },
        });
        hasCover = true;
      }
    }

    return NextResponse.json(uploadedImages, { status: 201 });
  } catch (error) {
    console.error("Failed to upload images:", error);
    return NextResponse.json({ error: "Failed to upload images" }, { status: 500 });
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
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
    }

    const image = await prisma.image.findUnique({
      where: { id: imageId, galleryId: id },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), "public", image.path);
    try {
      await unlink(filePath);
    } catch (e: any) {
      if (e.code !== "ENOENT") console.error("Could not delete file:", filePath, e);
    }

    await prisma.image.delete({ where: { id: imageId, galleryId: id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete image:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
