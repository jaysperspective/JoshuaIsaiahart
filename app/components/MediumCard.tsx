import Link from "next/link";
import Image from "next/image";

interface MediumCardProps {
  accent?: string;
  href?: string;
  external?: boolean;
  image?: string;
  imageAlt?: string;
  imagePosition?: "top" | "right";
  imagePriority?: boolean;
  eyebrow?: string;
  title: string;
  meta?: React.ReactNode;
  body?: React.ReactNode;
  cta?: string;
  className?: string;
  size?: "default" | "large";
}

export default function MediumCard({
  accent = "var(--accent-about)",
  href,
  external = false,
  image,
  imageAlt = "",
  imagePosition = "top",
  imagePriority = false,
  eyebrow,
  title,
  meta,
  body,
  cta,
  className = "",
  size = "default",
}: MediumCardProps) {
  const isLink = Boolean(href);
  const interactiveClass = isLink ? "neu-card-interactive cursor-pointer" : "";
  const titleSize = size === "large" ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl";

  const inner = (
    <article
      className={`neu-card ${interactiveClass} overflow-hidden flex flex-col h-full ${className}`}
      style={{ borderLeftWidth: "4px", borderLeftColor: accent }}
    >
      {image && imagePosition === "top" && (
        <div className={`relative w-full ${size === "large" ? "h-64 sm:h-80" : "h-44"} bg-[var(--background)]`}>
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={imagePriority}
            className="object-cover"
          />
        </div>
      )}

      <div className={`flex ${imagePosition === "right" ? "flex-col sm:flex-row" : "flex-col"} flex-1`}>
        <div className={`p-5 sm:p-6 flex flex-col flex-1 ${imagePosition === "right" ? "order-2 sm:order-1" : ""}`}>
          {eyebrow && (
            <div className="mb-3">
              <span
                className="inline-block font-medium px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-body"
                style={{ color: accent, border: `1px solid ${accent}` }}
              >
                {eyebrow}
              </span>
            </div>
          )}

          <h3 className={`font-heading font-semibold ${titleSize} text-[var(--foreground)] leading-snug`}>
            {title}
          </h3>

          {meta && (
            <div className="mt-2 text-xs text-[var(--text-muted)] font-body">
              {meta}
            </div>
          )}

          {body && (
            <div className="mt-3 text-sm text-[var(--text-muted)] font-body leading-relaxed flex-1">
              {body}
            </div>
          )}

          {cta && (
            <div className="mt-4 text-sm font-body" style={{ color: accent }}>
              {cta} {external ? "↗" : "→"}
            </div>
          )}
        </div>

        {image && imagePosition === "right" && (
          <div className="relative w-full sm:w-1/2 h-56 sm:h-auto sm:min-h-[260px] order-1 sm:order-2 bg-[var(--background)]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={imagePriority}
              className="object-cover"
            />
          </div>
        )}
      </div>
    </article>
  );

  if (!href) return inner;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full no-underline text-inherit"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className="block h-full no-underline text-inherit">
      {inner}
    </Link>
  );
}
