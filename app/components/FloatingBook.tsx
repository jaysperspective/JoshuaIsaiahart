"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Floating booking CTA — appears after the visitor starts scrolling,
// hides while the actual #book section is on screen.
export default function FloatingBook() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [bookInView, setBookInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setBookInView(false);
    const target = document.getElementById("book");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setBookInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  // Keep it off admin and the Uraenis art piece
  if (pathname.startsWith("/admin") || pathname.startsWith("/Uraenis")) {
    return null;
  }

  const visible = scrolled && !bookInView;

  return (
    <Link
      href="/work#book"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed right-5 z-40 flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-sans text-[0.7rem] font-medium uppercase tracking-[0.16em] text-paper shadow-[0_6px_24px_rgba(24,32,28,0.28)] transition-all duration-300 hover:bg-[--accent-deep] ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Book a Session
    </Link>
  );
}
