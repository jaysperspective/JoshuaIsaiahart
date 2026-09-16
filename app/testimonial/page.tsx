import Link from "next/link";
import SubmitForm from "./SubmitForm";

export const metadata = {
  title: "Share Your Story",
  description: "Worked with Joshua? Share your experience in your own words.",
  robots: { index: false, follow: false },
};

export default function TestimonialPage() {
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

        {/* Title */}
        <section className="pt-12 pb-10 text-center sm:pt-16">
          <p className="eyebrow mb-5">In Your Words</p>
          <h1 className="display text-[clamp(2.2rem,7vw,4rem)]">
            Share your <span className="italic font-light">story</span>
          </h1>
          <p className="prose-serif mx-auto mt-6 max-w-lg">
            If we&apos;ve worked together, a few honest sentences about the
            experience helps others know what to expect. Joshua reads and
            approves every story before it goes on the site.
          </p>
        </section>

        <SubmitForm />

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
