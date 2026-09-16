import { stat } from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

// Next 16 only serves public/ files that existed at build time; runtime
// uploads (gallery images, reel thumbnails/videos) fall through to route
// handlers that call this. Supports Range requests — Safari refuses to
// play <video> without them.
export async function serveUpload(request: Request, ...segments: string[]): Promise<Response> {
  const safe = segments.map((s) => path.basename(s));
  const filePath = path.join(process.cwd(), "public", ...safe);

  let size: number;
  try {
    size = (await stat(filePath)).size;
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
  const common = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    // Uploaded filenames are timestamped, so they never change content
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const range = request.headers.get("range");
  if (range) {
    const match = range.match(/bytes=(\d*)-(\d*)/);
    let start = match?.[1] ? parseInt(match[1], 10) : 0;
    let end = match?.[2] ? parseInt(match[2], 10) : size - 1;
    if (Number.isNaN(start)) start = 0;
    if (Number.isNaN(end) || end >= size) end = size - 1;

    if (start >= size || start > end) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }

    const stream = createReadStream(filePath, { start, end });
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        ...common,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  const stream = createReadStream(filePath);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    status: 200,
    headers: { ...common, "Content-Length": String(size) },
  });
}
