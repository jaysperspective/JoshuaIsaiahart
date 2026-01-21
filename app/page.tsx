import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-12 py-6">
        <h1 className="text-2xl tracking-[0.3em] font-normal" style={{ fontFamily: 'var(--font-bebas-neue)' }}>
          JOSHUA HARRINGTON
        </h1>
        <nav className="flex gap-10 text-xl tracking-[0.2em]" style={{ fontFamily: 'var(--font-bebas-neue)' }}>
          <Link href="/about" className="hover:opacity-70 transition-opacity">ABOUT</Link>
          <Link href="/work" className="hover:opacity-70 transition-opacity">WORK</Link>
          <Link href="/menu" className="hover:opacity-70 transition-opacity">MENU</Link>
        </nav>
      </header>

      {/* Main Content - Using the homepage image */}
      <main className="flex-1 relative w-full">
        <div className="relative w-full" style={{ maxWidth: '1920px', margin: '0 auto' }}>
          <Image
            src="/homepageJoshuaIsaiahArt.jpg"
            alt="Joshua Harrington Portfolio"
            width={1920}
            height={1080}
            className="w-full h-auto"
            priority
          />

          {/* Clickable overlay areas - positioned over the image */}
          {/* These are invisible links that sit on top of different sections */}

          {/* Salvador Bahia area */}
          <Link
            href="/work/salvador-bahia"
            className="absolute hover:bg-white/10 transition-colors"
            style={{ left: '1.5%', top: '5%', width: '18%', height: '55%' }}
          />

          {/* Sketch / By Hand area */}
          <Link
            href="/work/sketches"
            className="absolute hover:bg-white/10 transition-colors"
            style={{ left: '20%', top: '8%', width: '10%', height: '30%' }}
          />

          {/* Modern Art Museum area */}
          <Link
            href="/work/modern-art-museum"
            className="absolute hover:bg-white/10 transition-colors"
            style={{ left: '32%', top: '3%', width: '15%', height: '30%' }}
          />

          {/* Melan main photo area */}
          <Link
            href="/work/melan-soulflower"
            className="absolute hover:bg-white/10 transition-colors"
            style={{ right: '8%', top: '3%', width: '28%', height: '65%' }}
          />

          {/* Emmy section area */}
          <Link
            href="/about"
            className="absolute hover:bg-white/10 transition-colors"
            style={{ left: '0%', top: '62%', width: '16%', height: '35%' }}
          />

          {/* Paula Mans / Film area */}
          <Link
            href="/work/paula-mans"
            className="absolute hover:bg-white/10 transition-colors"
            style={{ left: '30%', top: '52%', width: '22%', height: '45%' }}
          />

          {/* Melan secondary photo area */}
          <Link
            href="/work/melan-soulflower"
            className="absolute hover:bg-white/10 transition-colors"
            style={{ right: '0%', top: '52%', width: '15%', height: '45%' }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-12 py-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <p className="text-sm tracking-[0.1em]" style={{ fontFamily: 'var(--font-bebas-neue)' }}>
            © 2024 JOSHUA HARRINGTON. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-sm tracking-[0.1em]" style={{ fontFamily: 'var(--font-bebas-neue)' }}>
            <a href="#" className="hover:opacity-70 transition-opacity">INSTAGRAM</a>
            <a href="#" className="hover:opacity-70 transition-opacity">LINKEDIN</a>
            <a href="#" className="hover:opacity-70 transition-opacity">EMAIL</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
