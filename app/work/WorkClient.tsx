"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import WorkNavigation, { WorkTab } from "./WorkNavigation";
import VideographyClient from "./VideographyClient";
import ContactClient from "./ContactClient";

interface Image {
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
  downloadable: boolean;
  images: Image[];
  createdAt: string;
}

interface VideoProject {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

interface WorkClientProps {
  galleries: Gallery[];
  videoProjects: VideoProject[];
}

export default function WorkClient({ galleries, videoProjects }: WorkClientProps) {
  const [expandedGalleryId, setExpandedGalleryId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<Image | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkTab>("photography");

  const searchParams = useSearchParams();
  const router = useRouter();
  const galleryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Handle URL-driven initialization
  useEffect(() => {
    const tabParam = searchParams.get("tab") as WorkTab | null;
    if (tabParam && ["photography", "videography", "design", "contact"].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    const galleryParam = searchParams.get("gallery");
    if (galleryParam && galleries.length > 0) {
      const gallery = galleries.find(
        (g) => g.id === galleryParam || slugify(g.title) === galleryParam
      );
      if (gallery) {
        setExpandedGalleryId(gallery.id);
        setTimeout(() => {
          const galleryEl = galleryRefs.current.get(gallery.id);
          if (galleryEl) {
            galleryEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    }
  }, [searchParams, galleries]);

  // Keyboard support for lightbox
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
  }, [lightboxImage, expandedGalleryId]);

  const handleTabChange = useCallback((tab: WorkTab) => {
    setActiveTab(tab);
    setExpandedGalleryId(null);
    if (tab === "photography") {
      router.push("/work", { scroll: false });
    } else {
      router.push(`/work?tab=${tab}`, { scroll: false });
    }
  }, [router]);

  const updateURL = useCallback((galleryId: string | null, galleryTitle?: string) => {
    if (galleryId && galleryTitle) {
      const slug = slugify(galleryTitle);
      router.push(`/work?gallery=${slug}`, { scroll: false });
    } else {
      router.push("/work", { scroll: false });
    }
  }, [router]);

  const toggleGallery = (gallery: Gallery) => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (expandedGalleryId === gallery.id) {
      setExpandedGalleryId(null);
      updateURL(null);
    } else {
      setExpandedGalleryId(gallery.id);
      updateURL(gallery.id, gallery.title);
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  const getCoverImage = (gallery: Gallery) => {
    if (gallery.coverImage) {
      return gallery.images.find((img) => img.path === gallery.coverImage) || gallery.images[0];
    }
    return gallery.images[0];
  };

  const getOtherImages = (gallery: Gallery) => {
    const cover = getCoverImage(gallery);
    return gallery.images.filter((img) => img.id !== cover?.id);
  };

  const handleEmail = (gallery: Gallery) => {
    const subject = encodeURIComponent(`Gallery: ${gallery.title}`);
    const body = encodeURIComponent(`I'm interested in the "${gallery.title}" gallery.`);
    window.location.href = `mailto:JoshuaLHarrington@gmail.com?subject=${subject}&body=${body}`;
  };

  const handlePurchase = (gallery: Gallery) => {
    const subject = encodeURIComponent(`Purchase Inquiry: ${gallery.title}`);
    const body = encodeURIComponent(`I'm interested in purchasing images from the "${gallery.title}" gallery.`);
    window.location.href = `mailto:JoshuaLHarrington@gmail.com?subject=${subject}&body=${body}`;
  };

  const openLightbox = (image: Image, e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxImage(image);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = "";
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (!lightboxImage || !expandedGalleryId) return;
    const gallery = galleries.find((g) => g.id === expandedGalleryId);
    if (!gallery) return;

    const currentIndex = gallery.images.findIndex((img) => img.id === lightboxImage.id);
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % gallery.images.length
        : (currentIndex - 1 + gallery.images.length) % gallery.images.length;
    setLightboxImage(gallery.images[newIndex]);
  };

  const getLightboxIndex = () => {
    if (!lightboxImage || !expandedGalleryId) return null;
    const gallery = galleries.find((g) => g.id === expandedGalleryId);
    if (!gallery) return null;
    const index = gallery.images.findIndex((img) => img.id === lightboxImage.id);
    return { current: index + 1, total: gallery.images.length };
  };

  const lightboxIndex = getLightboxIndex();
  const photoAccent = "var(--accent-photography)";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Tab Navigation */}
      <WorkNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === "videography" && (
        <VideographyClient videoProjects={videoProjects} />
      )}

      {activeTab === "design" && (
        <article
          className="neu-card p-10 sm:p-14 text-center"
          style={{ borderLeftWidth: "4px", borderLeftColor: "var(--accent-design)" }}
        >
          <span
            className="inline-block font-medium px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-body mb-4"
            style={{ color: "var(--accent-design)", border: "1px solid var(--accent-design)" }}
          >
            Design
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-[var(--foreground)] mb-2">
            Coming soon
          </h2>
          <p className="font-body text-sm text-[var(--text-muted)] max-w-md mx-auto">
            Identity systems, editorial layouts, and brand work in progress.
          </p>
        </article>
      )}

      {activeTab === "contact" && <ContactClient />}

      {activeTab === "photography" && (
        <div className="flex flex-col gap-4">
          {galleries.map((gallery) => {
            const isExpanded = expandedGalleryId === gallery.id;
            const coverImage = getCoverImage(gallery);
            const otherImages = getOtherImages(gallery);

            return (
              <div
                key={gallery.id}
                ref={(el) => {
                  if (el) galleryRefs.current.set(gallery.id, el);
                }}
                className="flex flex-col gap-3"
              >
                {/* Gallery row card */}
                <article
                  onClick={() => toggleGallery(gallery)}
                  className="neu-card neu-card-interactive p-4 cursor-pointer flex gap-4"
                  style={{ borderLeftWidth: "4px", borderLeftColor: photoAccent }}
                >
                  {coverImage ? (
                    <div className="relative w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] flex-shrink-0 rounded-sm overflow-hidden bg-[var(--background)]">
                      <Image
                        src={coverImage.path}
                        alt={gallery.title}
                        fill
                        sizes="140px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] flex-shrink-0 rounded-sm bg-[var(--background)] flex items-center justify-center">
                      <span className="text-[var(--text-faint)] font-body text-xs">No cover</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] mb-1.5 flex-wrap">
                        <span
                          className="font-medium px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-body"
                          style={{ color: photoAccent, border: `1px solid ${photoAccent}` }}
                        >
                          Photography
                        </span>
                        <span className="font-body text-[var(--text-muted)] uppercase tracking-wide">
                          {gallery.images.length} {gallery.images.length === 1 ? "image" : "images"}
                        </span>
                      </div>
                      <h2 className="font-heading text-lg sm:text-xl font-semibold text-[var(--foreground)] leading-snug">
                        {gallery.title}
                      </h2>
                      {gallery.description && (
                        <p className="font-body text-sm text-[var(--text-muted)] mt-1 line-clamp-2">
                          {gallery.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center text-[var(--text-muted)] flex-shrink-0">
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </article>

                {/* Expanded content */}
                {isExpanded && (
                  <>
                    {/* Action buttons */}
                    <div
                      className="flex flex-wrap gap-2"
                      style={{ animation: "fadeInUp 0.3s ease forwards" }}
                    >
                      {gallery.downloadable && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEmail(gallery); }}
                          className="neu-button px-3 py-1.5 font-body text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEmail(gallery); }}
                        className="neu-button px-3 py-1.5 font-body text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Inquire
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePurchase(gallery); }}
                        className="neu-button px-3 py-1.5 font-body text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Purchase
                      </button>
                    </div>

                    {/* Image grid */}
                    {otherImages.length > 0 && (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
                        style={{ animation: "fadeInUp 0.3s ease forwards", animationDelay: "60ms" }}
                      >
                        {otherImages.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={(e) => openLightbox(image, e)}
                            className="group/img relative aspect-square overflow-hidden rounded-sm border border-[var(--border-color)] bg-[var(--background)] transition-all hover:shadow-[3px_3px_0_var(--border-color)] hover:-translate-x-px hover:-translate-y-px"
                            style={{
                              animationDelay: `${index * 40}ms`,
                              animation: "fadeInUp 0.3s ease forwards",
                            }}
                          >
                            <Image
                              src={image.path}
                              alt={image.caption || image.filename}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                              className="object-cover transition-transform duration-300 group-hover/img:scale-105"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {galleries.length === 0 && (
            <div
              className="neu-card p-12 text-center"
              style={{ borderLeftWidth: "4px", borderLeftColor: photoAccent }}
            >
              <p className="font-body text-[var(--text-muted)]">No galleries available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-[var(--background)]/95 backdrop-blur-sm z-50 flex items-center justify-center lightbox-enter"
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

          {lightboxIndex && (
            <div className="absolute top-6 left-6 text-[var(--text-muted)] font-body text-xs uppercase tracking-wide z-10">
              {lightboxIndex.current} / {lightboxIndex.total}
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox("prev"); }}
            className="absolute left-3 sm:left-6 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors z-10"
            aria-label="Previous"
          >
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox("next"); }}
            className="absolute right-3 sm:right-6 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors z-10"
            aria-label="Next"
          >
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <img
            key={lightboxImage.id}
            src={lightboxImage.path}
            alt={lightboxImage.caption || lightboxImage.filename}
            className="max-h-[85vh] max-w-[85vw] object-contain lightbox-image-enter rounded-sm"
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxImage.caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[var(--foreground)] font-body text-sm text-center bg-[var(--card-bg)] border border-[var(--border-color)] px-4 py-2 rounded-sm">
              {lightboxImage.caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
