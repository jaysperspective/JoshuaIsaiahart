"use client";

import { useState } from "react";

// Native share sheet where supported (mobile), clipboard copy as fallback.
export default function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, text: title, url });
        return;
      } catch {
        // user cancelled — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* no-op */
    }
  }

  return (
    <button onClick={onShare} className="btn btn-ghost text-muted" aria-live="polite">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.7 10.7 15.3 7M8.7 13.3l6.6 3.7" />
        <circle cx="18" cy="5.5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="18.5" r="2.5" />
      </svg>
      {copied ? "Link copied" : "Share this card"}
    </button>
  );
}
