import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

// Social icons
function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function YouTubeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
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

  const hasSocialLinks = settings.instagramUrl || settings.linkedinUrl || settings.youtubeUrl;

  return (
    <div className="min-h-screen bg-[#181818] px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white font-body text-sm transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Artist Statement Card */}
        <div className="card card-white p-8 md:p-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10">
            {/* Left column: Image */}
            <div className="flex-shrink-0 md:w-[240px]">
              <img
                src="/bioimage.png"
                alt="Joshua Isaiah"
                className="w-full h-auto rounded-xl border border-gray-200/60"
              />
            </div>

            {/* Right column: Bio text */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="max-w-prose space-y-5">
                <p className="font-body text-[#1a1a1a] text-base leading-relaxed">
                  I see myself as a polymath—multifaceted, curious, and fluent across disciplines. I've always been quick to learn, and that instinct has carried me far. I've also been wary of being boxed in, even in a world that rewards single-lane expertise with stability. What draws me instead is the journey: learning something new, absorbing it, and synthesizing it into my own framework so it has meaning.
                </p>

                <p className="font-body text-[#1a1a1a] text-base leading-relaxed">
                  I'm a photojournalist, a filmmaker, a street photographer. A graphic designer, creative director, and brand builder. An artist, a writer, an event curator. I understand code, AI, and financial markets. I move through this multiverse collecting tools, perspectives, and languages—ultimately searching for the most honest way to be of service.
                </p>

                {/* Subtle link to work */}
                <div className="pt-2">
                  <Link
                    href="/work"
                    className="inline-flex items-center gap-2 text-[#6b6b6b] hover:text-[#1a1a1a] font-body text-sm transition-colors"
                  >
                    View Work
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Social Icons - Bottom of card */}
          {hasSocialLinks && (
            <div className="flex items-center justify-center gap-5 mt-8 pt-6 border-t border-gray-200/60">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                  title="Instagram"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
              )}
              {settings.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                  title="LinkedIn"
                >
                  <LinkedInIcon className="w-5 h-5" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                  title="YouTube"
                >
                  <YouTubeIcon className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Blog Feed Section */}
        {blogs.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-white text-lg font-semibold mb-4">Recent Thoughts</h2>
            <div className="flex flex-col gap-4">
              {blogs.map((blog) => (
                <div key={blog.id} className="card card-white p-6">
                  <h3 className="font-heading text-[#1a1a1a] text-lg font-bold mb-2">
                    {blog.title}
                  </h3>
                  <p className="font-body text-[#6b6b6b] text-xs mb-3">
                    {formatDate(blog.createdAt)}
                  </p>
                  <p className="font-body text-[#2f2f2f] text-sm leading-relaxed whitespace-pre-wrap">
                    {blog.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
