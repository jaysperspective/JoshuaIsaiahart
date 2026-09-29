"use client";

import { useState } from "react";
import Link from "next/link";
import { parseVideoUrl, getEmbedUrl, getThumbnailUrl } from "@/app/lib/video-utils";
import { slugify } from "@/app/lib/slug";
import Reveal from "./Reveal";

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const shareFilm = async (project: VideoProject) => {
    const url = `https://joshuaisaiah.art/film/${slugify(project.title)}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: project.title, url });
        return;
      } catch {
        /* cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(project.id);
      setTimeout(() => setCopiedId((id) => (id === project.id ? null : id)), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

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

  const intro = (
    <Reveal>
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="eyebrow mb-4">Long-Form</p>
        <p className="prose-serif">
          Films, event coverage, and interviews — work that takes its time.
          Short-form social pieces made for clients live under{" "}
          <Link href="/work?tab=reels" className="link-underline">
            Social
          </Link>
          .
        </p>
      </div>
    </Reveal>
  );

  if (videoProjects.length === 0) {
    return (
      <>
        {intro}
        <div className="surface py-24 text-center">
          <p className="label">No video projects available yet.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {intro}
      <div className="max-w-3xl mx-auto flex flex-col">
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
                <div className="flex shrink-0 items-center gap-4 self-center">
                  {parsed.service && parsed.service !== "direct" && (
                    <span className="label capitalize">{parsed.service}</span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); shareFilm(project); }}
                    className="label flex items-center gap-1.5 transition-colors hover:text-accent"
                    title="Copy a shareable link to this film"
                  >
                    {copiedId === project.id ? (
                      "Copied"
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M8.7 10.7 15.3 7M8.7 13.3l6.6 3.7M18 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM8.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm9.5 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                        </svg>
                        Share
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="relative overflow-hidden rounded-[4px] bg-paper-2 aspect-video">
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
