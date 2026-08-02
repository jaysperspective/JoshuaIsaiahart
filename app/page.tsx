import Link from "next/link";
import Image from "next/image";

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

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-paper text-ink">
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] lg:grid-cols-[1.5fr_1fr]">
        {/* Left — decorative circle + hero text */}
        <div className="flex min-h-screen items-center justify-center gap-8 px-6 py-12 sm:px-10 lg:gap-14">
          <Link
            href="/Uraenis"
            aria-label="Uraenis"
            className="hidden aspect-square w-[clamp(160px,16vw,300px)] shrink-0 rounded-full bg-vigne transition-transform duration-300 hover:scale-[1.04] lg:block"
          />

          <div className="max-w-[38rem]">
            <p className="eyebrow mb-5">Creative Director · Photographer · Filmmaker</p>
            <h1 className="display">
              Joshua
              <br />
              <span className="italic font-light">Isaiah</span>
            </h1>
            <p className="prose-serif mt-6 max-w-md">
              A polymath working across creative mediums — collecting tools, perspectives,
              and languages in search of the most honest way to be of service.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <Link href="/work" className="btn btn-accent">
                View Work
                <ArrowIcon className="-mr-1" />
              </Link>
              <Link href="/rate-sheet" className="btn">
                Rate Sheet
              </Link>
              <Link href="/work?tab=videography" className="btn">
                Feature Film
              </Link>
              <Link href="/work?tab=photography" className="btn">
                Editorial
              </Link>
            </div>
          </div>
        </div>

        {/* Right — cut-out portrait, anchored to the bottom edge */}
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
    </main>
  );
}
