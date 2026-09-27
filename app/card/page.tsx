import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CARD, getSocials, SITE_URL } from "@/app/lib/contact";
import ShareButton from "./ShareButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Digital Card",
  description: `Connect with ${CARD.name} — ${CARD.title}, ${CARD.tagline}. Save contact, view portfolio, and reach out.`,
  alternates: { canonical: "/card" },
  openGraph: {
    title: `${CARD.name} — Digital Card`,
    description: `${CARD.title} · ${CARD.tagline} — Washington, DC metro.`,
    url: `${SITE_URL}/card`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

// ---- Icons (24×24, currentColor) --------------------------------------------
function PortfolioIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}
function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function EmailIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}
function TextIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 0 1 4 11.5 8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
    </svg>
  );
}
function SaveContactIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19a6 6 0 0 0-12 0M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6" />
    </svg>
  );
}
function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
    </svg>
  );
}

interface LinkRow {
  label: string;
  sub: string;
  href: string;
  external?: boolean;
  icon: React.ReactNode;
}

export default async function CardPage() {
  const socials = await getSocials();

  const rows: LinkRow[] = [
    {
      label: "View portfolio",
      sub: "Photography, film & social work",
      href: "/",
      icon: <PortfolioIcon className="h-5 w-5" />,
    },
    {
      label: "Email me",
      sub: CARD.email,
      href: `mailto:${CARD.email}`,
      external: true,
      icon: <EmailIcon className="h-5 w-5" />,
    },
    {
      label: "Text me",
      sub: CARD.phoneDisplay,
      href: `sms:${CARD.phone}`,
      external: true,
      icon: <TextIcon className="h-5 w-5" />,
    },
  ];

  if (socials.instagram) {
    rows.push({
      label: "Instagram",
      sub: "Follow the latest work",
      href: socials.instagram,
      external: true,
      icon: <InstagramIcon className="h-5 w-5" />,
    });
  }
  if (socials.linkedin) {
    rows.push({
      label: "LinkedIn",
      sub: "Connect professionally",
      href: socials.linkedin,
      external: true,
      icon: <LinkedInIcon className="h-5 w-5" />,
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-paper px-5 py-12 text-ink sm:py-16">
      <div className="w-full max-w-md">
        {/* Identity */}
        <header className="flex flex-col items-center text-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full ring-1 ring-rule">
            <Image
              src="/joshua-home.webp"
              alt={CARD.name}
              fill
              sizes="112px"
              className="object-cover"
              priority
            />
          </div>
          <h1 className="headline mt-6">{CARD.name}</h1>
          <p className="eyebrow mt-3">{CARD.title}</p>
          <p className="label normal-case tracking-normal mt-1.5 text-muted">{CARD.tagline}</p>
          <p className="label normal-case tracking-normal mt-3 text-muted">{CARD.location}</p>
        </header>

        {/* Primary CTA — save contact (vCard) */}
        <a
          href="/api/vcard"
          download="joshua-isaiah.vcf"
          className="btn btn-accent mt-8 w-full justify-center"
        >
          <SaveContactIcon className="h-4 w-4" />
          Save my contact
        </a>

        {/* Action rows */}
        <nav className="mt-4 space-y-2.5">
          {rows.map((row) => {
            const inner = (
              <>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-2 text-emerald transition-colors group-hover:bg-emerald group-hover:text-paper">
                  {row.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-medium text-ink">{row.label}</span>
                  <span className="block truncate font-sans text-xs text-muted">{row.sub}</span>
                </span>
                <ChevronIcon className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              </>
            );
            const cls =
              "surface surface-hover group flex items-center gap-4 px-4 py-3.5 no-underline";
            return row.external ? (
              <a
                key={row.label}
                href={row.href}
                target={row.href.startsWith("http") ? "_blank" : undefined}
                rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={cls}
              >
                {inner}
              </a>
            ) : (
              <Link key={row.label} href={row.href} className={cls}>
                {inner}
              </Link>
            );
          })}
        </nav>

        {/* Book + share */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link href="/work#book" className="btn w-full justify-center">
            Book a session
          </Link>
          <ShareButton url={`${SITE_URL}/card`} title={`${CARD.name} — ${CARD.title}`} />
        </div>

        <p className="label mt-10 text-center text-[0.6rem] text-muted">
          <Link href="/card/qr" className="link-underline">
            Show my QR code
          </Link>
        </p>
      </div>
    </main>
  );
}
