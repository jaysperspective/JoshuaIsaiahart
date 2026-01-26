import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center p-8">
      <div className="flex flex-col gap-4 w-full max-w-xl">
        {/* Personal Card */}
        <Link href="/about" className="card card-white p-10 cursor-pointer block">
          <h1 className="font-heading text-4xl font-bold tracking-tight mb-2">
            Joshua Isaiah
          </h1>
          <p className="font-heading text-xl text-[#6b6b6b] mb-20">
            Creative Director
          </p>

          <div className="font-body text-base text-[#5f6b7a] space-y-1">
            <p>JoshuaLHarrington@gmail.com</p>
            <p>+1 (434) 489-3932</p>
            <p>joshuaisaiah.art</p>
          </div>
        </Link>

        {/* Business Card */}
        <Link href="/work" className="card card-gray p-10 cursor-pointer flex flex-col items-center justify-center min-h-[240px]">
          <h2 className="font-heading text-4xl font-bold tracking-tight mb-2">
            Asun Media
          </h2>
          <p className="font-body text-lg text-[#2f2f2f]">
            Photography • Videography • Design
          </p>
        </Link>
      </div>
    </div>
  );
}
