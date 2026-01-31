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
      <div className="card card-gray p-10 text-center">
        <p className="font-body text-gray-600">No video projects available yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {videoProjects.map((project) => {
          const thumbnail = getDisplayThumbnail(project);
          const parsed = parseVideoUrl(project.videoUrl);

          return (
            <div
              key={project.id}
              onClick={() => openLightbox(project)}
              className="card card-gray p-6 cursor-pointer group transition-all duration-300 hover:shadow-lg"
            >
              {/* Thumbnail */}
              <div className="relative rounded-xl overflow-hidden bg-gray-200 aspect-video">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:bg-black/70 group-hover:scale-110">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Platform badge */}
                {parsed.service && parsed.service !== 'direct' && (
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-body text-xs capitalize">
                    {parsed.service}
                  </div>
                )}
              </div>

              {/* Title and description */}
              <div className="mt-4">
                <h2 className="font-heading text-xl font-bold text-gray-800">
                  {project.title}
                </h2>
                {project.description && (
                  <p className="font-body text-gray-600 text-sm mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Lightbox */}
      {lightboxVideo && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {parseVideoUrl(lightboxVideo.videoUrl).service === 'direct' ? (
              <video
                src={lightboxVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full rounded-xl"
              />
            ) : (
              <iframe
                src={getVideoEmbed(lightboxVideo) || ''}
                className="w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          {/* Video info */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center max-w-2xl">
            <h3 className="text-white font-heading text-xl font-bold">
              {lightboxVideo.title}
            </h3>
            {lightboxVideo.description && (
              <p className="text-white/70 font-body text-sm mt-2">
                {lightboxVideo.description}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
