"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// First-party pageview beacon — no cookies, admin excluded server-side too
export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    try {
      navigator.sendBeacon(
        "/api/metrics",
        new Blob(
          [JSON.stringify({ type: "view", path: pathname, referrer: document.referrer })],
          { type: "application/json" }
        )
      );
    } catch {}
  }, [pathname]);

  return null;
}
