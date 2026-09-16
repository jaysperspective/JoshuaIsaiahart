import Link from "next/link";
import PrintButton from "./PrintButton";

export const metadata = {
  title: "Curriculum Vitae",
  description:
    "The record — Joshua Isaiah Harrington. Two-time Emmy-winning audiovisual production specialist: a decade in Washington, DC broadcast newsrooms, now photographing and filming for clients.",
  alternates: { canonical: "/cv" },
};

const EXPERIENCE = [
  {
    years: "2021 —",
    org: "FOX 5 DC (WTTG)",
    location: "Washington, DC",
    role: "Photojournalist · Audiovisual Production Specialist",
    notes: [
      "Full production cycles for broadcast and digital — concept through final delivery.",
      "On-location shoots with multi-camera setups, lighting rigs, and live broadcast integrations.",
      "AI-assisted workflows for audio cleanup, captioning, and transcript-based editing.",
    ],
  },
  {
    years: "2016 — 21",
    org: "WJLA-TV (ABC7)",
    location: "Washington, DC",
    role: "Photojournalist · Audiovisual Production Specialist",
    notes: [
      "Breaking news, investigative stories, and long-form segments.",
      "Contributed to Emmy Award–winning coverage through narrative development and technical execution.",
    ],
  },
  {
    years: "2015 — 16",
    org: "WCNC-TV (NBC Charlotte)",
    location: "Charlotte, NC",
    role: "Photojournalist · Video Producer",
    notes: [
      "Daily broadcast and digital field production, interviews, and post-production delivery.",
    ],
  },
  {
    years: "2013 — 15",
    org: "WTKR-TV (CBS 3)",
    location: "Norfolk, VA",
    role: "Photojournalist",
    notes: [
      "Foundational broadcast craft — field production, editing, audio design, newsroom collaboration.",
    ],
  },
  {
    years: "2023 —",
    org: "Asun Media — Independent",
    location: "Alexandria, VA",
    role: "Multimedia Producer · Developer",
    notes: [
      "Video, podcast, and multimedia for clients — event coverage, artist biography films, educational media.",
      "AI-integrated production pipeline: audio enhancement, generative visuals, workflow automation.",
    ],
  },
];

const HONORS = [
  { label: "Emmy Award", note: "2× winner — outstanding contribution to broadcast journalism and video production" },
  { label: "NABJ Honors Award", note: "National Association of Black Journalists" },
  { label: "FAA Part 107", note: "Certified remote pilot — licensed drone operations" },
];

const COMPETENCIES = [
  "End-to-end audiovisual production",
  "Adobe Premiere Pro — advanced color, audio & motion",
  "Multi-camera & live broadcast production",
  "Lighting, camera operation & sound design",
  "AI-assisted editing, transcription & visual generation",
  "Vendor coordination, scheduling & budgets",
];

export default function CV() {
  return (
    <main className="min-h-screen bg-paper text-ink print:bg-white">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 lg:px-12">

        {/* Masthead */}
        <header className="flex items-center justify-between pt-10 sm:pt-14 print:hidden">
          <Link href="/about" className="eyebrow transition-colors hover:text-accent">
            ← About
          </Link>
          <span className="label numeral">Curriculum Vitae — 2026</span>
        </header>
        <hr className="rule mt-5 print:hidden" />

        {/* Title block */}
        <section className="pt-12 sm:pt-16 print:pt-4">
          <p className="eyebrow mb-5">Joshua Isaiah Harrington · Alexandria, Virginia</p>
          <h1 className="display max-w-3xl">
            The <span className="italic font-light">Record</span>
          </h1>
          <p className="prose-serif mt-6 max-w-2xl">
            Ten-plus years designing, producing, and delivering stories across broadcast,
            live, and on-location environments — from Washington&apos;s daily news to
            films, portraits, and events made for clients.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 print:hidden">
            <PrintButton />
            <Link href="/work" className="btn">View Work</Link>
            <Link href="/work#book" className="btn btn-accent">Book a Session</Link>
          </div>
        </section>

        {/* Experience */}
        <section className="mt-16 sm:mt-20">
          <div className="mb-8 flex items-baseline gap-5">
            <span className="label numeral text-muted">01</span>
            <h2 className="headline">Experience</h2>
          </div>
          <div>
            {EXPERIENCE.map((job, i) => (
              <article key={i} className="grid gap-2 border-t border-rule py-7 md:grid-cols-12 md:gap-6">
                <div className="md:col-span-3">
                  <p className="label numeral">{job.years}</p>
                  <p className="label mt-1 normal-case tracking-normal">{job.location}</p>
                </div>
                <div className="md:col-span-9">
                  <h3 className="font-display text-xl font-medium text-emerald">{job.org}</h3>
                  <p className="eyebrow mt-1 text-[0.65rem]">{job.role}</p>
                  <ul className="mt-3 space-y-1.5">
                    {job.notes.map((note, ni) => (
                      <li key={ni} className="font-sans text-sm leading-relaxed text-ink-soft">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Honors */}
        <section className="mt-14 sm:mt-16">
          <div className="mb-8 flex items-baseline gap-5">
            <span className="label numeral text-muted">02</span>
            <h2 className="headline">Honors &amp; Certifications</h2>
          </div>
          <div>
            {HONORS.map((h, i) => (
              <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-rule-soft py-4">
                <span className="font-display text-lg font-medium text-emerald">{h.label}</span>
                <span className="font-sans text-sm text-ink-soft">{h.note}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Competencies + Education */}
        <section className="mt-14 grid gap-12 sm:mt-16 md:grid-cols-2">
          <div>
            <div className="mb-6 flex items-baseline gap-5">
              <span className="label numeral text-muted">03</span>
              <h2 className="headline text-[1.5rem]">Competencies</h2>
            </div>
            <ul className="space-y-2">
              {COMPETENCIES.map((c, i) => (
                <li key={i} className="border-t border-rule-soft py-2.5 font-sans text-sm text-ink-soft">
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-6 flex items-baseline gap-5">
              <span className="label numeral text-muted">04</span>
              <h2 className="headline text-[1.5rem]">Education</h2>
            </div>
            <div className="border-t border-rule-soft py-2.5">
              <p className="font-display text-lg font-medium text-emerald">Norfolk State University</p>
              <p className="font-sans text-sm text-ink-soft mt-1">Bachelor of Science — 2013 · Norfolk, VA</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 sm:mt-24 print:mt-10">
          <hr className="rule" />
          <div className="flex flex-wrap items-center justify-between gap-4 py-10 print:py-4">
            <Link href="/about" className="link-underline font-sans text-sm print:hidden">← About</Link>
            <p className="label numeral">joshualharrington@gmail.com · (434) 489-3932</p>
          </div>
        </footer>

      </div>
    </main>
  );
}
