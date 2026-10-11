import Link from "next/link";
import SubmitForm from "./SubmitForm";
import { prisma } from "@/app/lib/prisma";

// Approved reviews are read via ISR (hourly) so the page is edge-cacheable.
export const revalidate = 3600;

async function getApprovedTestimonials() {
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

export const metadata = {
  title: "Testimonial",
  description: "Share your story — a few words about working with Joshua.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Testimonial",
    description: "Share your story — a few words about working with Joshua.",
    url: "https://joshuaisaiah.art/testimonial",
    siteName: "Joshua Isaiah",
    images: [{ url: "/og-testimonial.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Testimonial",
    description: "Share your story — a few words about working with Joshua.",
    images: ["/og-testimonial.jpg"],
  },
};

export default async function TestimonialPage() {
  const testimonials = await getApprovedTestimonials();
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-2xl px-5 sm:px-8">
        {/* Masthead */}
        <header className="flex items-center justify-between pt-10 sm:pt-14">
          <Link href="/" className="eyebrow transition-colors hover:text-accent">
            ← Joshua Isaiah
          </Link>
          <span className="label numeral">Client Stories</span>
        </header>
        <hr className="rule mt-5" />

        {/* Social proof first — approved reviews */}
        {testimonials.length > 0 && (
          <section id="reviews" className="scroll-mt-10 pt-20 pb-4 sm:pt-28">
            <h2 className="display mb-12 text-center text-[clamp(1.9rem,5.5vw,3rem)]">
              Kind <span className="italic font-light">words</span>
            </h2>
            <div className="space-y-10">
              {testimonials.map((t) => (
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
          </section>
        )}

        {/* Invitation + submission form */}
        <section className="pt-16">
          <hr className="rule" />
          <div className="pt-12 pb-10 text-center">
            <p className="eyebrow mb-5">In Your Words</p>
            <h1 className="display text-[clamp(2.2rem,7vw,4rem)]">
              Share your <span className="italic font-light">story</span>
            </h1>
            <p className="prose-serif mx-auto mt-6 max-w-lg">
              If we&apos;ve worked together, a few honest sentences about the
              experience helps others know what to expect. Joshua reads and
              approves every story before it goes on the site.
            </p>
          </div>
          <SubmitForm />
        </section>

        {/* Footer */}
        <footer className="mt-16 pb-16">
          <hr className="rule" />
          <div className="flex flex-wrap items-center justify-between gap-4 pt-8">
            <Link href="/" className="link-underline font-sans text-sm">← Home</Link>
            <p className="label numeral">© Joshua Isaiah</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
