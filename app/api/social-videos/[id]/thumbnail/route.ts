import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import Busboy from "busboy";
import { Readable } from "stream";
import { spacesConfigured, uploadToSpaces, deleteFromSpaces } from "@/app/lib/storage";

export const config = { api: { bodyParser: false } };

async function compress(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(900, 1600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

function parseMultipart(req: NextRequest): Promise<{ buffer: Buffer; filename: string }[]> {
  return new Promise((resolve, reject) => {
    const contentType = req.headers.get("content-type") || "";
    const bb = Busboy({ headers: { "content-type": contentType }, limits: { fileSize: 70 * 1024 * 1024 } });

    const files: { buffer: Buffer; filename: string }[] = [];

    bb.on("file", (_fieldname, stream, info) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => {
        files.push({ buffer: Buffer.concat(chunks), filename: info.filename });
      });
      stream.on("error", reject);
    });

    bb.on("finish", () => resolve(files));
    bb.on("error", reject);

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

    const video = await (prisma as any).socialVideo.findUnique({ where: { id } });
    if (!video) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    const files = await parseMultipart(request);
    if (files.length === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const compressed = await compress(files[0].buffer);

    const filename = `${id}-${Date.now()}.jpg`;
    let thumbnailUrl: string;
    if (spacesConfigured) {
      thumbnailUrl = await uploadToSpaces(`reels/${filename}`, compressed, "image/jpeg");
    } else {
      const reelsDir = path.join(process.cwd(), "public", "reels");
      await mkdir(reelsDir, { recursive: true });
      await writeFile(path.join(reelsDir, filename), compressed);
      thumbnailUrl = `/reels/${filename}`;
    }

    // Remove a previously uploaded thumbnail (local or Spaces)
    if (video.thumbnailUrl?.startsWith("/reels/")) {
      try {
        await unlink(path.join(process.cwd(), "public", video.thumbnailUrl));
      } catch (e: any) {
        if (e.code !== "ENOENT") console.error("Could not delete old thumbnail:", e);
      }
    } else if (video.thumbnailUrl?.startsWith("http")) {
      await deleteFromSpaces(video.thumbnailUrl);
    }

    const updated = await (prisma as any).socialVideo.update({
      where: { id },
      data: { thumbnailUrl },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to upload thumbnail:", error);
    return NextResponse.json(
      { error: "Failed to upload thumbnail" },
      { status: 500 }
    );
  }
}
