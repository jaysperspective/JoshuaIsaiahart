import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { slugify } from "@/app/lib/slug";
import GalleryGridClient from "./GalleryGridClient";

// Requires database at request time
export const dynamic = "force-dynamic";

async function getGallery(slug: string) {
  try {
    const galleries = await prisma.gallery.findMany({
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    // Match stored slug first; fall back to slugified title for
    // galleries created before slugs existed
    const gallery = galleries.find(
      (g) => (g as any).slug === slug || slugify(g.title) === slug
    );
    if (!gallery) return null;

    return {
      id: gallery.id,
      title: gallery.title,
      description: gallery.description,
      coverImage: gallery.coverImage,
      images: gallery.images.map((image) => ({
        id: image.id,
        filename: image.filename,
        path: image.path,
        caption: image.caption,
      })),
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await getGallery(slug);
  if (!gallery) return { title: "Gallery — Joshua Isaiah" };

  return {
    title: `${gallery.title} — Joshua Isaiah`,
    description: gallery.description || `Photo gallery: ${gallery.title}`,
    openGraph: {
      title: gallery.title,
      description: gallery.description || undefined,
      images: gallery.coverImage ? [gallery.coverImage] : undefined,
    },
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gallery = await getGallery(slug);

  if (!gallery) {
    notFound();
  }

  return <GalleryGridClient gallery={gallery} />;
}
