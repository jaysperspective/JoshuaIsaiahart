"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Folder {
  prefix: string;
  name: string;
}
interface FileObj {
  key: string;
  name: string;
  size: number;
  lastModified: string | null;
  url: string;
}
interface Listing {
  prefix: string;
  folders: Folder[];
  files: FileObj[];
}

const IMG_RE = /\.(jpe?g|png|webp|gif|avif|heic|heif|tiff?|svg)$/i;
const UPLOAD_BATCH = 20;

function humanSize(n: number): string {
  if (!n) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

export default function FileManager() {
  const [prefix, setPrefix] = useState("");
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // status text while working

  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  // Enable directory selection on the folder input (non-standard attributes).
  useEffect(() => {
    if (folderInput.current) {
      folderInput.current.setAttribute("webkitdirectory", "");
      folderInput.current.setAttribute("directory", "");
    }
  }, []);

  const load = useCallback(async (p: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/files?prefix=${encodeURIComponent(p)}`);
      if (res.status === 401) throw new Error("Session expired — reload and log in again.");
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to load");
      setListing(await res.json());
    } catch (e: any) {
      setError(e.message);
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(prefix);
  }, [prefix, load]);

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    setError(null);
    try {
      let done = 0;
      for (let i = 0; i < files.length; i += UPLOAD_BATCH) {
        const batch = files.slice(i, i + UPLOAD_BATCH);
        const fd = new FormData();
        fd.append("prefix", prefix);
        for (const f of batch) {
          // Use relative path (folder uploads) or bare name as the field name.
          const rel = (f as any).webkitRelativePath || f.name;
          fd.append(rel, f, f.name);
        }
        setBusy(`Uploading ${done + 1}–${Math.min(done + batch.length, files.length)} of ${files.length}…`);
        // eslint-disable-next-line no-await-in-loop
        const res = await fetch("/api/files", { method: "POST", body: fd });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Upload failed");
        done += batch.length;
      }
      await load(prefix);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
      if (folderInput.current) folderInput.current.value = "";
    }
  }

  async function newFolder() {
    const name = window.prompt("New folder name");
    if (!name || !name.trim()) return;
    setBusy("Creating folder…");
    setError(null);
    try {
      const res = await fetch("/api/files/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix, name: name.trim() }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      await load(prefix);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function deleteFile(f: FileObj) {
    if (!confirm(`Delete "${f.name}"? This cannot be undone.`)) return;
    setBusy("Deleting…");
    try {
      const res = await fetch(`/api/files?key=${encodeURIComponent(f.key)}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      await load(prefix);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function rename(payload: { prefix?: string; key?: string }, current: string, kind: string) {
    const name = window.prompt(`Rename ${kind}`, current);
    if (!name || !name.trim() || name.trim() === current) return;
    setBusy("Renaming…");
    setError(null);
    try {
      const res = await fetch("/api/files/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, newName: name.trim() }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      await load(prefix);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function deleteFolder(folder: Folder) {
    if (!confirm(`Delete folder "${folder.name}" and EVERYTHING inside it? This cannot be undone.`)) return;
    setBusy("Deleting folder…");
    try {
      const res = await fetch(`/api/files?prefix=${encodeURIComponent(folder.prefix)}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      await load(prefix);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  // Breadcrumb segments
  const segments = prefix.replace(/\/$/, "").split("/").filter(Boolean);

  return (
    <div className="card card-white p-6 sm:p-10">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold">Files</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => fileInput.current?.click()} disabled={!!busy}
            className="rounded-lg bg-[#1a1a1a] px-4 py-2 font-body text-sm text-white transition-colors hover:bg-[#333] disabled:opacity-50">
            Upload files
          </button>
          <button onClick={() => folderInput.current?.click()} disabled={!!busy}
            className="rounded-lg bg-[#1a1a1a] px-4 py-2 font-body text-sm text-white transition-colors hover:bg-[#333] disabled:opacity-50">
            Upload folder
          </button>
          <button onClick={newFolder} disabled={!!busy}
            className="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50">
            New folder
          </button>
        </div>
      </div>
      <p className="mb-4 font-body text-sm text-[#6b6b6b]">
        Browse cloud storage. Upload folders of originals, then share any folder as a private album.
      </p>

      {/* Hidden inputs */}
      <input ref={fileInput} type="file" multiple className="hidden"
        onChange={(e) => uploadFiles(Array.from(e.target.files || []))} />
      <input ref={folderInput} type="file" multiple className="hidden"
        onChange={(e) => uploadFiles(Array.from(e.target.files || []))} />

      {/* Breadcrumb */}
      <div className="mb-4 flex flex-wrap items-center gap-1 font-body text-sm">
        <button onClick={() => setPrefix("")} className="rounded px-2 py-1 text-gray-600 hover:bg-gray-100">
          Home
        </button>
        {segments.map((seg, i) => {
          const p = segments.slice(0, i + 1).join("/") + "/";
          return (
            <span key={p} className="flex items-center gap-1">
              <span className="text-gray-300">/</span>
              <button onClick={() => setPrefix(p)}
                className={`rounded px-2 py-1 hover:bg-gray-100 ${i === segments.length - 1 ? "font-semibold text-black" : "text-gray-600"}`}>
                {seg}
              </button>
            </span>
          );
        })}
      </div>

      {busy && <p className="mb-3 font-body text-sm text-blue-600">{busy}</p>}
      {error && <p className="mb-3 font-body text-sm text-red-500">{error}</p>}
      {loading && <p className="font-body text-sm text-gray-400">Loading…</p>}

      {!loading && listing && (
        <div className="space-y-6">
          {listing.folders.length === 0 && listing.files.length === 0 && (
            <p className="font-body text-sm text-gray-400">This folder is empty.</p>
          )}

          {/* Folders */}
          {listing.folders.length > 0 && (
            <div>
              <h3 className="mb-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-500">Folders</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {listing.folders.map((folder) => (
                  <div key={folder.prefix}
                    className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <button onClick={() => setPrefix(folder.prefix)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <svg className="h-8 w-8 shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2Z" />
                      </svg>
                      <span className="truncate font-body text-sm font-medium text-gray-800">{folder.name}</span>
                    </button>
                    <div className="flex shrink-0 gap-1">
                      <ShareButton prefix={folder.prefix} name={folder.name} disabled={!!busy} />
                      <button onClick={() => rename({ prefix: folder.prefix }, folder.name, "folder")} disabled={!!busy}
                        title="Rename folder" className="rounded p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50">
                        <PencilIcon />
                      </button>
                      <button onClick={() => deleteFolder(folder)} disabled={!!busy}
                        title="Delete folder" className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50">
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {listing.files.length > 0 && (
            <div>
              <h3 className="mb-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-500">
                Files ({listing.files.length})
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {listing.files.map((f) => (
                  <div key={f.key} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="flex aspect-square items-center justify-center bg-gray-50">
                        {IMG_RE.test(f.name) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.url} alt={f.name} loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <svg className="h-10 w-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4a1 1 0 0 0 1 1h4M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                          </svg>
                        )}
                      </div>
                    </a>
                    <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                      <div className="min-w-0">
                        <p className="truncate font-body text-xs text-gray-700" title={f.name}>{f.name}</p>
                        {f.size > 0 && <p className="font-body text-[0.65rem] text-gray-400">{humanSize(f.size)}</p>}
                      </div>
                      <div className="flex shrink-0">
                        <button onClick={() => rename({ key: f.key }, f.name, "file")} disabled={!!busy}
                          title="Rename" className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50">
                          <PencilIcon />
                        </button>
                        <button onClick={() => deleteFile(f)} disabled={!!busy}
                          title="Delete" className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50">
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
    </svg>
  );
}

// Share-as-album modal trigger.
function ShareButton({ prefix, name, disabled }: { prefix: string; name: string; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [title, setTitle] = useState("");
  const [pin, setPin] = useState("");
  const [downloadable, setDownloadable] = useState(true);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<{ url: string; count: number; unlisted: boolean } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function openModal() {
    setVisibility("private");
    setTitle("");
    setPin("");
    setDownloadable(true);
    setResult(null);
    setErr(null);
    setCopied(false);
    setOpen(true);
  }

  async function share() {
    setWorking(true);
    setErr(null);
    try {
      const res = await fetch("/api/files/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix,
          title: title.trim() || undefined,
          pin: visibility === "private" ? pin.trim() || undefined : undefined,
          downloadable,
          unlisted: visibility === "private",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to create album");
      setResult({ url: data.url, count: data.count, unlisted: data.unlisted });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setWorking(false);
    }
  }

  const fullUrl = result ? `https://joshuaisaiah.art${result.url}` : "";

  return (
    <>
      <button onClick={openModal} disabled={disabled} title="Publish as gallery (site or private link)"
        className="rounded p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.7 10.7 15.3 7M8.7 13.3l6.6 3.7M18 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM8.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm9.5 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-black" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 font-heading text-lg font-bold">Publish “{name}”</h3>
            <p className="mb-4 font-body text-sm text-gray-500">
              Turn this folder into a gallery — on your site or as a private link.
            </p>

            {!result ? (
              <div className="space-y-4">
                {/* Visibility */}
                <div>
                  <label className="mb-1 block font-body text-xs text-gray-600">Where should it live?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setVisibility("public")}
                      className={`rounded-xl border px-3 py-2 text-left font-body text-sm transition-colors ${visibility === "public" ? "border-black bg-gray-900 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                      <span className="block font-medium">Show on my site</span>
                      <span className={`block text-xs ${visibility === "public" ? "text-gray-300" : "text-gray-400"}`}>Public gallery on /work</span>
                    </button>
                    <button type="button" onClick={() => setVisibility("private")}
                      className={`rounded-xl border px-3 py-2 text-left font-body text-sm transition-colors ${visibility === "private" ? "border-black bg-gray-900 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                      <span className="block font-medium">Private link</span>
                      <span className={`block text-xs ${visibility === "private" ? "text-gray-300" : "text-gray-400"}`}>Unlisted, share by URL</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block font-body text-xs text-gray-600">Gallery title (optional)</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={name}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 font-body text-sm focus:border-gray-400 focus:outline-none" />
                </div>
                {visibility === "private" && (
                  <div>
                    <label className="mb-1 block font-body text-xs text-gray-600">PIN (optional — viewers must enter it)</label>
                    <input value={pin} onChange={(e) => setPin(e.target.value)} inputMode="numeric" placeholder="e.g. 1234"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 font-body text-sm focus:border-gray-400 focus:outline-none" />
                  </div>
                )}
                <label className="flex items-center gap-2 font-body text-sm text-gray-700">
                  <input type="checkbox" checked={downloadable} onChange={(e) => setDownloadable(e.target.checked)} />
                  Allow visitors to download it (zip)
                </label>
                {err && <p className="font-body text-sm text-red-500">{err}</p>}
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 font-body text-sm text-gray-600 hover:bg-gray-100">
                    Cancel
                  </button>
                  <button onClick={share} disabled={working}
                    className="rounded-lg bg-[#1a1a1a] px-4 py-2 font-body text-sm text-white hover:bg-[#333] disabled:opacity-50">
                    {working ? "Creating…" : visibility === "public" ? "Publish to site" : "Create link"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-body text-sm text-gray-700">
                  {result.unlisted
                    ? `Private album created with ${result.count} photo${result.count === 1 ? "" : "s"}.`
                    : `Published to your site with ${result.count} photo${result.count === 1 ? "" : "s"} — it now appears on /work and in your Galleries tab.`}
                </p>
                <div className="flex items-center gap-2">
                  <input readOnly value={fullUrl}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 font-body text-sm" />
                  <button
                    onClick={async () => { await navigator.clipboard.writeText(fullUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                    className="shrink-0 rounded-lg bg-[#1a1a1a] px-3 py-2 font-body text-sm text-white hover:bg-[#333]">
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="flex justify-end gap-2">
                  <a href={result.url} target="_blank" rel="noopener noreferrer"
                    className="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-700 hover:bg-gray-100">
                    Open gallery
                  </a>
                  <button onClick={() => setOpen(false)} className="rounded-lg bg-[#1a1a1a] px-4 py-2 font-body text-sm text-white hover:bg-[#333]">
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
