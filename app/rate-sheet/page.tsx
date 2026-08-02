import Link from "next/link";

const SECTIONS = [
  {
    title: "Videography Services",
    number: "01",
    groups: [
      {
        heading: "Hourly / Day Rates",
        items: [
          { label: "Hourly", note: "2-hour minimum", price: "$250 / hr" },
          { label: "Half-Day", note: "up to 4 hours", price: "$850" },
          { label: "Full Day", note: "up to 8 hours", price: "$1,500" },
          { label: "Extended Day", note: "8–12 hours", price: "$1,800" },
        ],
      },
      {
        heading: "Event Videography",
        subheading: "Delivers organized raw footage via shared drive — shoot, label, hand off.",
        items: [
          { label: "Conference / Corporate Event", note: "4 hrs", price: "$1,200" },
          { label: "Conference / Corporate Event", note: "full day", price: "$2,000" },
          { label: "Highlight Reel", note: "2–3 min., edited — add-on", price: "$500" },
          { label: "Same-Week Turnaround", note: "", price: "+$300" },
        ],
      },
      {
        heading: "Networking / Social Event",
        items: [
          {
            label: "Quick Recap",
            note: "2–3 hrs on-site · 60–90 sec edited recap · 5-day delivery",
            price: "$600",
          },
        ],
      },
      {
        heading: "Post-Production / Editing",
        items: [
          { label: "Standard Edit", note: "3 hrs included with packages", price: "Included" },
          { label: "Additional Editing", note: "", price: "$125 / hr" },
        ],
      },
    ],
  },
  {
    title: "Photography Services",
    number: "02",
    groups: [
      {
        heading: "Day Rates",
        items: [
          { label: "Hourly", note: "2-hour minimum", price: "$350 / hr" },
          { label: "Half-Day", note: "up to 4 hours", price: "$1,200" },
          { label: "Full Day", note: "up to 8 hours", price: "$2,200" },
          {
            label: "Same-Day Social Media Gallery",
            note: "25 curated images — add-on",
            price: "$300",
          },
        ],
      },
    ],
  },
  {
    title: "Add-Ons",
    number: "03",
    groups: [
      {
        heading: "",
        items: [{ label: "Second Shooter", note: "", price: "+$400" }],
      },
    ],
  },
];

export default function RateSheet() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="w-full max-w-4xl mx-auto px-5 sm:px-8 lg:px-12">

        {/* Masthead */}
        <header className="flex items-center justify-between pt-10 sm:pt-14">
          <Link href="/" className="eyebrow transition-colors hover:text-accent">
            ← Joshua Isaiah
          </Link>
          <span className="label numeral">Rate Sheet — 2026</span>
        </header>
        <hr className="rule mt-5" />

        {/* Title block */}
        <section className="pt-12 sm:pt-20">
          <p className="eyebrow mb-6">Media Professional · Washington, DC Metro Area</p>
          <h1 className="display max-w-3xl">
            Rates &amp; <span className="italic font-light">Services</span>
          </h1>
          <p className="prose-serif mt-6 max-w-2xl">
            Custom quotes available for projects outside standard scope.
            All rates subject to project requirements.
          </p>
        </section>

        {/* Rate sections */}
        <div className="mt-16 sm:mt-24 space-y-20">
          {SECTIONS.map((section) => (
            <section key={section.number}>
              {/* Section header bar */}
              <div className="flex items-baseline gap-5 mb-8">
                <span className="label numeral text-muted">{section.number}</span>
                <h2 className="headline">{section.title}</h2>
              </div>

              <div className="space-y-10">
                {section.groups.map((group, gi) => (
                  <div key={gi}>
                    {group.heading && (
                      <div className="mb-1 pb-2 border-b border-rule">
                        <p className="eyebrow">{group.heading}</p>
                        {group.subheading && (
                          <p className="label mt-1 normal-case tracking-normal text-muted font-normal text-[0.78rem]">
                            {group.subheading}
                          </p>
                        )}
                      </div>
                    )}
                    <div>
                      {group.items.map((item, ii) => (
                        <div
                          key={ii}
                          className="flex items-baseline justify-between gap-4 py-3.5 border-b border-rule-soft"
                        >
                          <div>
                            <span className="font-sans text-sm text-ink">{item.label}</span>
                            {item.note && (
                              <span className="font-sans text-xs text-muted ml-2">
                                — {item.note}
                              </span>
                            )}
                          </div>
                          <span className="font-sans text-sm font-semibold text-ink numeral shrink-0">
                            {item.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <section className="mt-20 sm:mt-28 py-14 border-t border-b border-rule">
          <p className="eyebrow mb-4">Ready to book?</p>
          <h2 className="headline max-w-lg mb-8">
            Let&apos;s talk about your <span className="italic font-light">project</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/work?tab=contact" className="btn btn-accent">
              Get in Touch
            </Link>
            <Link href="/work" className="btn">
              View Work
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4 py-10">
            <Link href="/" className="link-underline font-sans text-sm">← Home</Link>
            <p className="label numeral">joshualharrington@gmail.com · (434) 489-3932</p>
          </div>
        </footer>

      </div>
    </main>
  );
}
