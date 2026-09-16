"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PinGateProps {
  slug: string;
  title: string;
}

export default function PinGate({ slug, title }: PinGateProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/galleries/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, pin: pin.trim() }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Incorrect PIN");
      }
    } catch {
      setError("Something went wrong — try again");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink px-5 sm:px-8">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center py-16">
        <header className="mb-10 text-center">
          <Link href="/" className="eyebrow transition-colors hover:text-accent">
            Joshua Isaiah
          </Link>
        </header>

        <div className="surface p-8 text-center sm:p-10">
          <p className="eyebrow mb-3">Private Gallery</p>
          <h1 className="headline mb-2 text-[1.6rem]">{title}</h1>
          <p className="label normal-case tracking-normal mb-8">
            Enter the PIN you received to view this gallery.
          </p>

          <form onSubmit={submit} className="space-y-5">
            <input
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="field text-center text-lg tracking-[0.5em]"
              placeholder="••••"
              autoFocus
            />
            {error && <p className="font-sans text-sm text-earth">{error}</p>}
            <button
              type="submit"
              disabled={checking || !pin.trim()}
              className="btn btn-accent w-full justify-center disabled:opacity-50"
            >
              {checking ? "Checking…" : "View Gallery"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
