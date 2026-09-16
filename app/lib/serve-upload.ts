import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

// Next 16 only serves public/ files that existed at build time; runtime
// uploads (gallery images, reel thumbnails) fall through to route handlers
// that call this.
export async function serveUpload(...segments: string[]): Promise<NextResponse> {
  const safe = segments.map((s) => path.basename(s));
  const filePath = path.join(process.cwd(), "public", ...safe);

  try {
    const buffer = await readFile(filePath);
    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": type,
        // Uploaded filenames are timestamped, so they never change content
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
