import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/app/lib/prisma";
import KindWords from "./KindWords";
import SiteFooter from "./components/SiteFooter";

// Approved testimonials are surfaced via ISR — the DB is read at most once
// per revalidation window instead of on every visit (lets Cloudflare cache).
export const revalidate = 1800;

interface HomeTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string | null;
}

async function getApprovedTestimonials(): Promise<HomeTestimonial[]> {
  try {
    const rows = await prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((t) => ({
      id: t.id,
      quote: t.quote,
      name: t.name,
      role: t.role ?? null,
    }));
  } catch {
    return [];
  }
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.5 14.5L14.5 5.5M14.5 5.5H7.5M14.5 5.5V12.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function Home() {
  const testimonials = await getApprovedTestimonials();

  // Review structured data (no fabricated star ratings — these aren't
  // collected yet). Lets search engines read the client testimonials.
  const reviewLd =
    testimonials.length > 0
      ? {
          "@context": "https://schema.org",
          "@graph": testimonials.map((t) => ({
            "@type": "Review",
            itemReviewed: { "@id": "https://joshuaisaiah.art/#business" },
            author: { "@type": "Person", name: t.name },
            reviewBody: t.quote,
            ...(t.role ? { name: t.role } : {}),
          })),
        }
      : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper text-ink">
      {reviewLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewLd) }}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] lg:grid-cols-[1.5fr_1fr]">
        {/* Left — decorative circle + hero text */}
        <div className="flex min-h-screen items-center justify-center gap-8 px-6 py-12 sm:px-10 lg:gap-14">
          <Link
            href="/Uraenis"
            aria-label="Uraenis"
            className="hidden aspect-square w-[clamp(160px,16vw,300px)] shrink-0 rounded-full bg-vigne transition-transform duration-300 hover:scale-[1.04] lg:block"
          />

          <div className="max-w-[38rem]">
            {/* Mobile-only portrait — the brand moment phones would otherwise miss */}
            <Link
              href="/about"
              aria-label="About Joshua Isaiah"
              className="relative mb-8 block h-60 w-full md:hidden"
            >
              <Image
                src="/joshua-home.webp"
                alt="Joshua Isaiah holding a film camera"
                fill
                sizes="100vw"
                className="object-contain object-center"
              />
            </Link>

            <p className="eyebrow mb-5">Creative Director · Photographer · Filmmaker</p>
            <h1 className="display">
              Joshua
              <br />
              <span className="italic font-light">Isaiah</span>
            </h1>
            <p className="prose-serif mt-6 max-w-md">
              Award-winning craft, built over a decade in broadcast — photographs
              and films made with the discipline of a newsroom and the care of
              someone who believes every story deserves to be told honestly.
            </p>

            {/* Substantiate the "award-winning" claim */}
            <Link
              href="/cv"
              className="label link-underline mt-4 inline-block"
            >
              2× Emmy Award winner · NABJ Honors
            </Link>

            {/* Primary actions — lead with the hire path */}
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <Link href="/work#book" className="btn btn-accent">
                Book a Session
                <ArrowIcon className="-mr-1" />
              </Link>
              <Link href="/work" className="btn">
                View Work
              </Link>
            </div>
            {/* Secondary links — subordinate to the primary CTAs */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/rate-sheet" className="label link-underline">
                Rate Sheet
              </Link>
              <Link href="/shop" className="label link-underline">
                Shop Images
              </Link>
              <Link href="/about" className="label link-underline">
                About
              </Link>
              <Link href="/testimonial#reviews" className="label link-underline">
                Reviews
              </Link>
            </div>

            {/* Approved client reviews — rotating */}
            <KindWords testimonials={testimonials} />
          </div>
        </div>

        {/* Right — cut-out portrait, anchored to the bottom edge (md+) */}
        <Link
          href="/about"
          aria-label="About Joshua Isaiah"
          className="group relative hidden md:block cursor-pointer"
        >
          <Image
            src="/joshua-home.webp"
            alt="Joshua Isaiah holding a film camera"
            fill
            priority
            sizes="(max-width: 1024px) 42vw, 40vw"
            className="object-contain object-bottom transition-opacity duration-200 group-hover:opacity-90"
          />
          {/* Hover outline */}
          <span className="pointer-events-none absolute inset-0 border-2 border-transparent transition-colors duration-200 group-hover:border-emerald" />
          {/* Hover label */}
          <span className="pointer-events-none absolute top-8 right-6 eyebrow opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            About ↗
          </span>
        </Link>
      </div>

      <SiteFooter />
    </main>
  );
}
