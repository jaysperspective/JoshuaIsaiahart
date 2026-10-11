import Link from "next/link";

export const metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about booking Joshua Isaiah — areas served across the DMV, how booking works, rates, turnaround, deliverables, and fine-art prints.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ — Joshua Isaiah",
    description:
      "How booking works, rates, turnaround, deliverables, and prints — answers before you book Joshua Isaiah, photographer & filmmaker in the DMV.",
    url: "https://joshuaisaiah.art/faq",
    siteName: "Joshua Isaiah",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Joshua Isaiah",
    description:
      "How booking works, rates, turnaround, deliverables, and prints — before you book Joshua Isaiah.",
    images: ["/og-image.jpg"],
  },
};

// Answers are derived strictly from site content (rate sheet, booking flow,
// shop, contact). The JSON-LD below reuses the same `a` strings so the
// structured data matches what's on the page.
interface FaqItem {
  q: string;
  a: string;
  link?: { href: string; label: string };
}

const FAQS: FaqItem[] = [
  {
    q: "Where are you based, and what areas do you serve?",
    a: "I'm based in the Washington, DC metro area and available for hire across DC, Maryland, and Northern Virginia — the DMV. For projects outside the standard scope or region, custom quotes are available.",
    link: { href: "/rate-sheet", label: "See rates & services" },
  },
  {
    q: "How do I book you?",
    a: "Start with Book a Session. It begins with a 30-minute consultation — either a Google Meet video call at a time you pick, or a text follow-up. For video calls, the meeting link is sent before the call, so we can talk through your project before anything is scheduled.",
    link: { href: "/work#book", label: "Book a session" },
  },
  {
    q: "What do sessions cost?",
    a: "Photography and videography start at $350/hour with a two-hour minimum, a half-day (up to 4 hours) at $1,200, and a full day (up to 8 hours) at $2,200. Event coverage, add-ons, and editing are priced separately, and custom quotes are available for projects outside the standard scope.",
    link: { href: "/rate-sheet", label: "See the full rate sheet" },
  },
  {
    q: "How soon will I get my photos or video?",
    a: "Turnaround depends on the project. A same-day social-media gallery of 25 curated images is available as an add-on, networking and social recaps are delivered in about five days, and same-week turnaround can be added to event videography. Event footage is delivered as organized, labeled raw files via a shared drive.",
  },
  {
    q: "What's included, and what are the add-ons?",
    a: "Packages include up to three hours of standard editing; additional editing is $125/hour. Common add-ons include a second shooter, a same-day social-media gallery, an edited highlight reel, and same-week turnaround.",
    link: { href: "/rate-sheet", label: "See rates & services" },
  },
  {
    q: "Do you sell prints?",
    a: "Yes. The Print Shop offers a selection of images as archival fine-art prints, each printed to order — select a piece to see its size, paper, and details. Checkout is secure and shipping is free; you'll enter your shipping address at payment.",
    link: { href: "/shop", label: "Visit the shop" },
  },
  {
    q: "How do I reach you?",
    a: "The fastest way is to Book a Session and start a consultation. You can also email josh@plusntrust.org or call (434) 489-3932.",
    link: { href: "/work#book", label: "Book a session" },
  },
];

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FAQ() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        {/* Masthead */}
        <header className="flex items-center justify-between pt-10 sm:pt-14">
          <Link href="/" className="eyebrow transition-colors hover:text-accent">
            ← Joshua Isaiah
          </Link>
          <span className="label numeral">Good to Know</span>
        </header>
        <hr className="rule mt-5" />

        {/* Title */}
        <section className="pt-12 sm:pt-20">
          <p className="eyebrow mb-6">Before You Book</p>
          <h1 className="display">
            Frequently asked{" "}
            <span className="italic font-light">questions</span>
          </h1>
          <p className="prose-serif mt-6 max-w-2xl">
            The essentials on how I work — where I shoot, what it costs, and
            what you&apos;ll get. Still have a question? Reach out and I&apos;ll
            answer it directly.
          </p>
        </section>

        {/* Questions */}
        <section className="mt-14 sm:mt-20 space-y-12">
          {FAQS.map((f) => (
            <div key={f.q} className="border-t border-rule pt-8">
              <h2 className="headline text-[1.4rem] mb-4">{f.q}</h2>
              <p className="prose-serif max-w-2xl">{f.a}</p>
              {f.link && (
                <Link
                  href={f.link.href}
                  className="label link-underline mt-4 inline-block"
                >
                  {f.link.label} →
                </Link>
              )}
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="mt-20 py-14 border-t border-b border-rule">
          <p className="eyebrow mb-4">Ready when you are</p>
          <h2 className="headline max-w-lg mb-8">
            Let&apos;s talk about your{" "}
            <span className="italic font-light">project</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/work#book" className="btn btn-accent">
              Book a Session
            </Link>
            <Link href="/rate-sheet" className="btn">
              Rate Sheet
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4 py-10">
            <Link href="/" className="link-underline font-sans text-sm">
              ← Home
            </Link>
            <p className="label numeral">josh@plusntrust.org · (434) 489-3932</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
