import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
  title: "Joshua Isaiah — Creative Director",
  description:
    "Joshua Isaiah — Creative Director, photographer & filmmaker. Selected work in photography, film, and design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${geist.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
