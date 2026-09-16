import Reveal from "./Reveal";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

// Add real client quotes here — the section stays hidden while this is empty.
// Example shape:
//   {
//     quote: "Joshua captured our event exactly how it felt in the room.",
//     name: "Jane Doe",
//     role: "Event Director, Example Org",
//   },
const TESTIMONIALS: Testimonial[] = [];

export default function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="mt-20 border-t border-rule pt-14">
      <Reveal>
        <p className="eyebrow mb-4 text-center">Client Stories</p>
        <h2 className="headline mb-12 text-center">
          In their <span className="italic font-light">words</span>
        </h2>
      </Reveal>

      <div className="space-y-12">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={i} delay={i * 90}>
            <figure className="mx-auto max-w-2xl text-center">
              <blockquote className="prose-serif text-[1.15rem] italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5">
                <span className="label text-ink">{t.name}</span>
                <span className="label block mt-1">{t.role}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
