import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Public client submissions — land unapproved, reviewed in admin Stories
export async function POST(request: NextRequest) {
  try {
    const { quote, name, role, website } = await request.json();

    // Honeypot: real people never fill the hidden "website" field
    if (website) return NextResponse.json({ success: true });

    if (!quote?.trim() || !name?.trim()) {
      return NextResponse.json(
        { error: "Please include your story and your name" },
        { status: 400 }
      );
    }
    if (quote.length > 1200 || name.length > 120 || (role?.length ?? 0) > 160) {
      return NextResponse.json({ error: "That's a bit too long" }, { status: 400 });
    }

    // Light flood guard: cap pending submissions
    const pending = await (prisma as any).testimonial.count({
      where: { approved: false },
    });
    if (pending >= 50) {
      return NextResponse.json(
        { error: "Submissions are temporarily closed — thank you!" },
        { status: 429 }
      );
    }

    await (prisma as any).testimonial.create({
      data: {
        quote: quote.trim(),
        name: name.trim(),
        role: role?.trim() || null,
        approved: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit testimonial:", error);
    return NextResponse.json(
      { error: "Something went wrong — please try again" },
      { status: 500 }
    );
  }
}
