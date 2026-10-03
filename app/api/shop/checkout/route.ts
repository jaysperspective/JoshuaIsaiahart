import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// POST /api/shop/checkout  (public)
// Starts a real card checkout for a print. The portfolio never talks to Stripe
// directly — it hands off to the Sovereign payment app (/payment), which owns
// the Stripe account and records the sale in its dashboard. The print price is
// read from our DB here (never trusted from the client). We return the hosted
// Stripe Checkout URL for the browser to redirect to.
export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();
    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "Missing product" }, { status: 400 });
    }

    const product = await prisma.shopProduct.findUnique({ where: { id: productId } });
    if (!product || !product.published) {
      return NextResponse.json({ error: "Product not available" }, { status: 404 });
    }

    const apiBase = process.env.SOVEREIGN_API_BASE;
    const secret = process.env.SOVEREIGN_INTERNAL_SECRET;
    if (!apiBase || !secret) {
      console.error("Shop checkout not configured (SOVEREIGN_API_BASE / SOVEREIGN_INTERNAL_SECRET)");
      return NextResponse.json({ error: "Checkout is temporarily unavailable" }, { status: 503 });
    }

    const origin = request.nextUrl.origin;
    const successUrl = `${origin}/shop/${product.id}?paid=1`;
    const cancelUrl = `${origin}/shop/${product.id}`;
    // Canonical public link for this print (used on the Stripe receipt metadata).
    const productUrl = `https://joshuaisaiah.art/shop/${product.id}`;

    const res = await fetch(`${apiBase}/shop/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": secret,
        // Sovereign forces HTTPS in prod and 301-redirects plain HTTP — even on
        // loopback. This server-to-server call goes direct (not through nginx),
        // so we assert the proto ourselves to avoid the redirect.
        "X-Forwarded-Proto": "https",
      },
      body: JSON.stringify({
        title: product.title,
        description: [product.dimensions, product.paperType].filter(Boolean).join(" · "),
        amountCents: product.price,
        productId: product.id,
        productUrl,
        successUrl,
        cancelUrl,
      }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      console.error("Sovereign checkout failed:", res.status, d);
      return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
    }

    const { url } = await res.json();
    if (!url) {
      return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
    }

    // Lightweight breadcrumb — a record that someone began checkout for this
    // print. Identity + the actual sale live in Sovereign (the source of truth);
    // this is just a conversion signal in the admin Shop tab. Best-effort.
    prisma.shopOrder
      .create({ data: { productId: product.id, name: "", email: "", status: "checkout_started" } })
      .catch(() => {});

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Failed to start shop checkout:", error);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
