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
    orderBy: { createdAt: "asc" },
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

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center">
      <div className="text-white font-body">Loading...</div>
    </div>
  );
}

export default async function WorkPage() {
  const galleries = await getGalleries();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <WorkClient galleries={galleries} />
    </Suspense>
  );
}
