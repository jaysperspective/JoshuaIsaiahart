import Link from "next/link";

export default function Work() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6">
        <Link href="/">
          <h1 className="text-2xl tracking-[0.3em] font-normal" style={{ fontFamily: 'var(--font-bebas-neue)' }}>
            JOSHUA HARRINGTON
          </h1>
        </Link>
        <nav className="flex gap-8 text-xl tracking-[0.2em]" style={{ fontFamily: 'var(--font-bebas-neue)' }}>
          <Link href="/about" className="hover:opacity-70 transition-opacity">ABOUT</Link>
          <Link href="/work" className="hover:opacity-70 transition-opacity">WORK</Link>
          <Link href="/menu" className="hover:opacity-70 transition-opacity">MENU</Link>
        </nav>
      </header>

      {/* Content */}
      <main className="px-8 py-16">
        <h2 className="text-6xl tracking-[0.1em] mb-8" style={{ fontFamily: 'var(--font-bebas-neue)' }}>
          WORK
        </h2>
        <p className="text-xl max-w-2xl" style={{ fontFamily: 'var(--font-bebas-neue)' }}>
          Coming soon...
        </p>
      </main>
    </div>
  );
}
