import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { pinToken, pinCookieName } from "@/app/lib/pin";
import { slugify } from "@/app/lib/slug";
import * as archiverNs from "archiver";
const archiver = (archiverNs as any).default || archiverNs;
import { PassThrough, Readable } from "stream";
import { readFile } from "fs/promises";
import path from "path";

// Streams the whole gallery as a ZIP. Requires the downloadable flag,
// and the PIN cookie when the gallery is protected.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gallery = await prisma.gallery.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    });

    if (!gallery || gallery.images.length === 0) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }
    if (!gallery.downloadable) {
      return NextResponse.json({ error: "Downloads not enabled" }, { status: 403 });
    }

    const pin = (gallery as any).pin;
    if (pin) {
      const cookie = request.cookies.get(pinCookieName(gallery.id))?.value;
      if (cookie !== pinToken(gallery.id, pin)) {
        return NextResponse.json({ error: "Locked" }, { status: 401 });
      }
    }

    const archive = archiver("zip", { zlib: { level: 0 } }); // JPEGs don't recompress
    const out = new PassThrough();
    archive.pipe(out);

    // Append sequentially in the background while the response streams
    (async () => {
      try {
        for (const image of gallery.images) {
          let buffer: Buffer;
          if (image.path.startsWith("http")) {
            const res = await fetch(image.path);
            if (!res.ok) continue;
            buffer = Buffer.from(await res.arrayBuffer());
          } else {
            try {
              buffer = await readFile(path.join(process.cwd(), "public", image.path));
            } catch {
              continue;
            }
          }
          archive.append(buffer, { name: image.filename });
        }
        await archive.finalize();
      } catch (e) {
        console.error("ZIP build failed:", e);
        archive.abort();
      }
    })();

    const filename = `${(gallery as any).slug || slugify(gallery.title) || "gallery"}.zip`;
    return new Response(Readable.toWeb(out) as ReadableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to download gallery:", error);
    return NextResponse.json({ error: "Failed to download gallery" }, { status: 500 });
  }
}
