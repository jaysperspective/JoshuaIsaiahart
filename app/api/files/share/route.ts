import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { slugify } from "@/app/lib/slug";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";
import { spacesConfigured, listImagesRecursive, CDN_BASE } from "@/app/lib/storage";

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

// Find an existing gallery already backed by this folder, by matching image
// paths against the folder's CDN URL prefix. Returns the best match (the
// gallery with the most images under this prefix).
async function findGalleryForPrefix(prefix: string) {
  const cdnPrefix = `${CDN_BASE}/${prefix}`;
  const galleries = await prisma.gallery.findMany({ include: { images: true } });
  let best: (typeof galleries)[number] | null = null;
  let bestCount = 0;
  for (const g of galleries) {
    const matching = g.images.filter((im) => im.path.startsWith(cdnPrefix)).length;
    if (matching > bestCount) {
      best = g;
      bestCount = matching;
    }
  }
  if (!best || bestCount === 0) return null;
  return {
    id: best.id,
    title: best.title,
    slug: best.slug,
    unlisted: !!best.unlisted,
    downloadable: !!best.downloadable,
    hasPin: !!best.pin,
    count: best.images.length,
  };
}

// GET /api/files/share?prefix=  → { existing: {...} | null }
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  if (!spacesConfigured) {
    return NextResponse.json({ error: "Cloud storage not configured" }, { status: 501 });
  }
  const raw = cleanPrefix(new URL(request.url).searchParams.get("prefix") || "");
  if (!raw) return NextResponse.json({ existing: null });
  const existing = await findGalleryForPrefix(`${raw}/`);
  return NextResponse.json({ existing });
}

// POST /api/files/share
//   create: { prefix, title?, pin?, downloadable?, unlisted? }
//   update: { prefix, galleryId, update: true, title?, pin?, downloadable?, unlisted? }
// Create builds a new gallery from every image under `prefix` (no re-upload —
// Image.path is the existing CDN URL). Update re-syncs an existing gallery's
// images to the current folder contents, preserving cover/captions/selects.
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
    const unlisted = body.unlisted !== false; // public on /work when explicitly false
    const pin = unlisted && body.pin && String(body.pin).trim() ? String(body.pin).trim() : null;
    const downloadable = Boolean(body.downloadable);

    // ---- UPDATE an existing gallery: re-sync images, keep the rest ----
    if (body.update && body.galleryId) {
      const gallery = await prisma.gallery.findUnique({
        where: { id: String(body.galleryId) },
        include: { images: true },
      });
      if (!gallery) {
        return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
      }

      const wantedByUrl = new Map(images.map((img) => [img.url, img]));
      const existingByPath = new Map(gallery.images.map((im) => [im.path, im]));

      // Remove images no longer in the folder.
      const toDelete = gallery.images.filter((im) => !wantedByUrl.has(im.path));
      if (toDelete.length) {
        await prisma.image.deleteMany({ where: { id: { in: toDelete.map((i) => i.id) } } });
      }
      // Add images newly present in the folder.
      const toAdd = images.filter((img) => !existingByPath.has(img.url));
      let order = gallery.images.reduce((m, im) => Math.max(m, im.order), -1) + 1;
      if (toAdd.length) {
        await prisma.image.createMany({
          data: toAdd.map((img) => ({
            filename: img.name,
            path: img.url,
            galleryId: gallery.id,
            order: order++,
          })),
        });
      }
      // Keep the current cover if it still exists; otherwise use the first image.
      const coverStillThere = gallery.coverImage && wantedByUrl.has(gallery.coverImage);
      await prisma.gallery.update({
        where: { id: gallery.id },
        data: {
          title,
          unlisted,
          downloadable,
          pin,
          coverImage: coverStillThere ? gallery.coverImage : images[0].url,
        },
      });

      return NextResponse.json({
        slug: gallery.slug,
        url: `/g/${gallery.slug}`,
        count: images.length,
        added: toAdd.length,
        removed: toDelete.length,
        galleryId: gallery.id,
        unlisted,
        updated: true,
      });
    }

    // ---- CREATE a new gallery ----
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
      data: { title, slug, unlisted, downloadable, pin, sortOrder, coverImage: images[0].url },
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
