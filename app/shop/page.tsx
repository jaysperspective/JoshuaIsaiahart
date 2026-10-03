import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import ShopClient, { type ShopProductDTO } from "./ShopClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fine Art Prints — Washington, DC Photographer",
  description:
    "Buy fine-art photographic prints by Washington, DC photographer Joshua Isaiah. Archival, hand-selected images printed and shipped.",
  alternates: { canonical: "/shop" },
};

async function getProducts(): Promise<ShopProductDTO[]> {
  try {
    const rows = await prisma.shopProduct.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      price: p.price,
      dimensions: p.dimensions,
      paperType: p.paperType,
      displayRatio: p.displayRatio,
    }));
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <main className="shop-wall min-h-screen text-paper">
      <div className="w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Masthead */}
        <header className="flex items-center justify-between pt-10 sm:pt-14">
          <Link
            href="/"
            className="eyebrow transition-colors hover:text-white"
            style={{ color: "rgba(244,236,210,0.85)" }}
          >
            ← Joshua Isaiah
          </Link>
          <span className="label numeral" style={{ color: "rgba(244,236,210,0.7)" }}>
            The Print Shop
          </span>
        </header>
        <hr className="mt-5 border-0 border-t" style={{ borderColor: "rgba(244,236,210,0.2)" }} />

        {/* Title block */}
        <section className="pt-10 text-center sm:pt-14">
          <p className="eyebrow mb-6" style={{ color: "rgba(244,236,210,0.8)" }}>
            Fine-Art Prints · Washington, DC
          </p>
          <h1 className="display mx-auto max-w-3xl" style={{ color: "#f4ecd2" }}>
            Prints for the <span className="italic font-light">wall</span>
          </h1>
          <p
            className="prose-serif mx-auto mt-6 max-w-2xl"
            style={{ color: "rgba(244,236,210,0.85)" }}
          >
            A selection of images offered as archival prints. Each is printed to order —
            select a piece to see its size, paper, and details.
          </p>
        </section>

        {/* Grid + detail */}
        <ShopClient products={products} />

        {/* Footer */}
        <footer className="mt-16">
          <div
            className="flex flex-wrap items-center justify-between gap-4 border-t py-10"
            style={{ borderColor: "rgba(244,236,210,0.18)" }}
          >
            <Link
              href="/"
              className="font-sans text-sm underline-offset-4 hover:underline"
              style={{ color: "rgba(244,236,210,0.85)" }}
            >
              ← Home
            </Link>
            <p className="label numeral" style={{ color: "rgba(244,236,210,0.6)" }}>
              joshualharrington@gmail.com · (434) 489-3932
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
