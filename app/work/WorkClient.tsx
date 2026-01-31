"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import WorkNavigation, { WorkTab } from "./WorkNavigation";
import VideographyClient from "./VideographyClient";

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
    if (tabParam && ["photography", "videography", "design", "book"].includes(tabParam)) {
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

  // Render placeholder for coming soon tabs
  const renderComingSoon = (tabName: string) => (
    <div className="card card-gray p-10 text-center">
      <p className="font-heading text-xl font-bold text-gray-700 mb-2">{tabName}</p>
      <p className="font-body text-gray-600">Coming soon</p>
    </div>
  );

  const toggleGallery = (gallery: Gallery) => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (expandedGalleryId === gallery.id) {
      // Collapse current gallery
      setExpandedGalleryId(null);
      updateURL(null);
    } else {
      // Expand new gallery (auto-collapses any open one)
      setExpandedGalleryId(gallery.id);
      updateURL(gallery.id, gallery.title);
    }

    // Reset animation lock after transition
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

  const handleDownload = (gallery: Gallery) => {
    if (!gallery.downloadable) return;
    alert("Download functionality coming soon!");
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

  return (
    <div className="min-h-screen bg-[#181818] px-8 sm:px-12 pt-8 pb-24 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Bottom Navigation */}
        <WorkNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Tab Content */}
        {activeTab === "videography" && (
          <VideographyClient videoProjects={videoProjects} />
        )}

        {activeTab === "design" && renderComingSoon("Design")}

        {activeTab === "book" && renderComingSoon("Book")}

        {/* Photography Gallery List */}
        {activeTab === "photography" && (
        <div className="flex flex-col gap-6">
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
                className="flex flex-col gap-4"
              >
                {/* Cover Image Card */}
                <div
                  onClick={() => toggleGallery(gallery)}
                  className="card card-gray p-6 cursor-pointer group transition-all duration-300 hover:shadow-lg"
                >
                  {coverImage ? (
                    <div className="relative rounded-xl overflow-hidden bg-gray-200">
                      <img
                        src={coverImage.path}
                        alt={gallery.title}
                        className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />

                      {/* Expand/Collapse indicator */}
                      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-body text-xs flex items-center gap-1.5 transition-all duration-300 group-hover:bg-black/70">
                        {isExpanded ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Collapse
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            {gallery.images.length} images
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-gray-300 flex items-center justify-center py-20">
                      <p className="text-gray-500 font-body">No cover image</p>
                    </div>
                  )}

                  {/* Gallery title overlay */}
                  <div className="mt-4">
                    <h2 className="font-heading text-xl font-bold text-gray-800">
                      {gallery.title}
                    </h2>
                    {!isExpanded && gallery.description && (
                      <p className="font-body text-gray-600 text-sm mt-1 line-clamp-2">
                        {gallery.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Expanded Content - Animated */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {/* Image Grid */}
                  {otherImages.length > 0 && (
                    <div className="card card-gray p-6 mb-4">
                      <div
                        className={`grid grid-cols-2 md:grid-cols-3 gap-3 transition-opacity duration-300 ${
                          isExpanded ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ transitionDelay: isExpanded ? "150ms" : "0ms" }}
                      >
                        {otherImages.map((image, index) => (
                          <div
                            key={image.id}
                            className="group/img cursor-pointer"
                            onClick={(e) => openLightbox(image, e)}
                            style={{
                              animationDelay: `${index * 50}ms`,
                              animation: isExpanded ? "fadeInUp 0.3s ease forwards" : "none"
                            }}
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-200">
                              <img
                                src={image.path}
                                alt={image.caption || image.filename}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-300" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Card */}
                  <div
                    className={`card card-white p-8 transition-opacity duration-300 ${
                      isExpanded ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ transitionDelay: isExpanded ? "200ms" : "0ms" }}
                  >
                    {/* Description */}
                    {gallery.description && (
                      <p className="font-body text-gray-600 mb-6">
                        {gallery.description}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(gallery); }}
                        disabled={!gallery.downloadable}
                        className={`px-5 py-3 rounded-xl font-body text-sm flex items-center gap-2 transition-colors ${
                          gallery.downloadable
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                            : "bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                        {!gallery.downloadable && (
                          <span className="text-xs text-gray-400 ml-1">(N/A)</span>
                        )}
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleEmail(gallery); }}
                        className="px-5 py-3 rounded-xl font-body text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Gallery
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handlePurchase(gallery); }}
                        className="px-5 py-3 rounded-xl font-body text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Purchase Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {galleries.length === 0 && (
            <div className="card card-gray p-10 text-center">
              <p className="font-body text-gray-600">No galleries available yet.</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
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

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox("prev"); }}
            className="absolute left-6 text-white/70 hover:text-white transition-colors z-10"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox("next"); }}
            className="absolute right-6 text-white/70 hover:text-white transition-colors z-10"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <img
            src={lightboxImage.path}
            alt={lightboxImage.caption || lightboxImage.filename}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxImage.caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white font-body text-center bg-black/50 px-4 py-2 rounded-lg">
              {lightboxImage.caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
