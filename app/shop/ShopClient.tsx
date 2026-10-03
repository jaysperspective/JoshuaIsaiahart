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

export default function ShopClient({
  products,
  initialProductId,
}: {
  products: ShopProductDTO[];
  initialProductId?: string;
}) {
  const [active, setActive] = useState<ShopProductDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Switch the active print and reset the purchase UI.
  const applyActive = useCallback((p: ShopProductDTO | null) => {
    setActive(p);
    setSubmitting(false);
    setPaid(false);
    setError(null);
    setCopied(false);
  }, []);

  // Open a print and reflect it in the URL (/shop/<id>) so the address bar is
  // always a shareable deep link.
  const open = useCallback(
    (p: ShopProductDTO) => {
      applyActive(p);
      window.history.pushState({ shop: p.id }, "", `/shop/${p.id}`);
    },
    [applyActive]
  );

  const close = useCallback(() => {
    applyActive(null);
    if (/^\/shop\/.+/.test(window.location.pathname)) {
      window.history.pushState({}, "", "/shop");
    }
  }, [applyActive]);

  // Open the deep-linked print on first load (/shop/<id>). If we're returning
  // from a completed Stripe checkout (/shop/<id>?paid=1), show the confirmation.
  useEffect(() => {
    if (!initialProductId) return;
    const p = products.find((x) => x.id === initialProductId);
    if (p) {
      applyActive(p);
      if (new URLSearchParams(window.location.search).get("paid") === "1") {
        setPaid(true);
      }
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the overlay in sync with browser back/forward.
  useEffect(() => {
    const onPop = () => {
      const m = window.location.pathname.match(/^\/shop\/(.+)$/);
      const p = m ? products.find((x) => x.id === decodeURIComponent(m[1])) : null;
      applyActive(p || null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [products, applyActive]);

  const copyLink = useCallback(() => {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
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

  // Hand off to Stripe (via the Sovereign payment app) and redirect the browser
  // to the hosted checkout. On success the page navigates away, so we leave the
  // button in its "Redirecting…" state.
  async function startCheckout() {
    if (!active) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: active.id }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.url) {
        window.location.href = d.url;
      } else {
        setError(d.error || "Could not start checkout. Please try again.");
        setSubmitting(false);
      }
    } catch {
      setError("Could not start checkout. Please try again.");
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
              className="grow-0 basis-[calc((100%-2rem)/2)] sm:basis-[calc((100%-2.5rem)/2)] lg:basis-[calc((100%-7rem)/3)]"
            >
              <button
                onClick={() => open(p)}
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
              <div className="mt-3 flex items-center justify-between gap-4">
                <p
                  className="numeral font-sans text-[1.7rem] font-semibold"
                  style={{ color: "#f4ecd2" }}
                >
                  {price(active.price)}
                </p>
                <button
                  onClick={copyLink}
                  className="font-sans text-xs uppercase tracking-wide transition-colors"
                  style={{ color: copied ? "#f4ecd2" : "rgba(244,236,210,0.55)" }}
                >
                  {copied ? "Link copied ✓" : "Copy link"}
                </button>
              </div>

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
                {paid ? (
                  <div className="rounded-sm border border-paper/25 p-5">
                    <p className="font-display text-xl text-paper">Thank you — your order is confirmed.</p>
                    <p className="prose-serif mt-2 text-[0.98rem] text-paper/80">
                      A receipt is on its way to your email. I’ll be in touch about your print of
                      “{active.title}.”
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={startCheckout}
                      disabled={submitting}
                      className="btn btn-shop"
                      style={{ color: "#fff" }}
                    >
                      {submitting ? "Redirecting…" : "Buy this print"}
                    </button>
                    {error && <p className="mt-3 font-sans text-sm text-earth">{error}</p>}
                    <p className="mt-3 font-sans text-xs text-paper/50">
                      Secure checkout. Free shipping — you’ll enter your shipping address at payment.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
