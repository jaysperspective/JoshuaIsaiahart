import Link from "next/link";

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 14.5L14.5 5.5M14.5 5.5H7.5M14.5 5.5V12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center p-8">
      <div className="home-stack">
        {/* Personal Card */}
        <Link href="/about" className="card card-white card-personal">
          <div className="card-personal__content justify-center">
            <div className="card-personal__top">
              <h1 className="font-heading card-title">Joshua Isaiah</h1>
              <p className="font-heading card-role">Creative Director</p>
            </div>
          </div>

          <div className="card-personal__image">
            <img
              src="/homeimage.jpg"
              alt="Joshua Isaiah at work"
              className="card-image"
            />
          </div>

          <ArrowIcon className="card-arrow" />
        </Link>

        {/* Business Card */}
        <Link href="/work" className="card card-gray card-business">
          <div className="card-business__inner">
            <h2 className="font-heading card-title">Asun Media</h2>
            <p className="font-body card-subtitle">
              Photography • Videography • Design
            </p>
          </div>

          <ArrowIcon className="card-arrow" />
        </Link>
      </div>
    </div>
  );
}
