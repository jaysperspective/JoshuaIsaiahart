"use client";

import { useEffect, useState } from "react";
import { parseSocialUrl, getSocialEmbedUrl } from "@/app/lib/video-utils";
import Reveal from "./Reveal";

export interface SocialVideo {
  id: string;
  caption: string | null;
  sourceUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

interface SocialClientProps {
  socialVideos: SocialVideo[];
}

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  direct: "Video",
};

export default function SocialClient({ socialVideos }: SocialClientProps) {
  const [activeVideo, setActiveVideo] = useState<SocialVideo | null>(null);

  useEffect(() => {
    if (!activeVideo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideo]);

  const openModal = (video: SocialVideo) => {
    setActiveVideo(video);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setActiveVideo(null);
    document.body.style.overflow = "";
  };

  if (socialVideos.length === 0) {
    return (
      <div className="surface py-24 text-center">
        <p className="label">No reels available yet.</p>
      </div>
    );
  }

  const activeParsed = activeVideo ? parseSocialUrl(activeVideo.sourceUrl) : null;
  const activeEmbed = activeParsed ? getSocialEmbedUrl(activeParsed) : null;

  return (
    <>
      <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {socialVideos.map((video, index) => {
          const parsed = parseSocialUrl(video.sourceUrl);
          const embedUrl = getSocialEmbedUrl(parsed);

          return (
            <Reveal key={video.id} delay={(index % 4) * 60}>
              <div
                onClick={() => openModal(video)}
                className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-[4px] bg-paper-2"
              >
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.caption || "Social video"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : parsed.platform === "direct" ? (
                  <video
                    src={video.sourceUrl}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : embedUrl && parsed.platform === "instagram" ? (
                  // No thumbnail available — show the embed with Instagram's
                  // header/footer chrome cropped out, inert so clicks open the modal
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <iframe
                      src={embedUrl}
                      loading="lazy"
                      scrolling="no"
                      className="absolute left-0 w-full"
                      style={{ top: "-54px", height: "calc(100% + 158px)" }}
                      title={video.caption || "Social video"}
                    />
                  </div>
                ) : embedUrl ? (
                  <iframe
                    src={embedUrl}
                    loading="lazy"
                    scrolling="no"
                    className="pointer-events-none h-full w-full"
                    title={video.caption || "Social video"}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <svg className="h-12 w-12 text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}

                {/* Hover overlay + play */}
                <div className="absolute inset-0 flex items-center justify-center bg-vigne/0 transition-colors duration-300 group-hover:bg-vigne/20">
                  <div className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-vigne/55 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                    <svg className="ml-0.5 h-5 w-5 text-paper" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Platform badge */}
                {parsed.platform && (
                  <span className="absolute bottom-2 left-2 rounded-[2px] bg-vigne/60 px-1.5 py-0.5 font-sans text-[0.58rem] font-medium uppercase tracking-[0.14em] text-paper/90 backdrop-blur-sm">
                    {PLATFORM_LABELS[parsed.platform]}
                  </span>
                )}
              </div>

              {video.caption && (
                <p className="label mt-2 normal-case tracking-normal line-clamp-1">
                  {video.caption}
                </p>
              )}
            </Reveal>
          );
        })}
      </div>

      {/* 9:16 modal player */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-vigne/95 p-4 lightbox-enter"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 z-10 text-paper/70 transition-colors hover:text-paper"
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="flex h-[85vh] max-w-[92vw] flex-col gap-3 lightbox-image-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-h-0 flex-1 aspect-[9/16] overflow-hidden rounded-[4px] bg-vigne">
              {activeParsed?.platform === "direct" ? (
                <video
                  src={activeVideo.sourceUrl}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : activeEmbed ? (
                <iframe
                  src={activeEmbed}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  scrolling="no"
                  title={activeVideo.caption || "Social video"}
                />
              ) : null}
            </div>
            {activeVideo.caption && (
              <p className="text-center font-sans text-sm text-paper/80">
                {activeVideo.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
