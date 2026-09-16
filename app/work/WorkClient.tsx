"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import WorkNavigation, { WorkTab } from "./WorkNavigation";
import VideographyClient from "./VideographyClient";
import ContactClient from "./ContactClient";
import Testimonials from "./Testimonials";
import Reveal from "./Reveal";
import SocialClient, { SocialVideo } from "./SocialClient";

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
  socialVideos: SocialVideo[];
}

export default function WorkClient({ galleries, videoProjects, socialVideos }: WorkClientProps) {
  const [expandedGalleryId, setExpandedGalleryId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<Image | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkTab>("photography");

  const searchParams = useSearchParams();
  const router = useRouter();
  const galleryRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const touchStartX = useRef<number | null>(null);

  // Scroll to booking section when arriving via /work#book
  useEffect(() => {
    if (window.location.hash === "#book") {
      setTimeout(() => {
        document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, []);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Handle URL-driven initialization
  useEffect(() => {
    const tabParam = searchParams.get("tab") as WorkTab | null;
    if (tabParam && ["photography", "videography", "reels"].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    const galleryParam = searchParams.get("gallery");
    if (galleryParam && galleries.length > 0) {
      const gallery = galleries.find(
        (g) => g.id === galleryParam || slugify(g.title) === galleryParam
      );
      if (gallery) {
        setExpandedGalleryId(gallery.id);
        // Scroll to the gallery after a brief delay for rendering
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

  return (
    <div className="min-h-screen bg-paper text-ink px-5 sm:px-8 lg:px-12 xl:px-16 pb-20">
      <div className="w-full">
        {/* Top Navigation */}
        <WorkNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Tab Content */}
        {activeTab === "videography" && (
          <VideographyClient videoProjects={videoProjects} />
        )}

        {activeTab === "reels" && (
          <SocialClient socialVideos={socialVideos} />
        )}

        {/* Photography — cover grid; clicking a cover unfolds that gallery */}
        {activeTab === "photography" && (
          <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-2 gap-y-8 sm:gap-x-3 sm:grid-cols-3">
            {galleries.map((gallery, gIndex) => {
              const isExpanded = expandedGalleryId === gallery.id;
              const coverImage = getCoverImage(gallery);
              const otherImages = getOtherImages(gallery);

              return (
                <Fragment key={gallery.id}>
                  {/* Cover card */}
                  <div
                    ref={(el) => {
                      if (el) galleryRefs.current.set(gallery.id, el);
                    }}
                    onClick={() => toggleGallery(gallery)}
                    className="group cursor-pointer scroll-mt-8"
                  >
                    <Reveal delay={(gIndex % 3) * 60}>
                      <div
                        className={`relative aspect-square overflow-hidden rounded-[4px] bg-paper-2 transition-shadow ${
                          isExpanded ? "ring-1 ring-accent" : ""
                        }`}
                      >
                        {coverImage ? (
                          <Image
                            src={coverImage.path}
                            alt={gallery.title}
                            fill
                            sizes="(max-width: 640px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <p className="label">—</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-2.5 flex items-baseline justify-center gap-2">
                        <span className="label numeral text-[0.6rem]">{String(gIndex + 1).padStart(2, "0")}</span>
                        <h2
                          className={`font-display text-lg sm:text-xl transition-colors group-hover:text-accent ${
                            isExpanded ? "text-accent" : "text-emerald"
                          }`}
                        >
                          {gallery.title}
                        </h2>
                      </div>
                      <span className="label mt-1 block text-center transition-colors group-hover:text-accent">
                        {isExpanded ? "Close —" : `${gallery.images.length} frames`}
                      </span>
                    </Reveal>
                  </div>

                  {/* Unfolded gallery — spans the full grid width below the cover's row */}
                  {isExpanded && (
                    <div
                      className="col-span-full border-t border-b border-rule py-8"
                      style={{ animation: "fadeInUp 0.3s ease forwards" }}
                    >
                      {gallery.description && (
                        <p className="prose-serif mx-auto mb-8 max-w-2xl text-center">{gallery.description}</p>
                      )}

                      {otherImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
                          {otherImages.map((image, index) => (
                            <div
                              key={image.id}
                              className="group/img cursor-pointer"
                              onClick={(e) => openLightbox(image, e)}
                              style={{
                                animationDelay: `${index * 50}ms`,
                                animation: "fadeInUp 0.3s ease forwards",
                              }}
                            >
                              <div className="relative aspect-square overflow-hidden rounded-[3px] bg-paper-2">
                                <Image
                                  src={image.path}
                                  alt={image.caption || image.filename}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                  className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div
                        className="mt-8 flex flex-wrap justify-center gap-3"
                        style={{ animation: "fadeInUp 0.3s ease forwards", animationDelay: "100ms" }}
                      >
                        {gallery.downloadable && (
                          <button onClick={(e) => { e.stopPropagation(); handleEmail(gallery); }} className="btn">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        )}

                        <button onClick={(e) => { e.stopPropagation(); handleEmail(gallery); }} className="btn">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Inquire
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); toggleGallery(gallery); }} className="btn btn-ghost">
                          Close —
                        </button>
                      </div>
                    </div>
                  )}
                </Fragment>
              );
            })}

            {galleries.length === 0 && (
              <div className="surface col-span-full py-24 text-center">
                <p className="label">No galleries available yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Client stories + booking — placed right after the work, while it's fresh */}
        <div className="max-w-3xl mx-auto w-full">
          <Testimonials />

          <section id="book" className="mt-20 border-t border-rule pt-14 scroll-mt-8">
            <Reveal>
              <p className="eyebrow mb-4 text-center">Ready When You Are</p>
              <h2 className="headline mb-4 text-center">
                Book a <span className="italic font-light">Session</span>
              </h2>
              <p className="prose-serif mx-auto mb-3 max-w-2xl text-center">
                If the work resonates, let&apos;s talk about what you have in mind.
                Every project starts with a free 30-minute consultation — no
                commitment, just a conversation.
              </p>
              <p className="label normal-case tracking-normal text-center mb-12">
                Curious about pricing first?{" "}
                <Link href="/rate-sheet" className="link-underline">
                  View the rate sheet
                </Link>
              </p>
            </Reveal>
            <Reveal delay={80}>
              <ContactClient />
            </Reveal>
          </section>
        </div>
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
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-paper/50 hover:text-paper transition-colors z-10"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image counter */}
          {lightboxIndex && (
            <div className="absolute top-6 left-6 text-khaki/70 label numeral z-10">
              {lightboxIndex.current} / {lightboxIndex.total}
            </div>
          )}

          {/* Previous */}
          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox("prev"); }}
            className="absolute left-4 sm:left-6 text-paper/40 hover:text-paper transition-colors z-10"
          >
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next */}
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
    </div>
  );
}
