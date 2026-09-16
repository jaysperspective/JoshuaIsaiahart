import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import FloatingBook from "./components/FloatingBook";
import Tracker from "./components/Tracker";

// Editorial display serif — high contrast, optical sizing.
// Self-hosted variable font (wght + opsz axes), latin subset.
const fraunces = localFont({
  src: [
    { path: "./fonts/Fraunces.woff2", style: "normal" },
    { path: "./fonts/Fraunces-Italic.woff2", style: "italic" },
  ],
  weight: "100 900",
  variable: "--font-fraunces",
  display: "swap",
});

// Clean grotesque for labels, captions, UI — self-hosted variable font.
const geist = localFont({
  src: "./fonts/Geist.woff2",
  weight: "100 900",
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://joshuaisaiah.art"),
  title: {
    default: "Joshua Isaiah — Creative Director, Photographer & Filmmaker",
    template: "%s — Joshua Isaiah",
  },
  description:
    "Joshua Isaiah is a Creative Director, photographer, and filmmaker in the Washington, DC metro area — event photography, films, and social-first video for clients.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Joshua Isaiah — Creative Director",
    description:
      "Photographer & filmmaker. Selected work in photography, film, and social.",
    url: "https://joshuaisaiah.art",
    siteName: "Joshua Isaiah",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joshua Isaiah — Creative Director",
    description:
      "Photographer & filmmaker. Selected work in photography, film, and social.",
    images: ["/og-image.jpg"],
  },
};

// Entity graph for search engines and AI systems: who Joshua is, what the
// business offers, where it operates. Values must match visible site content.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://joshuaisaiah.art/#joshua",
      name: "Joshua Isaiah",
      jobTitle: "Creative Director",
      description:
        "Creative Director, photographer, and filmmaker in the Washington, DC metro area.",
      url: "https://joshuaisaiah.art",
      image: "https://joshuaisaiah.art/og-image.jpg",
      email: "mailto:joshualharrington@gmail.com",
      knowsAbout: [
        "Photography",
        "Videography",
        "Event Photography",
        "Creative Direction",
        "Social Media Video",
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://joshuaisaiah.art/#business",
      name: "Joshua Isaiah — Photography & Film",
      url: "https://joshuaisaiah.art",
      image: "https://joshuaisaiah.art/og-image.jpg",
      telephone: "+1-434-489-3932",
      email: "joshualharrington@gmail.com",
      priceRange: "$$",
      areaServed: { "@type": "AdministrativeArea", name: "Washington, DC Metro Area" },
      address: { "@type": "PostalAddress", addressRegion: "DC", addressCountry: "US" },
      founder: { "@id": "https://joshuaisaiah.art/#joshua" },
      makesOffer: [
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Photography — events, editorial, portraits" },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Videography — events, films, interviews" },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Short-form social video for brands and clients" },
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://joshuaisaiah.art/#website",
      url: "https://joshuaisaiah.art",
      name: "Joshua Isaiah",
      publisher: { "@id": "https://joshuaisaiah.art/#joshua" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${geist.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {children}
        <FloatingBook />
        <Tracker />
      </body>
    </html>
  );
}
