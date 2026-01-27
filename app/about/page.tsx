import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-[#181818] px-6 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white font-body text-sm transition-colors mb-12"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Main content card */}
        <div className="card card-white p-8 md:p-12">
          {/* Two-column layout: image left, text right on desktop; stacked on mobile */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-14">
            {/* Image */}
            <div className="flex-shrink-0 md:w-[280px]">
              <img
                src="/bioimage.png"
                alt="Joshua Isaiah"
                className="w-full h-auto rounded-2xl border border-gray-200/60"
              />
            </div>

            {/* Bio text - artist statement styling */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="max-w-prose space-y-6">
                <p className="font-body text-[#1a1a1a] text-base md:text-lg leading-relaxed md:leading-loose">
                  I see myself as a polymath—multifaceted, curious, and fluent across disciplines. I've always been quick to learn, and that instinct has carried me far. I've also been wary of being boxed in, even in a world that rewards single-lane expertise with stability. What draws me instead is the journey: learning something new, absorbing it, and synthesizing it into my own framework so it has meaning.
                </p>

                <p className="font-body text-[#1a1a1a] text-base md:text-lg leading-relaxed md:leading-loose">
                  I'm a photojournalist, a filmmaker, a street photographer. A graphic designer, creative director, and brand builder. An artist, a writer, an event curator. I understand code, AI, and financial markets. I move through this multiverse collecting tools, perspectives, and languages—ultimately searching for the most honest way to be of service.
                </p>

                {/* Subtle link to work */}
                <div className="pt-4">
                  <Link
                    href="/work"
                    className="inline-flex items-center gap-2 text-[#6b6b6b] hover:text-[#1a1a1a] font-body text-sm transition-colors"
                  >
                    View Work
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
