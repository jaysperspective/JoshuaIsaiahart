import ShopScreen from "./ShopScreen";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fine Art Prints — Washington, DC Photographer",
  description:
    "Buy fine-art photographic prints by Washington, DC photographer Joshua Isaiah. Archival, hand-selected images printed and shipped.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return <ShopScreen />;
}
