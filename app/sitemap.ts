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

    return [...staticRoutes, ...galleryRoutes];
  } catch {
    return staticRoutes;
  }
}
