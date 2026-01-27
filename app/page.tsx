import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center p-8">
      <div className="home-stack">
        {/* Personal Card */}
        <Link href="/about" className="card card-white card-personal">
          <div className="card-personal__content">
            <div className="card-personal__top">
              <h1 className="font-heading card-title">Joshua Isaiah</h1>
              <p className="font-heading card-role">Creative Director</p>
            </div>

            <div className="font-body card-contact">
              <p>JoshuaLHarrington@gmail.com</p>
              <p>+1 (434) 489-3932</p>
              <p>joshuaisaiah.art</p>
            </div>
          </div>

          <div className="card-personal__image">
            <img
              src="/homeimage.jpg"
              alt="Joshua Isaiah at work"
              className="card-image"
            />
          </div>
        </Link>

        {/* Business Card */}
        <Link href="/work" className="card card-gray card-business">
          <div className="card-business__inner">
            <h2 className="font-heading card-title">Asun Media</h2>
            <p className="font-body card-subtitle">
              Photography • Videography • Design
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
