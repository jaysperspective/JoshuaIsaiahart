import { Suspense } from "react";
import { prisma } from "@/app/lib/prisma";
import WorkClient from "./WorkClient";

// Mark as dynamic to avoid prerendering (requires database)
export const dynamic = "force-dynamic";

async function getGalleries() {
  const galleries = await prisma.gallery.findMany({
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
    // Order by sortOrder first (nulls last), then by createdAt as fallback
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ] as any,
  });

  // Serialize dates for client component
  return galleries.map((gallery) => ({
    id: gallery.id,
    title: gallery.title,
    description: gallery.description,
    coverImage: gallery.coverImage,
    downloadable: gallery.downloadable,
    createdAt: gallery.createdAt.toISOString(),
    images: gallery.images.map((image) => ({
      id: image.id,
      filename: image.filename,
      path: image.path,
      caption: image.caption,
    })),
  }));
}

async function getVideoProjects() {
  try {
    const videoProjects = await (prisma as any).videoProject.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    return videoProjects.map((project: any) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      videoUrl: project.videoUrl,
      thumbnailUrl: project.thumbnailUrl,
      createdAt: project.createdAt.toISOString(),
    }));
  } catch {
    // VideoProject model may not exist yet
    return [];
  }
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center">
      <div className="text-white font-body">Loading...</div>
    </div>
  );
}

export default async function WorkPage() {
  const [galleries, videoProjects] = await Promise.all([
    getGalleries(),
    getVideoProjects(),
  ]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <WorkClient galleries={galleries} videoProjects={videoProjects} />
    </Suspense>
  );
}
