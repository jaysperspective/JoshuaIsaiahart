import type { Metadata } from "next";
import { Spline_Sans, Geist } from "next/font/google";
import "./globals.css";

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
  title: "Joshua Isaiah - Creative Director",
  description: "Joshua Isaiah - Creative Director | Asun Media",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${splineSans.variable} ${geist.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
