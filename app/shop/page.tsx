import ShopScreen from "./ShopScreen";

export const dynamic = "force-dynamic";

const SHOP_DESC =
  "Fine-art archival photographic prints by Joshua Isaiah — hand-selected images, printed to order and shipped.";

export const metadata = {
  title: "Purchase Archival Prints",
  description: SHOP_DESC,
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Purchase Archival Prints",
    description: SHOP_DESC,
    url: "https://joshuaisaiah.art/shop",
    siteName: "Joshua Isaiah",
    images: [{ url: "/og-shop.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Purchase Archival Prints",
    description: SHOP_DESC,
    images: ["/og-shop.jpg"],
  },
};

export default function ShopPage() {
  return <ShopScreen />;
}
