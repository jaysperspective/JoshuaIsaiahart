import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { slugify } from "@/app/lib/slug";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";
import { spacesConfigured, listImagesRecursive } from "@/app/lib/storage";

function cleanPrefix(s: string): string {
  return s
    .replace(/^\/+/, "")
    .split("/")
    .filter((seg) => seg && seg !== "." && seg !== "..")
    .join("/");
}

// Turn a folder name into a human title: "client_smith-wedding" → "Client Smith Wedding"
function titleFromPrefix(prefix: string): string {
  const last = prefix.replace(/\/$/, "").split("/").pop() || "Album";
  return last
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// POST /api/files/share  { prefix, title?, pin?, downloadable? }
// Creates an UNLISTED gallery from every image under `prefix` (no re-upload —
// Image.path points at the existing CDN URL), reusing the /g/[slug] share
// pipeline (PIN gate + zip download).
export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  if (!spacesConfigured) {
    return NextResponse.json({ error: "Cloud storage not configured" }, { status: 501 });
  }
  try {
    const body = await request.json();
    const prefixRaw = cleanPrefix(body.prefix || "");
    if (!prefixRaw) {
      return NextResponse.json({ error: "Folder prefix required" }, { status: 400 });
    }
    const prefix = `${prefixRaw}/`;

    const images = await listImagesRecursive(prefix);
    if (images.length === 0) {
      return NextResponse.json({ error: "No images found in this folder" }, { status: 400 });
    }

    const title = (body.title && String(body.title).trim()) || titleFromPrefix(prefix);
    // Public (show on /work) when unlisted === false; otherwise private link.
    const unlisted = body.unlisted !== false;
    // A public on-site gallery is never PIN-locked.
    const pin = unlisted && body.pin && String(body.pin).trim() ? String(body.pin).trim() : null;
    const downloadable = Boolean(body.downloadable);

    // Unique slug (mirrors app/api/galleries/route.ts collision handling).
    const base = slugify(title) || "album";
    let slug = base;
    let n = 2;
    // eslint-disable-next-line no-await-in-loop
    while (await prisma.gallery.findUnique({ where: { slug } })) {
      slug = `${base}-${n++}`;
    }

    const last = await prisma.gallery.findFirst({ orderBy: { sortOrder: "desc" } });
    const sortOrder = (last?.sortOrder ?? -1) + 1;

    const gallery = await prisma.gallery.create({
      data: {
        title,
        slug,
        unlisted,
        downloadable,
        pin,
        sortOrder,
        coverImage: images[0].url,
      },
    });

    await prisma.image.createMany({
      data: images.map((img, i) => ({
        filename: img.name,
        path: img.url,
        galleryId: gallery.id,
        order: i,
      })),
    });

    return NextResponse.json(
      { slug, url: `/g/${slug}`, count: images.length, galleryId: gallery.id, unlisted },
      { status: 201 }
    );
  } catch (e) {
    console.error("Failed to share folder as album:", e);
    return NextResponse.json({ error: "Failed to create album" }, { status: 500 });
  }
}
