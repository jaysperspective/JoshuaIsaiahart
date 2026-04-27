"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const NAV_ITEMS: { label: string; href: string; tab?: string; accent: string }[] = [
  { label: "Photography", href: "/work?tab=photography", tab: "photography", accent: "var(--accent-photography)" },
  { label: "Videography", href: "/work?tab=videography", tab: "videography", accent: "var(--accent-videography)" },
  { label: "Design", href: "/work?tab=design", tab: "design", accent: "var(--accent-design)" },
  { label: "About", href: "/about", accent: "var(--accent-about)" },
  { label: "Contact", href: "/work?tab=contact", tab: "contact", accent: "var(--accent-contact)" },
];

function NavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith("/admin")) return null;

  const currentTab = searchParams.get("tab") ?? (pathname === "/work" ? "photography" : null);

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.tab) return pathname === "/work" && currentTab === item.tab;
    return pathname === item.href;
  };

  return (
    <nav className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-sm border-b-2 border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 gap-2">
        <Link
          href="/"
          className="font-heading font-semibold tracking-tight text-[var(--foreground)] no-underline whitespace-nowrap"
        >
          Joshua Isaiah
        </Link>

        <div className="hidden md:flex items-center gap-5 text-sm font-body">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                href={item.href}
                className="no-underline transition-colors"
                style={{
                  color: active ? "var(--foreground)" : "var(--text-muted)",
                  borderBottom: active ? `2px solid ${item.accent}` : "2px solid transparent",
                  paddingBottom: "2px",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="md:hidden p-2 -mr-2 text-[var(--foreground)]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-[var(--background)] border-b-2 border-[var(--border-color)] shadow-lg">
          <div className="flex flex-col px-4 py-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="py-3 no-underline font-body text-sm border-b border-[var(--border-color)] last:border-b-0"
                  style={{
                    color: active ? "var(--foreground)" : "var(--text-muted)",
                    borderLeft: active ? `3px solid ${item.accent}` : "3px solid transparent",
                    paddingLeft: "12px",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

export default function SiteNav() {
  return (
    <Suspense fallback={<div className="sticky top-0 z-40 h-14 border-b-2 border-[var(--border-color)] bg-[var(--background)]" />}>
      <NavInner />
    </Suspense>
  );
}
