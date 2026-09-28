import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { pinToken, pinCookieName } from "@/app/lib/pin";
import { readFile } from "fs/promises";
import path from "path";

// Streams a single full-res image as an attachment so it saves with a proper
// filename. A plain <a download> pointing at the CDN can't force the filename
// cross-origin, so the client links here (same-origin) instead. Same guards as
// the whole-gallery download: the gallery must be downloadable, and the PIN
// cookie must match when the gallery is protected.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const image = await prisma.image.findUnique({
      where: { id },
      include: { gallery: true },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    if (!image.gallery.downloadable) {
      return NextResponse.json({ error: "Downloads not enabled" }, { status: 403 });
    }

    const pin = (image.gallery as { pin?: string | null }).pin;
    if (pin) {
      const cookie = request.cookies.get(pinCookieName(image.galleryId))?.value;
      if (cookie !== pinToken(image.galleryId, pin)) {
        return NextResponse.json({ error: "Locked" }, { status: 401 });
      }
    }

    const contentType = mimeFromName(image.filename);
    const disposition = `attachment; filename="${encodeURIComponent(image.filename)}"`;

    if (image.path.startsWith("http")) {
      const upstream = await fetch(image.path);
      if (!upstream.ok || !upstream.body) {
        return NextResponse.json({ error: "Image unavailable" }, { status: 502 });
      }
      const headers: Record<string, string> = {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Cache-Control": "no-store",
      };
      const len = upstream.headers.get("content-length");
      if (len) headers["Content-Length"] = len;
      return new Response(upstream.body as ReadableStream, { headers });
    }

    // Local fallback (dev / keyless deploy): read from public/
    try {
      const buffer = await readFile(path.join(process.cwd(), "public", image.path));
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": disposition,
          "Content-Length": String(buffer.length),
          "Cache-Control": "no-store",
        },
      });
    } catch {
      return NextResponse.json({ error: "Image unavailable" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to download image:", error);
    return NextResponse.json({ error: "Failed to download image" }, { status: 500 });
  }
}

function mimeFromName(name: string): string {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    case "heic":
    case "heif":
      return "image/heic";
    case "tif":
    case "tiff":
      return "image/tiff";
    default:
      return "image/jpeg";
  }
}
