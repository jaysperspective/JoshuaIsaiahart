"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/app/work/Reveal";

interface GalleryImage {
  id: string;
  filename: string;
  path: string;
  caption: string | null;
}

interface Gallery {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  images: GalleryImage[];
}

interface GalleryGridClientProps {
  gallery: Gallery;
}

export default function GalleryGridClient({ gallery }: GalleryGridClientProps) {
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!lightboxImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          navigateLightbox("prev");
          break;
        case "ArrowRight":
          navigateLightbox("next");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage]);

  const openLightbox = (image: GalleryImage) => {
    setLightboxImage(image);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = "";
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (!lightboxImage) return;
    const currentIndex = gallery.images.findIndex((img) => img.id === lightboxImage.id);
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % gallery.images.length
        : (currentIndex - 1 + gallery.images.length) % gallery.images.length;
    setLightboxImage(gallery.images[newIndex]);
  };

  const lightboxIndex = lightboxImage
    ? gallery.images.findIndex((img) => img.id === lightboxImage.id) + 1
    : null;

  return (
    <main className="min-h-screen bg-paper text-ink px-5 sm:px-8 lg:px-12 xl:px-16 pb-20">
      <div className="mx-auto w-full max-w-5xl">
        {/* Masthead */}
        <header className="flex items-center justify-between pt-10 sm:pt-14">
          <Link href="/" className="eyebrow transition-colors hover:text-accent">
            ← Joshua Isaiah
          </Link>
          <span className="label numeral">
            {gallery.images.length} frames
          </span>
        </header>
        <hr className="rule mt-5" />

        {/* Title */}
        <section className="pt-12 pb-10 sm:pt-16 text-center">
          <p className="eyebrow mb-5">Gallery</p>
          <h1 className="display text-[clamp(2.5rem,8vw,5rem)]">{gallery.title}</h1>
          {gallery.description && (
            <p className="prose-serif mx-auto mt-6 max-w-2xl">{gallery.description}</p>
          )}
        </section>

        {/* Grid */}
        {gallery.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
            {gallery.images.map((image, index) => (
              <Reveal key={image.id} delay={(index % 4) * 60}>
                <div
                  className="group cursor-pointer"
                  onClick={() => openLightbox(image)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-[3px] bg-paper-2">
                    <Image
                      src={image.path}
                      alt={image.caption || image.filename}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="surface py-24 text-center">
            <p className="label">No images in this gallery yet.</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-rule">
          <div className="flex flex-wrap items-center justify-between gap-4 py-10">
            <Link href="/work" className="link-underline font-sans text-sm">
              View more work
            </Link>
            <Link href="/work#book" className="btn btn-accent">
              Book a Session
            </Link>
          </div>
        </footer>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-vigne/95 z-50 flex items-center justify-center lightbox-enter"
          onClick={closeLightbox}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(dx) > 50) navigateLightbox(dx < 0 ? "next" : "prev");
          }}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-paper/50 hover:text-paper transition-colors z-10"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {lightboxIndex && (
            <div className="absolute top-6 left-6 text-khaki/70 label numeral z-10">
              {lightboxIndex} / {gallery.images.length}
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox("prev"); }}
            className="absolute left-4 sm:left-6 text-paper/40 hover:text-paper transition-colors z-10"
          >
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox("next"); }}
            className="absolute right-4 sm:right-6 text-paper/40 hover:text-paper transition-colors z-10"
          >
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <img
            key={lightboxImage.id}
            src={lightboxImage.path}
            alt={lightboxImage.caption || lightboxImage.filename}
            className="max-h-[85vh] max-w-[85vw] object-contain lightbox-image-enter"
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxImage.caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-paper/80 label normal-case tracking-normal text-center bg-vigne/50 backdrop-blur-sm px-4 py-2 rounded-full">
              {lightboxImage.caption}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
