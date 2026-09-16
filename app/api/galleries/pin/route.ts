import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { slugify } from "@/app/lib/slug";
import { pinToken, pinCookieName } from "@/app/lib/pin";

export async function POST(request: NextRequest) {
  try {
    const { slug, pin } = await request.json();

    if (!slug || !pin) {
      return NextResponse.json({ error: "PIN required" }, { status: 400 });
    }

    const galleries = await prisma.gallery.findMany();
    const gallery = galleries.find(
      (g) => (g as any).slug === slug || slugify(g.title) === slug
    );

    if (!gallery || !(gallery as any).pin) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    if (String(pin).trim() !== (gallery as any).pin) {
      return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(pinCookieName(gallery.id), pinToken(gallery.id, (gallery as any).pin), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("PIN verification failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
