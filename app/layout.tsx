import type { Metadata, Viewport } from "next";
import { Spline_Sans, Geist } from "next/font/google";
import "./globals.css";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";

const splineSans = Spline_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-spline-sans",
  subsets: ["latin"],
});

const geist = Geist({
  weight: ["400", "500"],
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joshua Isaiah — Creative Director",
  description: "Joshua Isaiah — visual artist, creative director, photographer, filmmaker.",
};

export const viewport: Viewport = {
  themeColor: "#1a1410",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${splineSans.variable} ${geist.variable} antialiased min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]`}
      >
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
