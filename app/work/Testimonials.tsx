import Reveal from "./Reveal";

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string | null;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

// Managed in /admin under Stories; section hides itself while empty
export default function Testimonials({ testimonials }: TestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="mt-20 border-t border-rule pt-14">
      <Reveal>
        <p className="eyebrow mb-4 text-center">Client Stories</p>
        <h2 className="headline mb-12 text-center">
          In their <span className="italic font-light">words</span>
        </h2>
      </Reveal>

      <div className="space-y-12">
        {testimonials.map((t, i) => (
          <Reveal key={t.id} delay={i * 90}>
            <figure className="mx-auto max-w-2xl text-center">
              <blockquote className="prose-serif text-[1.15rem] italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5">
                <span className="label text-ink">{t.name}</span>
                {t.role && <span className="label block mt-1">{t.role}</span>}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
