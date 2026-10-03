import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import ShopScreen from "../ShopScreen";

export const dynamic = "force-dynamic";

const price = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// Per-print share metadata so a direct link previews the title + image.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await prisma.shopProduct.findUnique({ where: { id } });
    if (p && p.published) {
      const desc =
        p.description?.slice(0, 160) ||
        `${p.dimensions} fine-art print — ${price(p.price)}. By Joshua Isaiah.`;
      return {
        title: `${p.title} — Fine-Art Print`,
        description: desc,
        alternates: { canonical: `/shop/${id}` },
        openGraph: {
          title: `${p.title} — Fine-Art Print`,
          description: desc,
          images: [{ url: p.imageUrl }],
          type: "website",
        },
      };
    }
  } catch {
    /* fall through to default */
  }
  return {
    title: "Fine Art Prints — Washington, DC Photographer",
    alternates: { canonical: "/shop" },
  };
}

export default async function ShopItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ShopScreen initialProductId={id} />;
}
