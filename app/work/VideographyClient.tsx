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

const VIDEO_ACCENT = "var(--accent-videography)";

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
      <div
        className="neu-card p-12 text-center"
        style={{ borderLeftWidth: "4px", borderLeftColor: VIDEO_ACCENT }}
      >
        <p className="font-body text-[var(--text-muted)]">No video projects available yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {videoProjects.map((project) => {
          const thumbnail = getDisplayThumbnail(project);
          const parsed = parseVideoUrl(project.videoUrl);

          return (
            <article
              key={project.id}
              onClick={() => openLightbox(project)}
              className="group neu-card neu-card-interactive cursor-pointer overflow-hidden flex flex-col"
              style={{ borderLeftWidth: "4px", borderLeftColor: VIDEO_ACCENT }}
            >
              {/* Thumbnail */}
              <div className="relative w-full aspect-video bg-[var(--background)]">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-[var(--text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center border-2"
                    style={{ borderColor: VIDEO_ACCENT, background: "var(--card-bg)" }}
                  >
                    <svg className="w-6 h-6 ml-0.5" fill={VIDEO_ACCENT} viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2 text-[11px]">
                  <span
                    className="font-medium px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-body"
                    style={{ color: VIDEO_ACCENT, border: `1px solid ${VIDEO_ACCENT}` }}
                  >
                    Video
                  </span>
                  {parsed.service && parsed.service !== "direct" && (
                    <span className="font-body text-[var(--text-muted)] uppercase tracking-wide capitalize">
                      {parsed.service}
                    </span>
                  )}
                </div>

                <h2 className="font-heading text-lg font-semibold text-[var(--foreground)] leading-snug">
                  {project.title}
                </h2>

                {project.description && (
                  <p className="font-body text-sm text-[var(--text-muted)] line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxVideo && (
        <div
          className="fixed inset-0 bg-[var(--background)]/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto lightbox-enter"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="w-full max-w-5xl flex flex-col gap-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="aspect-video rounded-sm overflow-hidden border-2"
              style={{ borderColor: "var(--border-color)" }}
            >
              {parseVideoUrl(lightboxVideo.videoUrl).service === "direct" ? (
                <video
                  src={lightboxVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              ) : (
                <iframe
                  src={getVideoEmbed(lightboxVideo) || ""}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <div className="text-center px-4">
              <h3 className="font-heading text-xl font-semibold text-[var(--foreground)]">
                {lightboxVideo.title}
              </h3>
              {lightboxVideo.description && (
                <p className="font-body text-sm text-[var(--text-muted)] mt-2 max-h-32 overflow-y-auto">
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
