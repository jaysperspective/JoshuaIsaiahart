"use client";

import { useState } from "react";
import { parseVideoUrl, getEmbedUrl, getThumbnailUrl } from "@/app/lib/video-utils";

interface VideoProject {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

interface VideographyClientProps {
  videoProjects: VideoProject[];
}

export default function VideographyClient({ videoProjects }: VideographyClientProps) {
  const [lightboxVideo, setLightboxVideo] = useState<VideoProject | null>(null);

  const getDisplayThumbnail = (project: VideoProject) => {
    if (project.thumbnailUrl) {
      return project.thumbnailUrl;
    }
    const parsed = parseVideoUrl(project.videoUrl);
    return getThumbnailUrl(parsed);
  };

  const openLightbox = (project: VideoProject) => {
    setLightboxVideo(project);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxVideo(null);
    document.body.style.overflow = "";
  };

  const getVideoEmbed = (project: VideoProject) => {
    const parsed = parseVideoUrl(project.videoUrl);
    return getEmbedUrl(parsed);
  };

  if (videoProjects.length === 0) {
    return (
      <div className="surface py-24 text-center">
        <p className="label">No video projects available yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        {videoProjects.map((project, index) => {
          const thumbnail = getDisplayThumbnail(project);
          const parsed = parseVideoUrl(project.videoUrl);

          return (
            <div
              key={project.id}
              onClick={() => openLightbox(project)}
              className="group cursor-pointer border-t border-rule py-10 first:border-t-0 first:pt-2"
            >
              {/* Caption line */}
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="label numeral">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="headline text-[1.6rem] sm:text-[2rem] transition-colors group-hover:text-accent">
                    {project.title}
                  </h2>
                </div>
                {parsed.service && parsed.service !== "direct" && (
                  <span className="label shrink-0 self-center capitalize">{parsed.service}</span>
                )}
              </div>

              {/* Thumbnail */}
              <div className="relative overflow-hidden rounded-[4px] bg-paper-2 aspect-video lg:aspect-auto lg:h-[58vh]">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={project.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-paper-2">
                    <svg className="h-16 w-16 text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vigne/55 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-accent">
                    <svg className="ml-1 h-7 w-7 text-paper" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p className="prose-serif mt-4 max-w-2xl text-[1.05rem] line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Video Lightbox */}
      {lightboxVideo && (
        <div
          className="fixed inset-0 bg-vigne/95 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-paper/70 hover:text-paper transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="w-full max-w-5xl flex flex-col gap-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video */}
            <div className="aspect-video">
              {parseVideoUrl(lightboxVideo.videoUrl).service === "direct" ? (
                <video
                  src={lightboxVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full rounded-[4px]"
                />
              ) : (
                <iframe
                  src={getVideoEmbed(lightboxVideo) || ""}
                  className="w-full h-full rounded-[4px]"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Video info below */}
            <div className="text-center px-4">
              <h3 className="text-paper font-display text-xl font-medium">
                {lightboxVideo.title}
              </h3>
              {lightboxVideo.description && (
                <p className="text-paper/70 font-sans text-sm mt-2 max-h-32 overflow-y-auto">
                  {lightboxVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
