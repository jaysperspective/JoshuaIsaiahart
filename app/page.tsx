import MediumCard from "./components/MediumCard";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Hero */}
      <section className="mb-8 sm:mb-10">
        <MediumCard
          accent="var(--accent-about)"
          href="/about"
          image="/homeimage.jpg"
          imageAlt="Joshua Isaiah"
          imagePosition="right"
          imagePriority
          eyebrow="Joshua Isaiah"
          title="Creative director · photographer · filmmaker"
          body={
            <p>
              A polymath moving between photography, video, and design — searching for the most honest way to be of service.
            </p>
          }
          cta="Read about"
          size="large"
        />
      </section>

      {/* Secondary cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <MediumCard
          accent="var(--accent-photography)"
          href="/work?tab=photography"
          image="/atriptosalvadorbahia.JPG"
          imageAlt="Photography"
          eyebrow="Photography"
          title="Galleries"
          body={<p>Photojournalism, street, and portrait work.</p>}
          cta="View galleries"
        />

        <MediumCard
          accent="var(--accent-videography)"
          href="/work?tab=videography"
          image="/paulamanscover.jpg"
          imageAlt="Videography"
          eyebrow="Videography"
          title="Films & projects"
          body={<p>Short films, documentary, music, and brand work.</p>}
          cta="Watch reel"
        />

        <MediumCard
          accent="var(--accent-external)"
          href="https://airofuranus.com"
          external
          image="/themindofanartist.png"
          imageAlt="URA — Air of Uranus"
          eyebrow="URA"
          title="A seasonal orientation system"
          body={<p>Knowing where you are changes how you move.</p>}
          cta="Visit airofuranus.com"
        />
      </section>
    </div>
  );
}
