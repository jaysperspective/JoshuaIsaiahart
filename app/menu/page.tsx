import Link from "next/link";

export default function Menu() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Masthead */}
        <header className="flex items-center justify-between pt-10 sm:pt-14">
          <Link href="/" className="eyebrow transition-colors hover:text-accent">
            ← Joshua Isaiah
          </Link>
          <nav className="flex gap-6">
            <Link href="/about" className="label transition-colors hover:text-accent">About</Link>
            <Link href="/work" className="label transition-colors hover:text-accent">Work</Link>
          </nav>
        </header>
        <hr className="rule mt-5" />

        {/* Content */}
        <section className="flex min-h-[60vh] flex-col justify-center">
          <p className="eyebrow mb-5">Menu</p>
          <h1 className="display">Coming soon</h1>
        </section>
      </div>
    </main>
  );
}
