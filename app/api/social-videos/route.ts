import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { parseSocialUrl } from "@/app/lib/video-utils";

export async function GET() {
  try {
    const socialVideos = await (prisma as any).socialVideo.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
    });
    return NextResponse.json(socialVideos);
  } catch (error) {
    console.error("Failed to fetch social videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch social videos" },
      { status: 500 }
    );
  }
}

// Fetch a thumbnail for platforms that expose one without auth
async function autoThumbnail(sourceUrl: string): Promise<string | null> {
  const parsed = parseSocialUrl(sourceUrl);

  if (parsed.platform === "youtube" && parsed.id) {
    return `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`;
  }

  if (parsed.platform === "tiktok") {
    try {
      const res = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(sourceUrl)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (typeof data.thumbnail_url === "string") return data.thumbnail_url;
      }
    } catch {
      // oEmbed unavailable — card falls back to the embed itself
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceUrl, caption, thumbnailUrl } = body;

    if (!sourceUrl) {
      return NextResponse.json(
        { error: "Video link is required" },
        { status: 400 }
      );
    }

    const parsed = parseSocialUrl(sourceUrl);
    if (!parsed.platform) {
      return NextResponse.json(
        { error: "Unsupported link. Use a TikTok video, Instagram Reel, YouTube Short, or direct video URL. (TikTok share links like vm.tiktok.com must be opened in a browser first to get the full link.)" },
        { status: 400 }
      );
    }

    const thumbnail = thumbnailUrl || (await autoThumbnail(sourceUrl));

    const lastVideo = await (prisma as any).socialVideo.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const nextSortOrder = (lastVideo?.sortOrder ?? -1) + 1;

    const socialVideo = await (prisma as any).socialVideo.create({
      data: {
        sourceUrl,
        caption: caption || null,
        thumbnailUrl: thumbnail,
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json(socialVideo, { status: 201 });
  } catch (error) {
    console.error("Failed to create social video:", error);
    return NextResponse.json(
      { error: "Failed to create social video" },
      { status: 500 }
    );
  }
}
