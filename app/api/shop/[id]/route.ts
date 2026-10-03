import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";

// PUT /api/shop/[id]  (admin) → update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const { id } = await params;
    const { title, description, imageUrl, price, dimensions, paperType, displayRatio, published } =
      await request.json();

    let cents: number | undefined;
    if (price !== undefined) {
      cents = Math.round(Number(price));
      if (!Number.isFinite(cents) || cents < 0) {
        return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
      }
    }

    const product = await prisma.shopProduct.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(description !== undefined && { description: String(description).trim() || null }),
        ...(imageUrl !== undefined && { imageUrl: String(imageUrl).trim() }),
        ...(cents !== undefined && { price: cents }),
        ...(dimensions !== undefined && { dimensions: String(dimensions).trim() }),
        ...(paperType !== undefined && { paperType: String(paperType).trim() }),
        ...(displayRatio !== undefined &&
          ["4:3", "3:4", "1:1"].includes(displayRatio) && { displayRatio }),
        ...(published !== undefined && { published: Boolean(published) }),
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to update shop product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/shop/[id]  (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const { id } = await params;
    await prisma.shopProduct.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete shop product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
