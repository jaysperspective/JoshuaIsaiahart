import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

// Social icons
function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface Blog {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Settings {
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
}

async function getBlogs(): Promise<Blog[]> {
  try {
    const blogs = await (prisma as any).blog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return blogs.map((blog: any) => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      createdAt: blog.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

async function getSettings(): Promise<Settings> {
  try {
    const settings = await (prisma as any).settings.findFirst();
    return {
      instagramUrl: settings?.instagramUrl || "",
      linkedinUrl: settings?.linkedinUrl || "",
      youtubeUrl: settings?.youtubeUrl || "",
    };
  } catch {
    return { instagramUrl: "", linkedinUrl: "", youtubeUrl: "" };
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function About() {
  const [blogs, settings] = await Promise.all([getBlogs(), getSettings()]);

  const hasSocialLinks =
    settings.instagramUrl || settings.linkedinUrl || settings.youtubeUrl;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Masthead */}
        <header className="flex items-center justify-between pt-10 sm:pt-14">
          <Link href="/" className="eyebrow transition-colors hover:text-accent">
            ← Joshua Isaiah
          </Link>
          <span className="label numeral">About — №&nbsp;02</span>
        </header>
        <hr className="rule mt-5" />

        {/* Title block */}
        <section className="pt-12 sm:pt-20">
          <p className="eyebrow mb-6">Artist Statement</p>
          <h1 className="display max-w-3xl">
            On being a <span className="italic font-light">polymath</span>
          </h1>
        </section>

        {/* Bio spread */}
        <section className="grid gap-10 pt-12 md:grid-cols-12 md:gap-14">
          {/* Portrait */}
          <div className="md:col-span-5">
            <figure className="md:sticky md:top-12 md:max-w-[460px]">
              <div className="overflow-hidden rounded-[4px] border border-rule-soft">
                <Image
                  src="/bioimage.jpg"
                  alt="Joshua Isaiah"
                  width={480}
                  height={600}
                  className="h-auto w-full object-cover"
                />
              </div>
              <figcaption className="label mt-3">Joshua Isaiah — Creative Director</figcaption>
            </figure>
          </div>

          {/* Statement */}
          <div className="md:col-span-7">
            <div className="max-w-2xl space-y-6">
              <p className="prose-serif first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[4.5rem] first-letter:leading-[0.8] first-letter:font-medium first-letter:text-emerald">
                I see myself as a polymath—multifaceted, curious, and fluent across
                disciplines. I&apos;ve always been quick to learn, and that instinct has carried
                me far. I&apos;ve also been wary of being boxed in, even in a world that rewards
                single-lane expertise with stability. What draws me instead is the journey:
                learning something new, absorbing it, and synthesizing it into my own
                framework so it has meaning.
              </p>
              <p className="prose-serif">
                I&apos;m a photojournalist, a filmmaker, a street photographer. A graphic
                designer, creative director, and brand builder. An artist, a writer, an event
                curator. I understand code, AI, and financial markets. I move through this
                multiverse collecting tools, perspectives, and languages—ultimately searching
                for the most honest way to be of service.
              </p>

              <div className="pt-2">
                <Link href="/work" className="btn btn-accent">
                  View Work
                  <svg className="-mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {hasSocialLinks && (
                <div className="flex items-center gap-5 pt-6">
                  <span className="label">Follow</span>
                  {settings.instagramUrl && (
                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-accent" title="Instagram">
                      <InstagramIcon className="h-5 w-5" />
                    </a>
                  )}
                  {settings.linkedinUrl && (
                    <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-accent" title="LinkedIn">
                      <LinkedInIcon className="h-5 w-5" />
                    </a>
                  )}
                  {settings.youtubeUrl && (
                    <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-accent" title="YouTube">
                      <YouTubeIcon className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Blog Feed Section */}
        {blogs.length > 0 && (
          <section className="pt-20 sm:pt-28">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="label">Recent Thoughts</h2>
              <span className="label numeral">{blogs.length} entries</span>
            </div>
            <div className="flex flex-col">
              {blogs.map((blog) => (
                <article key={blog.id} className="grid gap-3 border-t border-rule py-8 md:grid-cols-12">
                  <div className="md:col-span-3">
                    <p className="label numeral">{formatDate(blog.createdAt)}</p>
                  </div>
                  <div className="md:col-span-9 max-w-3xl">
                    <h3 className="headline mb-3 text-[1.5rem]">{blog.title}</h3>
                    <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-soft">
                      {blog.content}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-20 sm:mt-28">
          <hr className="rule" />
          <div className="flex flex-wrap items-center justify-between gap-4 py-10">
            <Link href="/" className="link-underline font-sans text-sm">← Home</Link>
            <p className="label numeral">© Joshua Isaiah</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
