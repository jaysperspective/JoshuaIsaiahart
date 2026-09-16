import { Suspense } from "react";
import { prisma } from "@/app/lib/prisma";
import WorkClient from "./WorkClient";

// Mark as dynamic to avoid prerendering (requires database)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Work — Photography, Film & Social",
  description:
    "Selected work by Joshua Isaiah — photography galleries, films and event coverage, and short-form social video for clients in the Washington, DC metro area.",
  alternates: { canonical: "/work" },
};

async function getGalleries() {
  try {
    const galleries = await prisma.gallery.findMany({
      // Unlisted galleries only appear at their direct /g/<slug> link
      where: { unlisted: false } as any,
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
  } catch {
    // Database unavailable (e.g. no DATABASE_URL locally) — render empty state
    return [];
  }
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

async function getSocialVideos() {
  try {
    const socialVideos = await (prisma as any).socialVideo.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    return socialVideos.map((video: any) => ({
      id: video.id,
      caption: video.caption,
      sourceUrl: video.sourceUrl,
      thumbnailUrl: video.thumbnailUrl,
      createdAt: video.createdAt.toISOString(),
    }));
  } catch {
    // SocialVideo model may not exist yet
    return [];
  }
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="label">Loading…</div>
    </div>
  );
}

export default async function WorkPage() {
  const [galleries, videoProjects, socialVideos] = await Promise.all([
    getGalleries(),
    getVideoProjects(),
    getSocialVideos(),
  ]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <WorkClient galleries={galleries} videoProjects={videoProjects} socialVideos={socialVideos} />
    </Suspense>
  );
}
