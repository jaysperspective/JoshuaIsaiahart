"use client";

import { useState, useEffect, useCallback } from "react";
import AdminAuth from "@/app/components/AdminAuth";

interface Image {
  id: string;
  filename: string;
  path: string;
  caption: string | null;
  order: number;
}

interface Gallery {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  downloadable: boolean;
  images: Image[];
}

interface UploadStatus {
  step: "idle" | "creating" | "uploading" | "success" | "error";
  message: string;
  details?: string;
  uploadedCount?: number;
  totalCount?: number;
}

export default function AdminPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    step: "idle",
    message: "",
  });

  const fetchGalleries = useCallback(async () => {
    try {
      const res = await fetch("/api/galleries");
      if (res.ok) {
        const data = await res.json();
        setGalleries(data);
      }
    } catch (error) {
      console.error("Failed to fetch galleries:", error);
    }
  }, []);

  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearStatus = () => {
    setUploadStatus({ step: "idle", message: "" });
  };

  const createGallery = async () => {
    if (!title.trim()) {
      setUploadStatus({
        step: "error",
        message: "Please enter a title",
      });
      return;
    }

    try {
      // Step 1: Create gallery
      setUploadStatus({
        step: "creating",
        message: "Creating gallery...",
      });

      const galleryRes = await fetch("/api/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (!galleryRes.ok) {
        const errorText = await galleryRes.text();
        throw new Error(`Failed to create gallery: ${galleryRes.status} - ${errorText}`);
      }

      const gallery = await galleryRes.json();
      console.log("Gallery created:", gallery);

      // Step 2: Upload images if any
      if (selectedFiles.length > 0) {
        setUploadStatus({
          step: "uploading",
          message: `Uploading ${selectedFiles.length} image(s)...`,
          uploadedCount: 0,
          totalCount: selectedFiles.length,
        });

        const formData = new FormData();
        selectedFiles.forEach((file) => {
          console.log("Adding file to upload:", file.name, file.size, file.type);
          formData.append("files", file);
        });

        console.log("Sending upload request to:", `/api/galleries/${gallery.id}/images`);

        const uploadRes = await fetch(`/api/galleries/${gallery.id}/images`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          console.error("Upload failed:", uploadRes.status, errorText);
          setUploadStatus({
            step: "error",
            message: "Gallery created but image upload failed",
            details: `Status: ${uploadRes.status}\nResponse: ${errorText}`,
          });
          fetchGalleries();
          return;
        }

        const uploadedImages = await uploadRes.json();
        console.log("Upload successful:", uploadedImages);

        setUploadStatus({
          step: "success",
          message: `Gallery created with ${uploadedImages.length} image(s)!`,
          uploadedCount: uploadedImages.length,
          totalCount: selectedFiles.length,
        });
      } else {
        setUploadStatus({
          step: "success",
          message: "Gallery created successfully!",
        });
      }

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedFiles([]);
      fetchGalleries();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setUploadStatus((prev) =>
          prev.step === "success" ? { step: "idle", message: "" } : prev
        );
      }, 5000);

    } catch (error) {
      console.error("Failed to create gallery:", error);
      setUploadStatus({
        step: "error",
        message: "Failed to create gallery",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const toggleDownloadable = async (gallery: Gallery) => {
    try {
      await fetch(`/api/galleries/${gallery.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ downloadable: !gallery.downloadable }),
      });
      fetchGalleries();
    } catch (error) {
      console.error("Failed to update gallery:", error);
    }
  };

  const deleteGallery = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery?")) return;

    try {
      await fetch(`/api/galleries/${id}`, { method: "DELETE" });
      fetchGalleries();
    } catch (error) {
      console.error("Failed to delete gallery:", error);
    }
  };

  const updateGallery = async () => {
    if (!editingGallery) return;

    try {
      await fetch(`/api/galleries/${editingGallery.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingGallery.title,
          description: editingGallery.description,
        }),
      });
      setEditingGallery(null);
      fetchGalleries();
    } catch (error) {
      console.error("Failed to update gallery:", error);
    }
  };

  const isUploading = uploadStatus.step === "creating" || uploadStatus.step === "uploading";

  return (
    <AdminAuth>
      <div className="min-h-[calc(100vh-60px)] flex items-start justify-center p-8">
        <div className="flex flex-col gap-4 w-full max-w-2xl">
          {/* Status Message */}
          {uploadStatus.step !== "idle" && (
            <div
              className={`rounded-xl p-4 ${
                uploadStatus.step === "error"
                  ? "bg-red-100 border border-red-300"
                  : uploadStatus.step === "success"
                  ? "bg-green-100 border border-green-300"
                  : "bg-blue-100 border border-blue-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  {isUploading && (
                    <svg
                      className="w-5 h-5 text-blue-600 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {uploadStatus.step === "success" && (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {uploadStatus.step === "error" && (
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  <div>
                    <p
                      className={`font-body font-medium ${
                        uploadStatus.step === "error"
                          ? "text-red-800"
                          : uploadStatus.step === "success"
                          ? "text-green-800"
                          : "text-blue-800"
                      }`}
                    >
                      {uploadStatus.message}
                    </p>
                    {uploadStatus.details && (
                      <pre className="font-body text-xs text-red-700 mt-2 whitespace-pre-wrap bg-red-50 p-2 rounded">
                        {uploadStatus.details}
                      </pre>
                    )}
                  </div>
                </div>
                {(uploadStatus.step === "error" || uploadStatus.step === "success") && (
                  <button
                    onClick={clearStatus}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Create/Edit Gallery Card */}
          <div className="card card-white p-10">
            <h2 className="font-heading text-xl font-bold mb-2">
              {editingGallery ? "Edit Gallery" : "Create Gallery"}
            </h2>
            <p className="font-body text-[#6b6b6b] mb-6">
              {editingGallery
                ? "Update gallery details below"
                : "Add a new gallery with images"}
            </p>

            {/* Drag and drop zone */}
            {!editingGallery && (
              <div
                className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-gray-400 mb-3">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="font-body text-sm text-gray-600 mb-1">
                  Drag & drop images here
                </p>
                <label className="font-body text-sm text-blue-500 cursor-pointer hover:underline">
                  or click to browse
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            )}

            {/* Selected files */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <p className="font-body text-sm text-gray-600 mb-2">
                  {selectedFiles.length} file(s) selected
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-100 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <div className="min-w-0">
                          <span className="font-body text-sm truncate block">
                            {file.name}
                          </span>
                          <span className="font-body text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 ml-2 p-1"
                        disabled={isUploading}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Title input */}
            <div className="mb-4">
              <label className="font-body text-sm text-gray-600 block mb-2">
                Title
              </label>
              <input
                type="text"
                value={editingGallery ? editingGallery.title : title}
                onChange={(e) =>
                  editingGallery
                    ? setEditingGallery({
                        ...editingGallery,
                        title: e.target.value,
                      })
                    : setTitle(e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-body focus:outline-none focus:border-gray-400 transition-colors"
                placeholder="Gallery title"
                disabled={isUploading}
              />
            </div>

            {/* Description input */}
            <div className="mb-6">
              <label className="font-body text-sm text-gray-600 block mb-2">
                Description
              </label>
              <textarea
                value={
                  editingGallery
                    ? editingGallery.description || ""
                    : description
                }
                onChange={(e) =>
                  editingGallery
                    ? setEditingGallery({
                        ...editingGallery,
                        description: e.target.value,
                      })
                    : setDescription(e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-body resize-none focus:outline-none focus:border-gray-400 transition-colors"
                rows={3}
                placeholder="Gallery description"
                disabled={isUploading}
              />
            </div>

            {/* Action buttons */}
            {editingGallery ? (
              <div className="flex gap-3">
                <button
                  onClick={updateGallery}
                  className="flex-1 bg-[#1a1a1a] text-white py-3 rounded-xl font-body hover:bg-[#333] transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingGallery(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-body hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={createGallery}
                disabled={isUploading}
                className="w-full bg-[#1a1a1a] text-white py-3 rounded-xl font-body hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading && (
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {isUploading
                  ? uploadStatus.step === "creating"
                    ? "Creating Gallery..."
                    : "Uploading Images..."
                  : "Create Gallery"}
              </button>
            )}
          </div>

          {/* Galleries List Card */}
          <div className="card card-gray p-10">
            <h2 className="font-heading text-xl font-bold mb-2 text-center">
              Your Galleries
            </h2>
            <p className="font-body text-[#2f2f2f] mb-6 text-center">
              {galleries.length} {galleries.length === 1 ? "gallery" : "galleries"}
            </p>

            {galleries.length === 0 ? (
              <p className="font-body text-gray-600 text-center py-4">
                No galleries yet. Create one above to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {galleries.map((gallery) => (
                  <div
                    key={gallery.id}
                    className="bg-white/80 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {gallery.coverImage ? (
                          <img
                            src={gallery.coverImage}
                            alt={gallery.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        <div>
                          <h3 className="font-heading font-bold text-[#1a1a1a]">
                            {gallery.title}
                          </h3>
                          <p className="font-body text-sm text-gray-500">
                            {gallery.images.length} images
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingGallery(gallery)}
                          className="text-gray-500 hover:text-blue-500 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteGallery(gallery.id)}
                          className="text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={gallery.downloadable}
                          onChange={() => toggleDownloadable(gallery)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="font-body text-sm text-gray-600">
                          Allow downloads
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminAuth>
  );
}
