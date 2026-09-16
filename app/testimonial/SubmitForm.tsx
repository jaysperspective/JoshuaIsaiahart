"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubmitForm() {
  const [quote, setQuote] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote, name, role, website }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong — please try again");
      }
    } catch {
      setError("Something went wrong — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="surface p-10 text-center sm:p-12">
        <p className="eyebrow mb-3">Received</p>
        <p className="headline mb-3 text-[1.6rem]">Thank you.</p>
        <p className="prose-serif mx-auto max-w-md">
          Your words mean a lot. Joshua reviews every story personally before it
          appears on the site.
        </p>
        <Link href="/work" className="btn mt-8">
          See the Work
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <label className="block label mb-2">Your experience *</label>
        <textarea
          required
          rows={5}
          maxLength={1200}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          className="field resize-none"
          placeholder="What was it like working together? What did the photos or film capture for you?"
        />
      </div>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <div>
          <label className="block label mb-2">Your name *</label>
          <input
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
            placeholder="How you'd like to be credited"
          />
        </div>
        <div>
          <label className="block label mb-2">The occasion (optional)</label>
          <input
            type="text"
            maxLength={160}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="field"
            placeholder="e.g. Engagement session, May 2026"
          />
        </div>
      </div>

      {/* Honeypot — hidden from people, tempting for bots */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        name="website"
      />

      {error && <p className="font-sans text-sm text-earth">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !quote.trim() || !name.trim()}
        className="btn btn-accent w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Share Your Story"}
      </button>
    </form>
  );
}
