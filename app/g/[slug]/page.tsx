import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { slugify } from "@/app/lib/slug";
import { pinToken, pinCookieName } from "@/app/lib/pin";
import GalleryGridClient from "./GalleryGridClient";
import PinGate from "./PinGate";

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
      unlisted: Boolean((gallery as any).unlisted),
      downloadable: gallery.downloadable,
      pin: ((gallery as any).pin as string | null) || null,
      slug: (gallery as any).slug || slugify(gallery.title),
      images: gallery.images.map((image) => ({
        id: image.id,
        filename: image.filename,
        path: image.path,
        caption: image.caption,
        selected: Boolean((image as any).selected),
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

  // Cover photo (or first image) fronts the link preview — including for
  // PIN galleries, where the gate protects everything past the one frame
  const previewImage = gallery.coverImage || gallery.images[0]?.path || "/og-image.jpg";
  const description =
    gallery.description || `${gallery.images.length} photographs by Joshua Isaiah`;

  return {
    title: gallery.title,
    description,
    alternates: { canonical: `/g/${gallery.slug}` },
    // Unlisted galleries are private client links — keep them out of search
    robots: gallery.unlisted ? { index: false, follow: false } : undefined,
    openGraph: {
      title: gallery.title,
      description,
      url: `https://joshuaisaiah.art/g/${gallery.slug}`,
      siteName: "Joshua Isaiah",
      images: [previewImage], // dimensions vary per photo — let platforms measure
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: gallery.title,
      description,
      images: [previewImage],
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

  // PIN-protected galleries show the gate until the cookie checks out
  if (gallery.pin) {
    const jar = await cookies();
    const cookie = jar.get(pinCookieName(gallery.id))?.value;
    if (cookie !== pinToken(gallery.id, gallery.pin)) {
      return <PinGate slug={gallery.slug} title={gallery.title} />;
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: gallery.title,
    description: gallery.description || undefined,
    url: `https://joshuaisaiah.art/g/${gallery.slug}`,
    author: { "@id": "https://joshuaisaiah.art/#joshua" },
    image: gallery.images
      .slice(0, 10)
      .map((img) => `https://joshuaisaiah.art${img.path}`),
  };

  return (
    <>
      {!gallery.unlisted && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <GalleryGridClient gallery={gallery} />
    </>
  );
}
