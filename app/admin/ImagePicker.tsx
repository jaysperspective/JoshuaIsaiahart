"use client";

import { useState, useEffect, useCallback } from "react";

interface SpacesFolder {
  prefix: string;
  name: string;
}
interface SpacesFile {
  key: string;
  name: string;
  url: string;
}

const IMG_RE = /\.(jpe?g|png|webp|gif|avif|heic|heif|tiff?|svg)$/i;

// Modal that browses the Spaces bucket (via /api/files) to pick an image URL.
// When cloud storage isn't configured (e.g. local dev → 501) it falls back to
// a paste-a-URL field, which is also always available at the bottom.
export default function ImagePicker({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [prefix, setPrefix] = useState("");
  const [folders, setFolders] = useState<SpacesFolder[]>([]);
  const [files, setFiles] = useState<SpacesFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");

  const load = useCallback(async (p: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/files?prefix=${encodeURIComponent(p)}`);
      if (!res.ok) {
        const msg =
          res.status === 501
            ? "Cloud storage isn't configured here (local dev). Paste an image URL below instead."
            : "Couldn't load files.";
        setError(msg);
        setFolders([]);
        setFiles([]);
        return;
      }
      const data = await res.json();
      setFolders(data.folders || []);
      setFiles((data.files || []).filter((f: SpacesFile) => IMG_RE.test(f.name)));
    } catch {
      setError("Couldn't load files.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(prefix);
  }, [prefix, load]);

  const crumbs = prefix.split("/").filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / breadcrumb */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="font-body text-sm text-gray-600">
            <button
              type="button"
              className="hover:text-gray-900"
              onClick={() => setPrefix("")}
            >
              All files
            </button>
            {crumbs.map((c, i) => {
              const p = crumbs.slice(0, i + 1).join("/") + "/";
              return (
                <span key={p}>
                  <span className="mx-1 text-gray-300">/</span>
                  <button type="button" className="hover:text-gray-900" onClick={() => setPrefix(p)}>
                    {c}
                  </button>
                </span>
              );
            })}
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="font-body text-gray-400">Loading…</p>
          ) : (
            <>
              {error && (
                <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 font-body text-sm text-amber-800">
                  {error}
                </p>
              )}
              {folders.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {folders.map((f) => (
                    <button
                      key={f.prefix}
                      type="button"
                      onClick={() => setPrefix(f.prefix)}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-body text-sm text-gray-700 hover:bg-gray-100"
                    >
                      📁 {f.name}
                    </button>
                  ))}
                </div>
              )}
              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {files.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => onSelect(f.url)}
                      className="group overflow-hidden rounded-lg border border-gray-200 hover:border-[#547890]"
                      title={f.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.url}
                        alt={f.name}
                        className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              )}
              {!error && folders.length === 0 && files.length === 0 && (
                <p className="font-body text-gray-400">No images in this folder.</p>
              )}
            </>
          )}
        </div>

        {/* Paste-URL fallback (always available) */}
        <div className="border-t border-gray-200 px-6 py-4">
          <label className="mb-2 block font-body text-xs uppercase tracking-wide text-gray-500">
            …or paste an image URL
          </label>
          <div className="flex gap-2">
            <input
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://…"
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 font-body text-sm focus:border-gray-400 focus:outline-none"
            />
            <button
              type="button"
              disabled={!manualUrl.trim()}
              onClick={() => onSelect(manualUrl.trim())}
              className="rounded-xl bg-[#1a1a1a] px-5 py-2 font-body text-sm text-white hover:bg-[#333] disabled:opacity-40"
            >
              Use
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
