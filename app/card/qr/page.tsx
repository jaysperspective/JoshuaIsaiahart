import Link from "next/link";
import type { Metadata } from "next";
import { CARD, SITE_URL } from "@/app/lib/contact";

export const metadata: Metadata = {
  title: "Scan to Connect",
  description: `Scan to open ${CARD.name}'s digital business card.`,
  robots: { index: false, follow: false },
};

// Full-screen QR to show in person. Points to /card.
export default function CardQrPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-12 text-ink">
      <p className="eyebrow">Scan to connect</p>
      <h1 className="headline mt-3 text-center">{CARD.name}</h1>
      <p className="label normal-case tracking-normal mt-2 text-muted">
        {CARD.title} · {CARD.tagline}
      </p>

      {/* QR on a white card for maximum contrast / scannability */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-[0_10px_40px_rgba(24,32,28,0.18)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/card-qr.svg"
          alt={`QR code linking to ${SITE_URL}/card`}
          width={256}
          height={256}
          className="h-64 w-64"
        />
      </div>

      <p className="label normal-case tracking-normal mt-6 text-center text-muted">
        Point your phone camera at the code
      </p>

      <Link href="/card" className="btn mt-8">
        Open the card
      </Link>
    </main>
  );
}
