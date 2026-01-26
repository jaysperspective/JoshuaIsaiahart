import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6">
      <div className="flex flex-col gap-4 w-full max-w-xl">
        {/* Personal Card */}
        <Link href="/about" className="card card-white p-8 cursor-pointer">
          <h1 className="font-heading text-4xl font-bold tracking-tight mb-1">
            Joshua Isaiah
          </h1>
          <p className="font-heading text-xl text-[#525252] mb-16">
            Creative Director
          </p>

          <div className="font-body text-base space-y-1">
            <p>JoshuaLHarrington@gmail.com</p>
            <p>+1 (434) 489-3932</p>
            <p>joshuaisaiah.art</p>
          </div>
        </Link>

        {/* Business Card */}
        <Link href="/work" className="card card-gray p-8 cursor-pointer flex flex-col items-center justify-center min-h-[200px]">
          <h2 className="font-heading text-4xl font-bold tracking-tight mb-2">
            Asun Media
          </h2>
          <p className="font-body text-lg">
            Photography • Videography • Design
          </p>
        </Link>
      </div>
    </div>
  );
}
