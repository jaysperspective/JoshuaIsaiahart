"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
}

export default function WorkPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<Image | null>(null);

  useEffect(() => {
    fetchGalleries();
  }, []);

  useEffect(() => {
    setIsExpanded(false);
  }, [selectedGallery?.id]);

  const fetchGalleries = async () => {
    try {
      const res = await fetch("/api/galleries");
      if (res.ok) {
        const data = await res.json();
        setGalleries(data);
        if (data.length > 0) {
          setSelectedGallery(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch galleries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!selectedGallery?.downloadable) return;
    alert("Download functionality coming soon!");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Gallery: ${selectedGallery?.title || "Asun Media"}`);
    const body = encodeURIComponent(`I'm interested in the "${selectedGallery?.title}" gallery.`);
    window.location.href = `mailto:JoshuaLHarrington@gmail.com?subject=${subject}&body=${body}`;
  };

  const handlePurchase = () => {
    const subject = encodeURIComponent(`Purchase Inquiry: ${selectedGallery?.title || "Image"}`);
    const body = encodeURIComponent(`I'm interested in purchasing images from the "${selectedGallery?.title}" gallery.`);
    window.location.href = `mailto:JoshuaLHarrington@gmail.com?subject=${subject}&body=${body}`;
  };

  const openLightbox = (image: Image) => {
    setLightboxImage(image);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = "";
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (!lightboxImage || !selectedGallery) return;
    const currentIndex = selectedGallery.images.findIndex(
      (img) => img.id === lightboxImage.id
    );
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % selectedGallery.images.length
        : (currentIndex - 1 + selectedGallery.images.length) %
          selectedGallery.images.length;
    setLightboxImage(selectedGallery.images[newIndex]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white font-body">Loading...</div>
      </div>
    );
  }

  const coverImage = selectedGallery?.coverImage
    ? selectedGallery.images.find((img) => img.path === selectedGallery.coverImage)
    : selectedGallery?.images[0];

  const otherImages = selectedGallery?.images.filter(
    (img) => img.id !== coverImage?.id
  ) || [];

  // Always show max 5 images (cover + 4 others)
  const visibleImages = otherImages.slice(0, 4);
  const totalImages = selectedGallery?.images.length || 0;
  const hasMoreImages = totalImages > 5;

  return (
    <div className="min-h-screen bg-[#181818] p-6 md:p-12 lg:p-16">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link
          href="/"
          className="text-white font-body text-sm flex items-center gap-2 hover:text-gray-300 transition-colors mb-6 w-fit"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>

        {/* Two-column layout - same height */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-stretch">
          {/* Left Column - Actions (narrow) */}
          <div className="lg:w-72 flex-shrink-0 flex">
            <div className="card card-white p-6 flex flex-col w-full">
              {/* Title and Description */}
              {selectedGallery && (
                <div className="mb-4">
                  <h1 className="font-heading text-lg font-bold">
                    {selectedGallery.title}
                  </h1>
                  {selectedGallery.description && (
                    <p className="font-body text-gray-600 mt-2 text-sm leading-relaxed">
                      {selectedGallery.description}
                    </p>
                  )}
                </div>
              )}

              {/* Gallery selector */}
              {galleries.length > 1 && (
                <div className="mb-4">
                  <h3 className="font-heading text-xs font-bold mb-2 text-gray-500 uppercase tracking-wide">
                    Galleries
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {galleries.map((gallery) => (
                      <button
                        key={gallery.id}
                        onClick={() => setSelectedGallery(gallery)}
                        className={`px-3 py-2 rounded-lg font-body text-sm transition-colors text-left ${
                          selectedGallery?.id === gallery.id
                            ? "bg-[#1a1a1a] text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {gallery.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* View More Button - if gallery has more than 5 images */}
              {hasMoreImages && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="w-full px-4 py-2.5 rounded-xl font-body text-sm bg-[#1a1a1a] hover:bg-[#333] text-white flex items-center justify-center gap-2 transition-colors mb-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  View All {totalImages} Images
                </button>
              )}

              {/* Spacer to push buttons to bottom */}
              <div className="flex-1" />

              {/* Action buttons - always at bottom */}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={handleDownload}
                  disabled={!selectedGallery?.downloadable}
                  className={`w-full px-4 py-2.5 rounded-xl font-body text-sm flex items-center gap-2 transition-colors ${
                    selectedGallery?.downloadable
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      : "bg-gray-50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                  {!selectedGallery?.downloadable && (
                    <span className="text-xs text-gray-400 ml-auto">(N/A)</span>
                  )}
                </button>

                <button
                  onClick={handleEmail}
                  className="w-full px-4 py-2.5 rounded-xl font-body text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Gallery
                </button>

                <button
                  onClick={handlePurchase}
                  className="w-full px-4 py-2.5 rounded-xl font-body text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Purchase
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Gallery (wide) */}
          <div className="flex-1 flex">
            <div className="card card-gray p-6 flex-1">
              {selectedGallery ? (
                <>
                  {selectedGallery.images.length > 0 ? (
                    <>
                      {/* Image Grid - 3 columns */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {/* Cover image - larger */}
                        {coverImage && (
                          <div
                            className="md:row-span-2 group cursor-pointer"
                            onClick={() => openLightbox(coverImage)}
                          >
                            <div className="relative aspect-square md:aspect-auto md:h-full rounded-xl overflow-hidden bg-gray-200">
                              <img
                                src={coverImage.path}
                                alt={coverImage.caption || coverImage.filename}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                          </div>
                        )}

                        {/* Other images */}
                        {visibleImages.map((image) => (
                          <div
                            key={image.id}
                            className="group cursor-pointer"
                            onClick={() => openLightbox(image)}
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-200">
                              <img
                                src={image.path}
                                alt={image.caption || image.filename}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>

                    </>
                  ) : (
                    <p className="font-body text-gray-600 text-center py-12">
                      No images in this gallery yet.
                    </p>
                  )}
                </>
              ) : (
                <p className="font-body text-gray-600 text-center py-12">
                  No galleries available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Gallery View */}
      {isExpanded && selectedGallery && (
        <div className="fixed inset-0 bg-[#181818] z-40 overflow-auto">
          <div className="p-6 md:p-12 lg:p-16">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-white font-body text-sm flex items-center gap-2 hover:text-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Gallery
                </button>
                <h2 className="text-white font-heading text-lg font-bold">
                  {selectedGallery.title} ({selectedGallery.images.length} images)
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedGallery.images.map((image) => (
                  <div
                    key={image.id}
                    className="group cursor-pointer"
                    onClick={() => openLightbox(image)}
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800">
                      <img
                        src={image.path}
                        alt={image.caption || image.filename}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
