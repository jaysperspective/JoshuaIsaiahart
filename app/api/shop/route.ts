import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";

// GET /api/shop          → published products (public, shop grid)
// GET /api/shop?all=1     → every product (admin only)
export async function GET(request: NextRequest) {
  try {
    const all = new URL(request.url).searchParams.get("all") === "1";
    if (all) {
      if (!requireAdmin(request)) return unauthorized();
      const products = await prisma.shopProduct.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      return NextResponse.json(products);
    }
    const products = await prisma.shopProduct.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch shop products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/shop  (admin) → create a product
export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const { title, description, imageUrl, price, dimensions, paperType, displayRatio, published } =
      await request.json();

    if (!title?.trim() || !imageUrl?.trim() || !dimensions?.trim() || !paperType?.trim()) {
      return NextResponse.json(
        { error: "Title, image, dimensions and paper type are required" },
        { status: 400 }
      );
    }
    const cents = Math.round(Number(price));
    if (!Number.isFinite(cents) || cents < 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }

    const last = await prisma.shopProduct.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const product = await prisma.shopProduct.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl.trim(),
        price: cents,
        dimensions: dimensions.trim(),
        paperType: paperType.trim(),
        displayRatio: ["4:3", "3:4", "1:1"].includes(displayRatio) ? displayRatio : "4:3",
        published: published === undefined ? true : Boolean(published),
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create shop product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
