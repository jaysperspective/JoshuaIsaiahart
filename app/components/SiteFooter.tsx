import Link from "next/link";
import { CARD } from "@/app/lib/contact";

const INSTAGRAM_URL = "https://instagram.com/fototrophic";
const LINKEDIN_URL = "https://www.linkedin.com/in/jharringtonphoto/";

const NAV = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/rate-sheet", label: "Rate Sheet" },
  { href: "/shop", label: "Shop" },
  { href: "/testimonial", label: "Reviews" },
];

// Shared site footer: contact, socials, and primary nav. Rendered on pages
// (like the home page) that would otherwise have no persistent navigation.
export default function SiteFooter() {
  return (
    <footer className="bg-paper text-ink px-6 sm:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <hr className="rule" />
        <div className="flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between">
          {/* Contact */}
          <div className="flex flex-col gap-2">
            <p className="eyebrow mb-1">Get in touch</p>
            <a href={`mailto:${CARD.email}`} className="link-underline font-sans text-sm">
              {CARD.email}
            </a>
            <a href={`tel:${CARD.phone}`} className="link-underline font-sans text-sm">
              {CARD.phoneDisplay}
            </a>
            <p className="label mt-1">{CARD.location}</p>
          </div>

          {/* Nav */}
          <nav aria-label="Footer" className="flex flex-col gap-2">
            <p className="eyebrow mb-1">Explore</p>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="label text-ink transition-colors hover:text-accent">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Socials */}
          <div className="flex flex-col gap-2">
            <p className="eyebrow mb-1">Follow</p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="label text-ink transition-colors hover:text-accent"
            >
              Instagram
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="label text-ink transition-colors hover:text-accent"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule py-6">
          <Link href="/" className="link-underline font-sans text-sm">
            Joshua Isaiah
          </Link>
          <p className="label numeral">© Joshua Isaiah</p>
        </div>
      </div>
    </footer>
  );
}
