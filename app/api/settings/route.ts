import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET settings (or return defaults)
export async function GET() {
  try {
    // Note: Settings model pending schema migration
    let settings = await (prisma as any).settings.findFirst();

    if (!settings) {
      // Return defaults if no settings exist
      settings = {
        instagramUrl: "",
        linkedinUrl: "",
        youtubeUrl: "",
      };
    }

    return NextResponse.json(settings);
  } catch {
    // Return defaults if Settings model doesn't exist yet
    return NextResponse.json({
      instagramUrl: "",
      linkedinUrl: "",
      youtubeUrl: "",
    });
  }
}

// PUT to update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagramUrl, linkedinUrl, youtubeUrl } = body;

    // Note: Settings model pending schema migration
    // Upsert: create if not exists, update if exists
    let settings = await (prisma as any).settings.findFirst();

    if (settings) {
      settings = await (prisma as any).settings.update({
        where: { id: settings.id },
        data: {
          instagramUrl: instagramUrl ?? "",
          linkedinUrl: linkedinUrl ?? "",
          youtubeUrl: youtubeUrl ?? "",
        },
      });
    } else {
      settings = await (prisma as any).settings.create({
        data: {
          instagramUrl: instagramUrl ?? "",
          linkedinUrl: linkedinUrl ?? "",
          youtubeUrl: youtubeUrl ?? "",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
