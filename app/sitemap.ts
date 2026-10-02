import { MetadataRoute } from "next";
import { prisma } from "@/app/lib/prisma";
import { slugify } from "@/app/lib/slug";

const BASE = "https://joshuaisaiah.art";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/work`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/rate-sheet`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/cv`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/card`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Public galleries get their standalone /g/ pages; unlisted stay out
  try {
    const galleries = await prisma.gallery.findMany({
      where: { unlisted: false } as any,
      select: { title: true, slug: true, updatedAt: true } as any,
    });

    const galleryRoutes: MetadataRoute.Sitemap = galleries.map((g: any) => ({
      url: `${BASE}/g/${g.slug || slugify(g.title)}`,
      lastModified: g.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    // Film pages carry VideoObject JSON-LD; listing them lets Google crawl
    // and discover the videos (otherwise "Discovered videos: 0" in Search Console).
    let filmRoutes: MetadataRoute.Sitemap = [];
    try {
      const films = await prisma.videoProject.findMany({
        select: { title: true, createdAt: true },
      });
      filmRoutes = films.map((f) => ({
        url: `${BASE}/film/${slugify(f.title)}`,
        lastModified: f.createdAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    } catch {
      // videoProject unavailable — fall through with galleries only
    }

    return [...staticRoutes, ...galleryRoutes, ...filmRoutes];
  } catch {
    return staticRoutes;
  }
}
