import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // ?all=1 (admin) includes pending submissions; public gets approved only
    const includeAll = new URL(request.url).searchParams.get("all") === "1";
    const testimonials = await (prisma as any).testimonial.findMany({
      ...(includeAll ? {} : { where: { approved: true } }),
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { quote, name, role } = await request.json();

    if (!quote?.trim() || !name?.trim()) {
      return NextResponse.json({ error: "Quote and name are required" }, { status: 400 });
    }

    const last = await (prisma as any).testimonial.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const testimonial = await (prisma as any).testimonial.create({
      data: {
        quote: quote.trim(),
        name: name.trim(),
        role: role?.trim() || null,
        approved: true, // admin-created stories go live immediately
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
