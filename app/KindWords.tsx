"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface HomeTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string | null;
}

const PER_PAGE = 2;
const ROTATE_MS = 8000;
const FADE_MS = 600;

// Shows two approved reviews at a time, cross-fading to the next pair every
// few seconds. Capping the visible count keeps the hero pinned to the viewport
// no matter how many testimonials get approved.
export default function KindWords({
  testimonials,
}: {
  testimonials: HomeTestimonial[];
}) {
  const pages = Math.ceil(testimonials.length / PER_PAGE);
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (pages <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      const swap = setTimeout(() => {
        setPage((p) => (p + 1) % pages);
        setVisible(true);
      }, FADE_MS);
      return () => clearTimeout(swap);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, [pages]);

  if (testimonials.length === 0) return null;

  const start = page * PER_PAGE;
  const current = testimonials.slice(start, start + PER_PAGE);

  return (
    <div className="mt-12 max-w-xl border-t border-rule pt-8">
      <p className="eyebrow mb-6">Kind Words</p>
      <div
        className="space-y-8 transition-opacity ease-in-out"
        style={{
          transitionDuration: `${FADE_MS}ms`,
          opacity: visible ? 1 : 0,
        }}
      >
        {current.map((t) => (
          <figure key={t.id} className="relative pl-7">
            <span
              aria-hidden
              className="absolute left-0 -top-3 font-display text-5xl leading-none text-accent/50"
            >
              &ldquo;
            </span>
            <blockquote className="prose-serif text-[1.05rem] italic leading-relaxed">
              {t.quote}
            </blockquote>
            <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-2">
              <span className="label text-ink">{t.name}</span>
              {t.role && <span className="label">· {t.role}</span>}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-7 flex items-center gap-4">
        {pages > 1 && (
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: pages }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full transition-colors"
                style={{
                  backgroundColor:
                    i === page ? "var(--accent)" : "var(--rule)",
                }}
              />
            ))}
          </div>
        )}
        <Link
          href="/testimonial#reviews"
          className="label link-underline text-ink"
        >
          All kind words →
        </Link>
      </div>
    </div>
  );
}
