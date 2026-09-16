import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import Busboy from "busboy";
import { Readable } from "stream";
import { createWriteStream } from "fs";
import { mkdir, unlink, stat, readFile, writeFile } from "fs/promises";
import path from "path";
import os from "os";
import { spawn } from "child_process";
import { spacesConfigured, uploadToSpaces } from "@/app/lib/storage";

export const config = { api: { bodyParser: false } };

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args);
    let stderr = "";
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
      if (stderr.length > 8000) stderr = stderr.slice(-8000);
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-1500)}`));
    });
  });
}

// Runs after the response is sent — the reel record is only created once
// compression succeeds, so nothing half-processed ever shows publicly.
async function processVideo(tmpPath: string, caption: string | null) {
  const base = `video-${Date.now()}`;
  // Encode into tmp; final home is Spaces (if configured) or public/reels
  const outVideo = path.join(os.tmpdir(), `${base}.mp4`);
  const outPoster = path.join(os.tmpdir(), `${base}.jpg`);

  try {
    // 720px-wide H.264 @ CRF 27 — cuts phone footage to a fraction of its
    // size while staying crisp at grid/modal sizes on the space-tight droplet
    await runFfmpeg([
      "-y", "-i", tmpPath,
      "-vf", "scale='min(720,iw)':-2,fps=30",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "27",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "96k", "-ac", "2",
      "-movflags", "+faststart",
      outVideo,
    ]);

    await runFfmpeg(["-y", "-ss", "0.5", "-i", outVideo, "-frames:v", "1", "-q:v", "3", outPoster]);

    const inSize = (await stat(tmpPath)).size;
    const outSize = (await stat(outVideo)).size;
    console.log(
      `Reel compressed: ${(inSize / 1e6).toFixed(1)}MB -> ${(outSize / 1e6).toFixed(1)}MB (${base}.mp4)`
    );

    let sourceUrl: string;
    let thumbnailUrl: string;
    if (spacesConfigured) {
      sourceUrl = await uploadToSpaces(`reels/${base}.mp4`, await readFile(outVideo), "video/mp4");
      thumbnailUrl = await uploadToSpaces(`reels/${base}.jpg`, await readFile(outPoster), "image/jpeg");
    } else {
      const reelsDir = path.join(process.cwd(), "public", "reels");
      await mkdir(reelsDir, { recursive: true });
      await writeFile(path.join(reelsDir, `${base}.mp4`), await readFile(outVideo));
      await writeFile(path.join(reelsDir, `${base}.jpg`), await readFile(outPoster));
      sourceUrl = `/reels/${base}.mp4`;
      thumbnailUrl = `/reels/${base}.jpg`;
    }

    const lastVideo = await (prisma as any).socialVideo.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    await (prisma as any).socialVideo.create({
      data: {
        sourceUrl,
        thumbnailUrl,
        caption: caption || null,
        sortOrder: (lastVideo?.sortOrder ?? -1) + 1,
      },
    });
  } catch (error) {
    console.error("Reel video processing failed:", error);
  } finally {
    for (const f of [outVideo, outPoster, tmpPath]) {
      try { await unlink(f); } catch {}
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!request.body) {
      return NextResponse.json({ error: "No body" }, { status: 400 });
    }

    const tmpPath = path.join(os.tmpdir(), `reel-upload-${Date.now()}`);

    const { caption, gotFile } = await new Promise<{ caption: string; gotFile: boolean }>(
      (resolve, reject) => {
        const bb = Busboy({
          headers: { "content-type": request.headers.get("content-type") || "" },
          limits: { fileSize: 500 * 1024 * 1024, files: 1 },
        });

        let caption = "";
        let gotFile = false;
        let fileWritten: Promise<void> = Promise.resolve();

        bb.on("field", (name, value) => {
          if (name === "caption") caption = value;
        });

        // Stream straight to disk — phone videos are too big to buffer in RAM
        bb.on("file", (_name, stream) => {
          gotFile = true;
          fileWritten = new Promise<void>((res, rej) => {
            const out = createWriteStream(tmpPath);
            stream.pipe(out);
            out.on("close", res);
            out.on("error", rej);
            stream.on("error", rej);
          });
        });

        bb.on("finish", () => {
          fileWritten.then(() => resolve({ caption, gotFile })).catch(reject);
        });
        bb.on("error", reject);

        Readable.fromWeb(request.body as any).pipe(bb);
      }
    );

    if (!gotFile) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    // Compress in the background; the reel appears in the list when done
    void processVideo(tmpPath, caption || null);

    return NextResponse.json(
      { processing: true, message: "Video uploaded — compressing now, the reel will appear shortly." },
      { status: 202 }
    );
  } catch (error) {
    console.error("Failed to upload reel video:", error);
    return NextResponse.json(
      { error: "Failed to upload video" },
      { status: 500 }
    );
  }
}
