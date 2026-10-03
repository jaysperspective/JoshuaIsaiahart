import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/shop/order  (public) → record a customer's name + email against a
// product the moment they hit "Purchase". Checkout/payment is a later phase;
// this guarantees every interested customer is on record.
export async function POST(request: NextRequest) {
  try {
    const { productId, name, email } = await request.json();
    if (!productId || !name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    }
    const product = await prisma.shopProduct.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    await prisma.shopOrder.create({
      data: { productId, name: name.trim(), email: email.trim() },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to record shop order:", error);
    return NextResponse.json({ error: "Failed to record order" }, { status: 500 });
  }
}

// GET /api/shop/order  (admin) → customer records, newest first
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const orders = await prisma.shopOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { title: true, dimensions: true, price: true } } },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch shop orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
