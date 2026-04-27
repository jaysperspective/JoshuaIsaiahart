import Image from "next/image";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

interface Blog {
  id: string;
  title: string;
  content: string;
  createdAt: string;
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function About() {
  const blogs = await getBlogs();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <header className="mb-8">
        <p className="font-body text-xs uppercase tracking-wide text-[var(--text-muted)] mb-2">
          About
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-[var(--foreground)]">
          Joshua Isaiah
        </h1>
        <p className="font-body text-sm text-[var(--text-muted)] mt-1">
          Visual artist · creative director · photojournalist · filmmaker
        </p>
      </header>

      {/* Bio block */}
      <article
        className="neu-card p-5 sm:p-7 mb-10"
        style={{ borderLeftWidth: "4px", borderLeftColor: "var(--accent-about)" }}
      >
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="flex-shrink-0 md:w-[240px]">
            <Image
              src="/bioimage.jpg"
              alt="Joshua Isaiah"
              width={480}
              height={600}
              className="w-full h-auto rounded-sm border border-[var(--border-muted)]"
            />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-4 font-body text-[var(--foreground)] text-base leading-relaxed">
              <p>
                I see myself as a polymath—multifaceted, curious, and fluent across disciplines. I&apos;ve always been quick to learn, and that instinct has carried me far. I&apos;ve also been wary of being boxed in, even in a world that rewards single-lane expertise with stability. What draws me instead is the journey: learning something new, absorbing it, and synthesizing it into my own framework so it has meaning.
              </p>
              <p>
                I&apos;m a photojournalist, a filmmaker, a street photographer. A graphic designer, creative director, and brand builder. An artist, a writer, an event curator. I understand code, AI, and financial markets. I move through this multiverse collecting tools, perspectives, and languages—ultimately searching for the most honest way to be of service.
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Blog feed */}
      {blogs.length > 0 && (
        <section className="border-t border-[var(--border-muted)] pt-8">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[var(--foreground)]">
              Recent thoughts
            </h2>
            <span className="font-body text-xs text-[var(--text-muted)]">
              {blogs.length} {blogs.length === 1 ? "post" : "posts"}
            </span>
          </div>

          <div className="space-y-4">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="neu-card p-5"
                style={{ borderLeftWidth: "4px", borderLeftColor: "var(--accent-about)" }}
              >
                <div className="flex items-center gap-2 text-[11px] mb-2">
                  <span className="font-body text-[var(--text-muted)] uppercase tracking-wide">
                    {formatDate(blog.createdAt)}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-[var(--foreground)] mb-2">
                  {blog.title}
                </h3>
                <p className="font-body text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
                  {blog.content}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
