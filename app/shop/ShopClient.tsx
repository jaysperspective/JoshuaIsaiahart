"use client";

import { useState, useEffect, useCallback } from "react";
import Reveal from "@/app/work/Reveal";

export interface ShopProductDTO {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  price: number; // cents
  dimensions: string;
  paperType: string;
  displayRatio: string; // "4:3" | "3:4" | "1:1"
}

const RATIO_CSS: Record<string, string> = {
  "4:3": "4 / 3",
  "3:4": "3 / 4",
  "1:1": "1 / 1",
};

const price = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// Image that resists casual saving: no context menu, no drag, not selectable,
// and a transparent overlay so a long-press/right-click lands on nothing.
function ProtectedImg({
  src,
  className = "",
  wrapperClassName = "block",
}: {
  src: string;
  className?: string;
  wrapperClassName?: string;
}) {
  return (
    <span className={`relative select-none ${wrapperClassName}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className={`pointer-events-none select-none ${className}`}
      />
      <span aria-hidden className="absolute inset-0" />
    </span>
  );
}

export default function ShopClient({ products }: { products: ShopProductDTO[] }) {
  const [active, setActive] = useState<ShopProductDTO | null>(null);
  const [buying, setBuying] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    setActive(null);
    setBuying(false);
    setDone(false);
    setError(null);
    setName("");
    setEmail("");
  }, []);

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active, close]);

  async function submitPurchase() {
    if (!active) return;
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: active.id, name, email }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-10 sm:mt-14">
      {products.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center sm:py-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/shop-closed.gif"
            alt="A light switch flicked off"
            className="w-72 select-none sm:w-[26rem] lg:w-[32rem]"
            draggable={false}
          />
          <h2
            className="font-display mt-8 text-[clamp(1.6rem,4vw,2.4rem)] font-medium"
            style={{ color: "#f4ecd2" }}
          >
            The store is closed
          </h2>
          <p className="prose-serif mt-3" style={{ color: "rgba(244,236,210,0.8)" }}>
            Check back later for new items.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8 sm:gap-10 lg:gap-14">
          {products.map((p, i) => (
            <Reveal
              key={p.id}
              delay={(i % 4) * 70}
              className="grow-0 basis-[calc((100%-2rem)/2)] sm:basis-[calc((100%-5rem)/3)] lg:basis-[calc((100%-10.5rem)/4)]"
            >
              <button
                onClick={() => setActive(p)}
                className="group block w-full"
                aria-label={`View ${p.title}`}
              >
                {/* White mat / frame */}
                <div className="bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_18px_44px_rgba(0,0,0,0.3)] sm:p-5">
                  <div
                    className="overflow-hidden bg-white"
                    style={{ aspectRatio: RATIO_CSS[p.displayRatio] || "4 / 3" }}
                  >
                    <ProtectedImg
                      src={p.imageUrl}
                      wrapperClassName="flex h-full w-full items-center justify-center"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
                {/* Caption below the frame */}
                <div className="mt-4 text-center">
                  <p className="font-display text-[1.02rem] leading-tight" style={{ color: "#f4ecd2" }}>
                    {p.title}
                  </p>
                  <p
                    className="label numeral mt-1 normal-case tracking-normal"
                    style={{ color: "rgba(244,236,210,0.72)" }}
                  >
                    {p.dimensions} · {price(p.price)}
                  </p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      {/* Detail overlay */}
      {active && (
        <div
          className="lightbox-enter fixed inset-0 z-50 flex items-center justify-center bg-vigne/[0.97] p-4 backdrop-blur-md sm:p-8"
          onClick={close}
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-5 top-5 z-10 text-2xl text-paper/70 hover:text-paper"
          >
            ✕
          </button>

          <div
            className="shop-detail-enter grid max-h-full w-full max-w-5xl grid-cols-1 gap-8 overflow-y-auto md:grid-cols-2 md:items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex justify-center">
              <ProtectedImg
                src={active.imageUrl}
                className="max-h-[48vh] w-auto rounded-sm object-contain md:max-h-[80vh]"
              />
            </div>

            {/* Info panel */}
            <div className="text-paper">
              <h2
                className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-medium leading-tight"
                style={{ color: "#f4ecd2" }}
              >
                {active.title}
              </h2>
              <p
                className="numeral mt-3 font-sans text-[1.7rem] font-semibold"
                style={{ color: "#f4ecd2" }}
              >
                {price(active.price)}
              </p>

              <dl
                className="mt-6 space-y-2 border-t pt-6"
                style={{ borderColor: "rgba(244,236,210,0.2)" }}
              >
                <div className="flex justify-between gap-4">
                  <dt className="label" style={{ color: "rgba(244,236,210,0.6)" }}>
                    Dimensions
                  </dt>
                  <dd className="font-sans text-sm" style={{ color: "#f4ecd2" }}>
                    {active.dimensions}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="label" style={{ color: "rgba(244,236,210,0.6)" }}>
                    Paper
                  </dt>
                  <dd className="font-sans text-sm" style={{ color: "#f4ecd2" }}>
                    {active.paperType}
                  </dd>
                </div>
              </dl>

              {active.description && (
                <p
                  className="prose-serif mt-6 text-[1.05rem] leading-relaxed"
                  style={{ color: "rgba(244,236,210,0.92)" }}
                >
                  {active.description}
                </p>
              )}

              {/* Purchase */}
              <div className="mt-8">
                {done ? (
                  <div className="rounded-sm border border-paper/25 p-5">
                    <p className="font-display text-xl text-paper">Thank you, {name.split(" ")[0]}.</p>
                    <p className="prose-serif mt-2 text-[0.98rem] text-paper/80">
                      Your interest in “{active.title}” is recorded. I’ll be in touch at {email} to
                      arrange the print and payment.
                    </p>
                  </div>
                ) : !buying ? (
                  <button
                    onClick={() => setBuying(true)}
                    className="btn btn-shop"
                    style={{ color: "#fff" }}
                  >
                    Purchase this print
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="label text-paper/70">Enter your details to reserve this print</p>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full rounded-sm border border-paper/30 bg-transparent px-4 py-3 font-sans text-sm text-paper placeholder:text-paper/40 focus:border-paper focus:outline-none"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full rounded-sm border border-paper/30 bg-transparent px-4 py-3 font-sans text-sm text-paper placeholder:text-paper/40 focus:border-paper focus:outline-none"
                    />
                    {error && <p className="font-sans text-sm text-earth">{error}</p>}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={submitPurchase}
                        disabled={submitting}
                        className="btn btn-shop"
                        style={{ color: "#fff" }}
                      >
                        {submitting ? "Submitting…" : "Confirm interest"}
                      </button>
                      <button
                        onClick={() => setBuying(false)}
                        className="font-sans text-sm text-paper/60 hover:text-paper"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="font-sans text-xs text-paper/50">
                      Payment &amp; shipping are arranged personally — this just reserves your piece.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
