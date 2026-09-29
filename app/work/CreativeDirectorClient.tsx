"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import Image from "next/image";
import { parseVideoUrl, getEmbedUrl, getThumbnailUrl } from "@/app/lib/video-utils";
import { showcases, type Showcase, type ShowcaseImage } from "@/app/lib/creative-director";
import Reveal from "./Reveal";

const MONO = "'Menlo', ui-monospace, 'SF Mono', SFMono-Regular, monospace";
const DARK = "#2a2623";  // warm charcoal — the section background
const PAPER = "#f4ecd2"; // light text on dark
const BODY = "rgba(244,236,210,0.82)";
const MUT = "rgba(244,236,210,0.55)";
const HAIR = "rgba(244,236,210,0.16)"; // hairline rules on dark

/** The Plus N Trust "+ / venn" mark, rebuilt as SVG so it stays crisp and tintable. */
function PlusMark({ color, ring = "var(--paper)", size = 92 }: { color: string; ring?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="74" cy="60" r="30" fill={color} />
      <circle cx="46" cy="60" r="27" fill={ring} stroke={color} strokeWidth="8" />
      <rect x="42.5" y="47" width="7" height="26" rx="3.5" fill={color} />
      <rect x="33" y="56.5" width="26" height="7" rx="3.5" fill={color} />
    </svg>
  );
}

/** Optional copy slot: renders its content when provided, otherwise nothing. */
function InsertSlot({ filled, children }: { filled: boolean; children?: ReactNode }) {
  return filled ? <>{children}</> : null;
}

/** The brand identity — its own light section: palette, typeface, and guide. */
function BrandSystem({ showcase }: { showcase: Showcase }) {
  const { brand, swatches, brandAsset } = showcase;
  return (
    <Reveal>
      <div className="mt-14 overflow-hidden rounded-[8px]" style={{ background: "var(--card)", boxShadow: `inset 0 0 0 1px ${brand.primary}33` }}>
        <div className="grid gap-px md:grid-cols-[1.1fr_1.4fr]" style={{ background: `${brand.primary}22` }}>
          {/* Mark + type */}
          <div className="flex flex-col items-start gap-6 bg-card p-8 sm:p-10">
            <span className="label" style={{ letterSpacing: "0.2em" }}>Identity</span>
            <PlusMark color={brand.primary} />
            <div>
              <p className="font-display text-2xl" style={{ color: brand.ink }}>Plus N Trust</p>
              {brand.type && (
                <p className="mt-2 text-[0.8rem]" style={{ fontFamily: MONO, color: "var(--muted)" }}>typeface: {brand.type}</p>
              )}
            </div>
          </div>

          {/* Palette */}
          <div className="flex flex-col gap-5 bg-card p-8 sm:p-10">
            <span className="label" style={{ letterSpacing: "0.2em" }}>Palette</span>
            <div className="flex flex-col gap-3">
              {swatches?.map((s) => (
                <div key={s.hex} className="flex items-center gap-4">
                  <span className="h-9 w-16 shrink-0 rounded-[3px]" style={{ background: `#${s.hex}`, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }} />
                  <span className="text-[0.85rem]" style={{ fontFamily: MONO, color: brand.ink }}>#{s.hex}</span>
                  <span className="label normal-case" style={{ letterSpacing: "0.08em" }}>{s.name}</span>
                </div>
              ))}
            </div>
            {brandAsset && (
              <a href={brandAsset.href} target="_blank" rel="noopener noreferrer" className="btn mt-2 self-start" style={{ borderColor: brand.primary, color: brand.ink }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {brandAsset.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/** The full logo system — a dark wall of every mark variant. */
function LogoWall({ logos, accent }: { logos: NonNullable<Showcase["logos"]>; accent: string }) {
  return (
    <Reveal>
      <div className="mt-10">
        <div className="mb-4 flex items-center gap-4">
          <span className="label" style={{ letterSpacing: "0.2em", color: accent }}>Logo system</span>
          <span className="h-px flex-1" style={{ background: HAIR }} />
        </div>
        <div className="grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: HAIR }}>
          {logos.map((l) => (
            <div key={l.src} className="flex items-center justify-center px-4 py-10" style={{ background: DARK }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.src} alt={l.label} loading="lazy" className="max-h-16 w-auto object-contain" />
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

type Lightbox =
  | { kind: "image"; images: ShowcaseImage[]; index: number }
  | { kind: "video"; embed: string; title: string; direct?: boolean };

export default function CreativeDirectorClient() {
  const [lightbox, setLightbox] = useState<Lightbox | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const open = (lb: Lightbox) => setLightbox(lb);

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  const step = useCallback((dir: "prev" | "next") => {
    setLightbox((lb) => {
      if (!lb || lb.kind !== "image") return lb;
      const n = lb.images.length;
      const index = dir === "next" ? (lb.index + 1) % n : (lb.index - 1 + n) % n;
      return { ...lb, index };
    });
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (lightbox.kind === "image") {
        if (e.key === "ArrowLeft") step("prev");
        if (e.key === "ArrowRight") step("next");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, close, step]);

  return (
    // Full-bleed dark background for the whole section; content stays in-column.
    <div style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)", background: DARK, color: PAPER }}>
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-14 sm:px-8 lg:px-12">
        {/* Section intro */}
        <Reveal>
          <div className="mx-auto mb-4 max-w-2xl text-center">
            <p className="eyebrow mb-4" style={{ color: "#e3d9ac" }}>Creative Direction</p>
            <p className="prose-serif" style={{ color: BODY }}>
              Beyond the camera — building brands as whole worlds. Identity, color,
              type, the live experience, and the films that carry it. Selected
              direction work, one world at a time.
            </p>
          </div>
        </Reveal>

        {showcases.map((s) => {
          const brand = s.brand;
          return (
            <section key={s.id} className="mx-auto mt-12 max-w-5xl pt-6">
              {/* Case-study header */}
              <Reveal>
                <div className="text-center">
                  <p className="label numeral" style={{ color: brand.primary, letterSpacing: "0.22em" }}>
                    Showcase №&nbsp;{s.no} · {s.client}
                  </p>
                  <h2 className="display mt-4" style={{ color: PAPER }}>{s.title}</h2>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                    <span className="label" style={{ letterSpacing: "0.14em", color: MUT }}>{s.role}</span>
                    {s.year && (
                      <>
                        <span aria-hidden style={{ color: MUT }}>·</span>
                        <span className="label" style={{ fontFamily: MONO, letterSpacing: "0.06em", color: MUT }}>{s.year}</span>
                      </>
                    )}
                  </div>
                </div>
              </Reveal>

              {/* Logo system — directly under the title */}
              {s.logos && s.logos.length > 0 && <LogoWall logos={s.logos} accent={brand.secondary} />}

              {/* Slot: pull quote */}
              <InsertSlot filled={!!s.pullQuote}>
                <Reveal>
                  <blockquote className="mx-auto mt-10 max-w-3xl text-center font-display text-2xl italic sm:text-3xl" style={{ color: PAPER }}>
                    &ldquo;{s.pullQuote}&rdquo;
                  </blockquote>
                </Reveal>
              </InsertSlot>

              {/* Lede + body */}
              <Reveal delay={60}>
                <div className="mx-auto mt-8 max-w-2xl">
                  <p className="prose-serif text-center" style={{ color: PAPER }}>{s.intro}</p>
                  {s.body.map((p, i) => (
                    <p key={i} className="prose-serif mt-5" style={{ color: BODY }}>{p}</p>
                  ))}
                </div>
              </Reveal>

              {/* Brand system — its own light section (with the full logo system) */}
              <BrandSystem showcase={s} />

              {/* Applied identity — flyers, covers, the feed */}
              {s.collateral && s.collateral.length > 0 && (
                <div className="mt-16">
                  <Reveal>
                    <div className="mb-6 flex items-baseline justify-between">
                      <h3 className="headline text-[1.5rem] sm:text-[1.9rem]" style={{ color: PAPER }}>The collateral</h3>
                      <span className="label normal-case" style={{ fontFamily: MONO, letterSpacing: "0.06em", color: MUT }}>Applied identity</span>
                    </div>
                  </Reveal>

                  {/* Feed (9:16) — left column, spans two rows; flyers/covers fill around it */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
                    {(() => {
                      const feedIdx = s.collateral!.length - 1;
                      const feed = s.collateral![feedIdx];
                      return (
                        <Reveal className="row-span-2">
                          <button onClick={() => open({ kind: "image", images: s.collateral!, index: feedIdx })}
                            className="group relative block h-full min-h-[22rem] w-full overflow-hidden rounded-[4px]" style={{ background: "rgba(0,0,0,0.25)" }}>
                            <Image src={feed.src} alt={feed.alt} fill sizes="(max-width: 640px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                            <span className="absolute left-2 top-2 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.16em]" style={{ background: brand.primary, color: brand.ink, fontFamily: MONO }}>Feed</span>
                            <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                              style={{ boxShadow: `inset 0 0 0 2px ${brand.primary}` }} />
                          </button>
                        </Reveal>
                      );
                    })()}

                    {s.collateral.slice(0, -1).map((img, i) => (
                      <Reveal key={img.src} delay={(i % 3) * 60}>
                        <button onClick={() => open({ kind: "image", images: s.collateral!, index: i })}
                          className="group relative block aspect-square w-full overflow-hidden rounded-[4px]" style={{ background: "rgba(0,0,0,0.25)" }}>
                          <Image src={img.src} alt={img.alt} fill sizes="(max-width: 640px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                          <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            style={{ boxShadow: `inset 0 0 0 2px ${brand.primary}` }} />
                        </button>
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}

              {/* Slot: director's note */}
              <InsertSlot filled={!!(s.directorsNote && s.directorsNote.length)}>
                <Reveal>
                  <div className="mx-auto mt-14 max-w-2xl">
                    <p className="eyebrow mb-4" style={{ color: brand.primary }}>Director&rsquo;s Note</p>
                    {s.directorsNote?.map((p, i) => (
                      <p key={i} className="prose-serif mt-4 first:mt-0" style={{ color: BODY }}>{p}</p>
                    ))}
                  </div>
                </Reveal>
              </InsertSlot>

              {/* Live photography */}
              {s.images.length > 0 && (
                <div className="mt-16">
                  <Reveal>
                    <div className="mb-6 flex items-baseline justify-between">
                      <h3 className="headline text-[1.5rem] sm:text-[1.9rem]" style={{ color: PAPER }}>The live world</h3>
                      <span className="label numeral" style={{ color: MUT }}>{String(s.images.length).padStart(2, "0")} frames</span>
                    </div>
                  </Reveal>
                  <InsertSlot filled={!!s.liveNote}>
                    <Reveal>
                      <p className="prose-serif mb-6 max-w-2xl" style={{ color: BODY }}>{s.liveNote}</p>
                    </Reveal>
                  </InsertSlot>
                  {/* Motion clip (9:16) — left column, spans two rows; photos fill around it */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
                    {s.liveVideo && (
                      <Reveal className="row-span-2">
                        <button onClick={() => open({ kind: "video", embed: s.liveVideo!.src, title: s.liveVideo!.caption || "Live", direct: true })}
                          className="group relative block h-full min-h-[22rem] w-full overflow-hidden rounded-[4px]" style={{ background: "rgba(0,0,0,0.25)" }}>
                          <video className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            src={s.liveVideo.src} poster={s.liveVideo.poster} muted loop autoPlay playsInline preload="metadata" />
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm transition-transform duration-300 group-hover:scale-110" style={{ background: `${brand.primary}cc` }}>
                              <svg className="ml-0.5 h-5 w-5" fill={brand.ink} viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </span>
                          </span>
                          <span className="absolute left-2 top-2 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.16em]" style={{ background: brand.primary, color: brand.ink, fontFamily: MONO }}>Motion</span>
                          <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 0 2px ${brand.primary}` }} />
                        </button>
                      </Reveal>
                    )}

                    {s.images.map((img, i) => (
                      <Reveal key={img.src} delay={(i % 3) * 60}>
                        <button onClick={() => open({ kind: "image", images: s.images, index: i })}
                          className="group relative block aspect-square w-full overflow-hidden rounded-[4px]" style={{ background: "rgba(0,0,0,0.25)" }}>
                          <Image src={img.src} alt={img.alt} fill sizes="(max-width: 640px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                          <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            style={{ boxShadow: `inset 0 0 0 2px ${brand.primary}` }} />
                        </button>
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}

              {/* Film */}
              {s.videos.length > 0 && (
                <div className="mt-16">
                  <Reveal>
                    <h3 className="headline mb-6 text-[1.5rem] sm:text-[1.9rem]" style={{ color: PAPER }}>The films</h3>
                  </Reveal>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {s.videos.map((v, i) => {
                      const parsed = parseVideoUrl(v.url);
                      const thumb = getThumbnailUrl(parsed);
                      const embed = getEmbedUrl(parsed) || "";
                      return (
                        <Reveal key={v.url} delay={(i % 3) * 60}>
                          <button onClick={() => open({ kind: "video", embed, title: v.title })} className="group block w-full text-left">
                            <div className="relative aspect-video overflow-hidden rounded-[4px]" style={{ background: "rgba(0,0,0,0.3)" }}>
                              {thumb ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={thumb} alt={v.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center"><span className="label" style={{ color: MUT }}>Film</span></div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 group-hover:scale-110" style={{ background: `${brand.primary}e6` }}>
                                  <svg className="ml-1 h-6 w-6" fill={brand.ink} viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                              </div>
                            </div>
                            <p className="label mt-2.5" style={{ fontFamily: MONO, letterSpacing: "0.04em", color: BODY }}>{v.title}</p>
                            {v.note && (
                              <p className="label normal-case mt-1" style={{ letterSpacing: "0.04em", color: MUT }}>{v.note}</p>
                            )}
                          </button>
                        </Reveal>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* The app — plusONE ticketing */}
              {s.app && (
                <div className="mt-16">
                  <Reveal>
                    <div className="mb-6 flex items-baseline justify-between">
                      <h3 className="headline text-[1.5rem] sm:text-[1.9rem]" style={{ color: PAPER }}>The app</h3>
                      <span className="label normal-case" style={{ fontFamily: MONO, letterSpacing: "0.06em", color: MUT }}>{s.app.name} · iOS</span>
                    </div>
                  </Reveal>
                  <Reveal delay={60}>
                    <div className="grid items-center gap-8 rounded-[8px] p-6 sm:p-10 md:grid-cols-[1.15fr_1fr]"
                      style={{ background: "rgba(0,0,0,0.18)", boxShadow: `inset 0 0 0 1px ${brand.primary}33` }}>
                      {/* Screenshots */}
                      <div className="flex justify-center gap-4">
                        {s.app.screenshots.map((sc, i) => (
                          <button key={sc.src} onClick={() => open({ kind: "image", images: s.app!.screenshots, index: i })}
                            className="group relative w-[44%] max-w-[190px] overflow-hidden rounded-[16px]"
                            style={{ boxShadow: `0 0 0 1px ${brand.primary}55` }}>
                            <div className="relative aspect-[77/160] w-full">
                              <Image src={sc.src} alt={sc.alt} fill sizes="190px"
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                            </div>
                          </button>
                        ))}
                      </div>
                      {/* Copy + QR + download */}
                      <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/creative-director/plusntrust/logos/pnt-logo-plusone.png" alt="plusONE" className="h-9 w-auto object-contain" />
                        <p className="prose-serif mt-4" style={{ color: BODY }}>{s.app.description}</p>
                        <div className="mt-6 flex items-center gap-5">
                          <div className="shrink-0 rounded-[10px] bg-white p-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={s.app.qr} alt={`Scan to download ${s.app.name}`} className="h-28 w-28" />
                          </div>
                          <div>
                            <p className="label" style={{ fontFamily: MONO, letterSpacing: "0.08em", color: MUT }}>Scan to download</p>
                            <a href={s.app.appStoreUrl} target="_blank" rel="noopener noreferrer" className="btn mt-3"
                              style={{ borderColor: brand.primary, color: PAPER, fontFamily: MONO }}>
                              App Store
                              <svg className="-mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.5 14.5L14.5 5.5M14.5 5.5H7.5M14.5 5.5V12.5" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>
              )}

              {/* Slot: credits */}
              <InsertSlot filled={!!(s.credits && s.credits.length)}>
                <Reveal>
                  <div className="mt-16 border-t pt-8" style={{ borderColor: HAIR }}>
                    <p className="mb-5 eyebrow" style={{ color: brand.primary }}>Credits</p>
                    <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                      {s.credits?.map((c, i) => (
                        <div key={i} className="flex items-baseline justify-between gap-4 border-b py-2.5" style={{ borderColor: HAIR }}>
                          <dt className="label" style={{ letterSpacing: "0.12em", color: MUT }}>{c.role}</dt>
                          <dd className="text-[0.95rem]" style={{ fontFamily: MONO, color: PAPER }}>{c.name}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </Reveal>
              </InsertSlot>

              {/* Enter the world — links */}
              {s.links.length > 0 && (
                <Reveal>
                  <div className="mt-16 border-t pt-12 text-center" style={{ borderColor: HAIR }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/creative-director/plusntrust/logos/pnt-logo-creators.png"
                      alt="Plus N Trust — the creators"
                      className="mx-auto mb-6 h-16 w-auto object-contain sm:h-20"
                    />
                    <p className="eyebrow" style={{ color: brand.secondary }}>Enter the world</p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      {s.links.map((l) => (
                        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="btn"
                          style={{ borderColor: brand.primary, color: PAPER, fontFamily: MONO }}>
                          {l.label}
                          <svg className="-mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.5 14.5L14.5 5.5M14.5 5.5H7.5M14.5 5.5V12.5" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
            </section>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-enter fixed inset-0 z-50 flex items-center justify-center bg-vigne/95 p-4" onClick={close}>
          <button onClick={close} className="absolute right-6 top-6 z-10 text-paper/60 transition-colors hover:text-paper" aria-label="Close">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {lightbox.kind === "image" ? (
            <>
              <div className="absolute left-6 top-6 z-10 label numeral text-khaki/70">
                {lightbox.index + 1} / {lightbox.images.length}
              </div>
              <button onClick={(e) => { e.stopPropagation(); step("prev"); }} className="absolute left-4 z-10 text-paper/40 transition-colors hover:text-paper sm:left-6" aria-label="Previous">
                <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); step("next"); }} className="absolute right-4 z-10 text-paper/40 transition-colors hover:text-paper sm:right-6" aria-label="Next">
                <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={lightbox.images[lightbox.index].src} src={lightbox.images[lightbox.index].src} alt={lightbox.images[lightbox.index].alt}
                className="lightbox-image-enter max-h-[85vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
              {lightbox.images[lightbox.index].caption && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-vigne/50 px-4 py-2 text-center label normal-case tracking-normal text-paper/80 backdrop-blur-sm">
                  {lightbox.images[lightbox.index].caption}
                </div>
              )}
            </>
          ) : (
            <div className="my-auto w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              {lightbox.direct ? (
                <div className="flex justify-center">
                  <video src={lightbox.embed} controls autoPlay playsInline className="max-h-[85vh] rounded-[4px]" />
                </div>
              ) : (
                <div className="aspect-video">
                  <iframe src={lightbox.embed} className="h-full w-full rounded-[4px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              )}
              <p className="mt-3 text-center font-display text-lg text-paper">{lightbox.title}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
