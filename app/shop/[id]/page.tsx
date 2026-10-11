import type { Metadata } from "next";
import { cache } from "react";
import { prisma } from "@/app/lib/prisma";
import ShopScreen from "../ShopScreen";

export const revalidate = 1800;

// Deduped per-request lookup — shared by generateMetadata and the page body
// so a single render makes one DB query, not two.
const getProduct = cache(async (id: string) => {
  try {
    return await prisma.shopProduct.findUnique({ where: { id } });
  } catch {
    return null;
  }
});

const price = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// Per-print share metadata so a direct link previews the title + image.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  {
    const p = await getProduct(id);
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
          images: [{ url: p.imageUrl, width: 1200, height: 630 }],
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: `${p.title} — Fine-Art Print`,
          description: desc,
          images: [p.imageUrl],
        },
      };
    }
  }
  return {
    title: "Fine Art Prints — Washington, DC Photographer",
    alternates: { canonical: "/shop" },
  };
}

const SITE_URL = "https://joshuaisaiah.art";
const absoluteUrl = (u: string) =>
  u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`;

export default async function ShopItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Structured data for the print — Product (price/availability) + breadcrumb.
  const p = await getProduct(id);
  let jsonLd: object | null = null;
  {
    if (p && p.published) {
      const url = `${SITE_URL}/shop/${id}`;
      jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product",
            name: p.title,
            image: absoluteUrl(p.imageUrl),
            description:
              p.description ||
              `${p.dimensions} fine-art archival print by Joshua Isaiah.`,
            brand: { "@type": "Brand", name: "Joshua Isaiah" },
            offers: {
              "@type": "Offer",
              price: (p.price / 100).toFixed(2),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url,
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
              { "@type": "ListItem", position: 3, name: p.title, item: url },
            ],
          },
        ],
      };
    }
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ShopScreen initialProductId={id} />
    </>
  );
}
