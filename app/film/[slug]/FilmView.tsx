"use client";

import { useState } from "react";
import Link from "next/link";
import { parseVideoUrl } from "@/app/lib/video-utils";

interface FilmViewProps {
  title: string;
  description: string | null;
  videoUrl: string;
  slug: string;
}

export default function FilmView({ title, description, videoUrl, slug }: FilmViewProps) {
  const [copied, setCopied] = useState(false);
  const parsed = parseVideoUrl(videoUrl);

  // Embed URL without autoplay (this is a full page, not a lightbox)
  const embed =
    parsed.service === "youtube"
      ? `https://www.youtube.com/embed/${parsed.id}`
      : parsed.service === "vimeo"
      ? `https://player.vimeo.com/video/${parsed.id}`
      : null;

  async function share() {
    const url =
      typeof window !== "undefined" ? window.location.href : `https://joshuaisaiah.art/film/${slug}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink px-5 sm:px-8 lg:px-12 pb-24">
      <div className="mx-auto w-full max-w-4xl">
        {/* Masthead */}
        <div className="flex items-center justify-between pt-10 sm:pt-14">
          <Link href="/work?tab=videography" className="eyebrow transition-colors hover:text-accent">
            ← Joshua Isaiah
          </Link>
          <span className="label numeral">Film</span>
        </div>
        <hr className="rule mt-5" />

        {/* Title */}
        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <h1 className="headline max-w-3xl">{title}</h1>
          <button onClick={share} className="btn shrink-0">
            {copied ? "Link copied" : "Share"}
            {!copied && (
              <svg className="-mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8.7 10.7 15.3 7M8.7 13.3l6.6 3.7M18 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM8.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm9.5 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
              </svg>
            )}
          </button>
        </div>

        {/* Player */}
        <div className="mt-8 overflow-hidden rounded-[6px] bg-vigne">
          <div className="aspect-video">
            {parsed.service === "direct" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={videoUrl} controls playsInline className="h-full w-full" />
            ) : embed ? (
              <iframe
                src={embed}
                title={title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="btn">
                  Watch video
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {description && <p className="prose-serif mt-8 max-w-2xl">{description}</p>}

        <div className="mt-10">
          <Link href="/work?tab=videography" className="link-underline">
            ← All films
          </Link>
        </div>
      </div>
    </main>
  );
}
