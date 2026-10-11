import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { slugify } from "@/app/lib/slug";
import { parseVideoUrl, getThumbnailUrl } from "@/app/lib/video-utils";
import FilmView from "./FilmView";

// Reads from the DB but nothing per-request — serve via ISR (edge-cacheable).
export const revalidate = 10800; // 3h

interface FilmData {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  slug: string;
  createdAt: string;
}

async function getFilm(slug: string): Promise<FilmData | null> {
  try {
    const rows = await prisma.videoProject.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    // Match slugified title (pretty URLs) or fall back to the raw id
    const v = rows.find((p) => slugify(p.title) === slug || p.id === slug);
    if (!v) return null;
    return {
      id: v.id,
      title: v.title,
      description: v.description ?? null,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl ?? null,
      slug: slugify(v.title),
      createdAt: v.createdAt.toISOString(),
    };
  } catch {
    return null;
  }
}

function previewImage(film: FilmData): string {
  return film.thumbnailUrl || getThumbnailUrl(parseVideoUrl(film.videoUrl)) || "/og-image.jpg";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const film = await getFilm(slug);
  if (!film) return { title: "Film" };

  const description = film.description || `A film by Joshua Isaiah`;
  const image = previewImage(film);
  const url = `https://joshuaisaiah.art/film/${film.slug}`;

  return {
    title: film.title,
    description,
    alternates: { canonical: `/film/${film.slug}` },
    openGraph: {
      title: film.title,
      description,
      url,
      siteName: "Joshua Isaiah",
      images: [image],
      type: "video.other",
    },
    twitter: {
      card: "summary_large_image",
      title: film.title,
      description,
      images: [image],
    },
  };
}

export default async function FilmPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const film = await getFilm(slug);
  if (!film) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoObject",
        name: film.title,
        description: film.description || undefined,
        thumbnailUrl: previewImage(film),
        uploadDate: film.createdAt,
        contentUrl: film.videoUrl,
        url: `https://joshuaisaiah.art/film/${film.slug}`,
        author: { "@id": "https://joshuaisaiah.art/#joshua" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://joshuaisaiah.art" },
          { "@type": "ListItem", position: 2, name: "Work", item: "https://joshuaisaiah.art/work" },
          { "@type": "ListItem", position: 3, name: film.title, item: `https://joshuaisaiah.art/film/${film.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FilmView
        title={film.title}
        description={film.description}
        videoUrl={film.videoUrl}
        slug={film.slug}
      />
    </>
  );
}
