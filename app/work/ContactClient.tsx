"use client";

import { useState, useMemo, useRef, useLayoutEffect, useEffect, useCallback, type ReactNode } from "react";
import { DEFAULT_BOOKING_CONFIG, generateSlots } from "@/app/lib/booking-config";

// Slate-blue accent for the booking card (News-EP brand blue).
const ACCENT = "#547890";
const ACCENT_DEEP = "#466579";
const ACCENT_SOFT = "rgba(84,120,144,0.12)";

interface BookingForm {
  name: string;
  phone: string;
  email: string;
  description: string;
}

type ContactPref = "video" | "text";

interface Availability {
  days: number[];
  windowDays: number;
  slots: string[];
  taken: Record<string, string[]>;
}

const STEP_TITLES = ["Your details", "Your inquiry", "Pick a time"];

// Joshua's number for the text-follow-up SMS link. Mirrors CARD.phone in
// app/lib/contact.ts (that module is server-only — it imports prisma — so the
// value is repeated here for the client bundle).
const JOSHUA_SMS = "+14344893932";

type Outcome = "booked" | "texted" | "emailed";

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Phones/tablets that have a Messages app — route the text follow-up to SMS. */
function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return true;
  // iPadOS 13+ reports as "Macintosh" but is touch-capable.
  if (/Macintosh/.test(ua) && (navigator.maxTouchPoints ?? 0) > 1) return true;
  return false;
}

function formatLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function emailLooksValid(v: string): boolean {
  return /^\S+@\S+\.\S+$/.test(v.trim());
}

export default function ContactClient() {
  // --- form state ---
  const [form, setForm] = useState<BookingForm>({
    name: "",
    phone: "",
    email: "",
    description: "",
  });
  const [contactPref, setContactPref] = useState<ContactPref>("video");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [company, setCompany] = useState(""); // honeypot — real users never fill this

  // --- flow state (flip card) ---
  const [step, setStep] = useState(0); // 0..3 (3 = confirmation)
  const [flipped, setFlipped] = useState(false);
  const [frontStep, setFrontStep] = useState(0);
  const [backStep, setBackStep] = useState(1);

  // --- submit state ---
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- availability (configurable hours + already-taken slots) ---
  const [avail, setAvail] = useState<Availability | null>(null);
  const loadAvail = useCallback(() => {
    fetch("/api/booking/availability")
      .then((r) => r.json())
      .then((d: Availability) => setAvail(d))
      .catch(() => {});
  }, []);
  useEffect(() => { loadAvail(); }, [loadAvail]);

  const allowedDays = avail?.days ?? DEFAULT_BOOKING_CONFIG.days;
  const windowDays = avail?.windowDays ?? DEFAULT_BOOKING_CONFIG.windowDays;
  const slots = avail?.slots ?? generateSlots(DEFAULT_BOOKING_CONFIG);
  const taken = avail?.taken ?? {};

  // Availability window, starting tomorrow (never today/past).
  const days = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const out: Date[] = [];
    for (let i = 1; i <= windowDays; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      if (allowedDays.includes(d.getDay())) out.push(d);
    }
    return out;
  }, [allowedDays, windowDays]);

  // --- height measurement so the flip card grows/shrinks per step ---
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = flipped ? backRef.current : frontRef.current;
    if (el) setHeight(el.offsetHeight);
  }, [flipped, frontStep, backStep, step, selectedDate, selectedTime, contactPref, error, submitting, form]);

  // Flip to a new step, loading its content onto the face that's about to show.
  function go(next: number) {
    if (next === step) return;
    if (flipped) setFrontStep(next);
    else setBackStep(next);
    setFlipped((f) => !f);
    setStep(next);
    setError(null);
  }

  const [outcome, setOutcome] = useState<Outcome>("booked");

  const canLeaveDetails = form.name.trim().length > 0 && emailLooksValid(form.email);
  const canLeaveInquiry = form.description.trim().length > 0;
  const needsPhone = contactPref === "text" && form.phone.trim().length === 0;
  // Video needs a scheduled slot; text just needs a number to reach them.
  const canConfirm = contactPref === "text" ? !needsPhone : !!selectedDate && !!selectedTime;

  // Scheduled video call — persists + emails a calendar invite.
  async function submitBooking() {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          dateYmd: ymd(selectedDate),
          time: selectedTime,
          contactPref: "video",
          company, // honeypot
          ...form,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          // Slot was taken between load and submit — refresh and let them repick.
          setSelectedTime(null);
          loadAvail();
        }
        throw new Error(data.error || "Failed to book. Please try again.");
      }
      setOutcome("booked");
      go(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  // Text follow-up — on a phone, open Messages prefilled; on desktop, email Joshua.
  async function sendText() {
    if (needsPhone) {
      setError("Add a number so I can text you.");
      return;
    }
    const body = `Hi Joshua, this is ${form.name || "someone"} from your site.\n\n${form.description}`.trim();

    if (isMobileDevice()) {
      setOutcome("texted");
      go(3);
      // Open the Messages app prefilled. `?&body=` is the broadly-compatible form.
      window.location.href = `sms:${JOSHUA_SMS}?&body=${encodeURIComponent(body)}`;
      return;
    }

    // Desktop — no Messages app, so email Joshua instead.
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactPref: "text", company, ...form }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send. Please try again.");
      }
      setOutcome("emailed");
      go(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setForm({ name: "", phone: "", email: "", description: "" });
    setContactPref("video");
    setOutcome("booked");
    setSelectedDate(null);
    setSelectedTime(null);
    setCompany("");
    setError(null);
    setStep(0);
    setFlipped(false);
    setFrontStep(0);
    setBackStep(1);
  }

  // --- shared bits ---
  const primaryBtn = (label: string, onClick: () => void, disabled = false) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-paper transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      style={{ background: disabled ? ACCENT : ACCENT }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = ACCENT_DEEP; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; }}
    >
      {label}
    </button>
  );

  const backBtn = (to: number) => (
    <button
      type="button"
      onClick={() => go(to)}
      className="inline-flex items-center gap-1.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );

  const stepHeader = (i: number, titleOverride?: string) => (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-1.5">
        {[0, 1, 2].map((n) => (
          <span
            key={n}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ background: n <= i ? ACCENT : ACCENT_SOFT }}
          />
        ))}
      </div>
      <p className="font-sans text-[0.68rem] uppercase tracking-[0.16em]" style={{ color: ACCENT }}>
        Step {i + 1} of 3
      </p>
      <h3 className="headline mt-1 text-[1.5rem]">{titleOverride ?? STEP_TITLES[i]}</h3>
    </div>
  );

  function renderStep(i: number): ReactNode {
    // Step 0 — contact details
    if (i === 0) {
      return (
        <>
          {stepHeader(0)}
          <div className="space-y-5">
            <div>
              <label className="block label mb-2">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="field"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block label mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="field"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block label mb-2">
                Phone <span className="normal-case tracking-normal text-muted">· optional</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="field"
                placeholder="(555) 123-4567"
              />
            </div>
            {/* Honeypot — hidden from humans, catches bots */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            />
          </div>
          <div className="mt-8 flex items-center justify-end">
            {primaryBtn("Continue", () => canLeaveDetails && go(1), !canLeaveDetails)}
          </div>
        </>
      );
    }

    // Step 1 — the inquiry
    if (i === 1) {
      return (
        <>
          {stepHeader(1)}
          <div>
            <label className="block label mb-2">What are you looking for?</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="field resize-none"
              placeholder="A short note on the project, the vibe, timeline, budget — whatever's on your mind."
            />
          </div>
          <div className="mt-8 flex items-center justify-between">
            {backBtn(0)}
            {primaryBtn("Continue", () => canLeaveInquiry && go(2), !canLeaveInquiry)}
          </div>
        </>
      );
    }

    // Step 2 — availability + follow-up preference
    if (i === 2) {
      return (
        <>
          {stepHeader(2, contactPref === "text" ? "Text follow-up" : "Pick a time")}

          {/* Follow-up preference */}
          <p className="label mb-2">How should we connect?</p>
          <div className="mb-6 grid grid-cols-2 gap-2">
            {([
              { key: "video", title: "Video call", sub: "Google Meet" },
              { key: "text", title: "Text follow-up", sub: "A quick thread" },
            ] as const).map((opt) => {
              const active = contactPref === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setContactPref(opt.key)}
                  className="rounded-[6px] border px-4 py-3 text-left transition-colors"
                  style={{
                    borderColor: active ? ACCENT : "var(--rule)",
                    background: active ? ACCENT_SOFT : "transparent",
                  }}
                >
                  <span className="block font-sans text-sm font-medium" style={{ color: active ? ACCENT_DEEP : "var(--ink)" }}>
                    {opt.title}
                  </span>
                  <span className="block font-sans text-xs text-muted">{opt.sub}</span>
                </button>
              );
            })}
          </div>

          {/* Inline phone capture when a text follow-up is chosen */}
          {contactPref === "text" && (
            <div className="mb-4">
              <label className="block label mb-2">Best number to text</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="field"
                placeholder="(555) 123-4567"
              />
              <p className="label normal-case tracking-normal mt-3" style={{ color: "var(--muted)" }}>
                Your note is ready to send — this opens Messages on your phone, or emails Joshua from a computer.
              </p>
            </div>
          )}

          {/* Scheduling — only for a video call. Text skips straight to sending. */}
          {contactPref !== "text" && (
            <>
              {/* Day strip — two weeks of weekdays, not a full calendar */}
              <p className="label mb-2">Pick a day</p>
              <div className="mb-5 flex flex-wrap gap-2">
                {days.map((d) => {
                  const active = selectedDate && d.toDateString() === selectedDate.toDateString();
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                      className="flex min-w-[4rem] flex-col items-center rounded-[6px] border px-3 py-2 transition-colors"
                      style={{
                        borderColor: active ? ACCENT : "var(--rule)",
                        background: active ? ACCENT : "transparent",
                        color: active ? "var(--paper)" : "var(--ink-soft)",
                      }}
                    >
                      <span className="font-sans text-[0.6rem] uppercase tracking-[0.1em] opacity-80">
                        {d.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                      <span className="font-sans text-sm numeral">
                        {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Time slots for the chosen day */}
              {selectedDate && (
                <div className="mb-2">
                  <p className="label mb-2">Pick a time · Eastern</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {slots.map((t) => {
                      const active = selectedTime === t;
                      const isTaken = (taken[ymd(selectedDate)] ?? []).includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={isTaken}
                          onClick={() => !isTaken && setSelectedTime(t)}
                          className="rounded-[6px] border px-2 py-2 font-sans text-sm numeral transition-colors disabled:cursor-not-allowed"
                          style={{
                            borderColor: active ? ACCENT : "var(--rule)",
                            background: active ? ACCENT : "transparent",
                            color: active ? "var(--paper)" : "var(--ink-soft)",
                            opacity: isTaken ? 0.35 : 1,
                            textDecoration: isTaken ? "line-through" : "none",
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {error && <p className="mt-4 font-sans text-sm text-earth">{error}</p>}

          <div className="mt-8 flex items-center justify-between">
            {backBtn(1)}
            {contactPref === "text"
              ? primaryBtn(submitting ? "Sending…" : "Send a text", sendText, !canConfirm || submitting)
              : primaryBtn(submitting ? "Booking…" : "Confirm booking", submitBooking, !canConfirm || submitting)}
          </div>
        </>
      );
    }

    // Step 3 — confirmation (branches on how it was sent)
    const eyebrow = outcome === "booked" ? "You're booked" : outcome === "texted" ? "Almost there" : "Message sent";
    const heading = outcome === "booked" ? "See you soon" : outcome === "texted" ? "Finish in Messages" : "Thanks — talk soon";
    return (
      <div className="py-4 text-center">
        <span
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: ACCENT_SOFT }}
        >
          {outcome === "texted" ? (
            <svg className="h-7 w-7" fill="none" stroke={ACCENT} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h8M8 14h5M21 12a8 8 0 01-11.6 7.1L3 20l1-5.3A8 8 0 1121 12z" />
            </svg>
          ) : (
            <svg className="h-7 w-7" fill="none" stroke={ACCENT} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <p className="eyebrow mb-2" style={{ color: ACCENT }}>{eyebrow}</p>
        <h3 className="headline mb-3 text-[1.6rem]">{heading}</h3>
        {outcome === "booked" && selectedDate && selectedTime && (
          <p className="font-sans text-sm text-ink-soft">
            {formatLong(selectedDate)} at {selectedTime} · Video call
          </p>
        )}
        <p className="label normal-case tracking-normal mt-2">
          {outcome === "booked" && `A confirmation is on its way to ${form.email}.`}
          {outcome === "texted" && "Hit send in your Messages app and Joshua will take it from there."}
          {outcome === "emailed" && "Your note is with Joshua — he'll reply by text shortly."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="btn mt-7"
          style={{ borderColor: ACCENT, color: ACCENT }}
        >
          Start over
        </button>
      </div>
    );
  }

  const frontVisible = !flipped;

  return (
    <div className="mx-auto max-w-lg">
      <div style={{ perspective: "1800px" }}>
        <div
          className="relative"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${flipped ? 180 : 0}deg)`,
            transition: "transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1), height 0.4s cubic-bezier(0.2, 0.7, 0.2, 1)",
            height,
          }}
        >
          {/* Front face */}
          <div
            className="absolute left-0 top-0 w-full"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", pointerEvents: frontVisible ? "auto" : "none" }}
            aria-hidden={!frontVisible}
          >
            <div
              ref={frontRef}
              className="surface p-7 sm:p-8"
              style={{ boxShadow: `inset 0 2px 0 0 ${ACCENT}` }}
            >
              {renderStep(frontStep)}
            </div>
          </div>

          {/* Back face */}
          <div
            className="absolute left-0 top-0 w-full"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", pointerEvents: frontVisible ? "none" : "auto" }}
            aria-hidden={frontVisible}
          >
            <div
              ref={backRef}
              className="surface p-7 sm:p-8"
              style={{ boxShadow: `inset 0 2px 0 0 ${ACCENT}` }}
            >
              {renderStep(backStep)}
            </div>
          </div>
        </div>
      </div>

      <p className="label normal-case tracking-normal mt-6 text-center">
        Prefer email?{" "}
        <a href="mailto:Josh@plusntrust.org" className="link-underline">
          Josh@plusntrust.org
        </a>
      </p>
    </div>
  );
}
