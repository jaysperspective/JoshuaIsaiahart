"use client";

import { useState, useMemo } from "react";

interface BookingForm {
  name: string;
  phone: string;
  email: string;
  description: string;
}

const TIME_SLOTS = [
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
];

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CONTACT_ACCENT = "var(--accent-contact)";

export default function ContactClient() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(() => ({
    month: today.getMonth(),
    year: today.getFullYear(),
  }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState<BookingForm>({
    name: "",
    phone: "",
    email: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(currentMonth.year, currentMonth.month, 1);
    const lastOfMonth = new Date(currentMonth.year, currentMonth.month + 1, 0);
    const startDate = new Date(firstOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(lastOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const weeksArr: Date[][] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeksArr.push(week);
    }
    return weeksArr;
  }, [currentMonth]);

  const canGoPrev =
    currentMonth.year > today.getFullYear() ||
    (currentMonth.year === today.getFullYear() && currentMonth.month > today.getMonth());

  function prevMonth() {
    if (!canGoPrev) return;
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 };
      return { month: prev.month - 1, year: prev.year };
    });
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1 };
      return { month: prev.month + 1, year: prev.year };
    });
  }

  function handleDateClick(date: Date) {
    if (!isWeekday(date) || date < today) return;
    setSelectedDate(date);
    setSelectedTime(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          time: selectedTime,
          ...form,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to book consultation");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="neu-card p-10 text-center"
        style={{ borderLeftWidth: "4px", borderLeftColor: CONTACT_ACCENT }}
      >
        <div className="text-3xl mb-3" style={{ color: CONTACT_ACCENT }}>✓</div>
        <h2 className="font-heading text-xl font-semibold text-[var(--foreground)] mb-2">
          Consultation booked
        </h2>
        <p className="font-body text-sm text-[var(--text-muted)] mb-1">
          {formatDate(selectedDate!)} at {selectedTime}
        </p>
        <p className="font-body text-sm text-[var(--text-faint)]">
          A confirmation email has been sent to {form.email}
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setSelectedDate(null);
            setSelectedTime(null);
            setForm({ name: "", phone: "", email: "", description: "" });
          }}
          className="neu-button mt-6 px-4 py-2 font-body text-sm font-medium text-[var(--foreground)]"
          style={{ borderLeftWidth: "3px", borderLeftColor: CONTACT_ACCENT }}
        >
          Book another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Contact info */}
      <article
        className="neu-card p-6"
        style={{ borderLeftWidth: "4px", borderLeftColor: CONTACT_ACCENT }}
      >
        <div className="flex items-center gap-2 text-[11px] mb-3">
          <span
            className="font-medium px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-body"
            style={{ color: CONTACT_ACCENT, border: `1px solid ${CONTACT_ACCENT}` }}
          >
            Contact
          </span>
        </div>
        <h2 className="font-heading text-xl font-semibold text-[var(--foreground)] mb-3">
          Get in touch
        </h2>
        <div className="space-y-1.5 font-body text-sm">
          <p className="text-[var(--text-muted)]">
            <span className="text-[var(--text-faint)] uppercase tracking-wide text-xs mr-3">Name</span>
            <span className="text-[var(--foreground)]">Joshua</span>
          </p>
          <p className="text-[var(--text-muted)]">
            <span className="text-[var(--text-faint)] uppercase tracking-wide text-xs mr-3">Email</span>
            <a
              href="mailto:Josh@plusntrust.org"
              className="text-[var(--foreground)] hover:underline underline-offset-2"
            >
              Josh@plusntrust.org
            </a>
          </p>
        </div>
      </article>

      {/* Booking */}
      <article
        className="neu-card p-6"
        style={{ borderLeftWidth: "4px", borderLeftColor: CONTACT_ACCENT }}
      >
        <h2 className="font-heading text-xl font-semibold text-[var(--foreground)] mb-1">
          Book a consultation
        </h2>
        <p className="font-body text-xs text-[var(--text-muted)] uppercase tracking-wide mb-6">
          30-minute Google Meet · Weekdays 3 PM – 7 PM
        </p>

        {/* Calendar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="neu-button p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-heading text-base font-medium text-[var(--foreground)]">
              {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
            </span>
            <button
              onClick={nextMonth}
              className="neu-button p-1.5"
              aria-label="Next month"
            >
              <svg className="w-4 h-4 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="text-center font-body text-[10px] uppercase tracking-wide text-[var(--text-faint)] py-1"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weeks.flat().map((date, i) => {
              const inMonth = date.getMonth() === currentMonth.month;
              const weekday = isWeekday(date);
              const past = date < today;
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              const clickable = inMonth && weekday && !past;

              const baseClass = "aspect-square flex items-center justify-center rounded-sm font-body text-sm transition-all";
              let stateClass = "";
              const inlineStyle: React.CSSProperties = {};

              if (!inMonth) {
                stateClass = "text-[var(--text-faint)]/40 cursor-default";
              } else if (!weekday) {
                stateClass = "text-[var(--text-faint)]/50 cursor-default";
              } else if (past) {
                stateClass = "text-[var(--text-faint)]/40 cursor-default";
              } else if (isSelected) {
                stateClass = "text-[var(--background)] font-semibold cursor-pointer";
                inlineStyle.background = CONTACT_ACCENT;
              } else {
                stateClass = "text-[var(--foreground)] cursor-pointer hover:bg-[var(--card-bg-hover)]";
                inlineStyle.border = "1px solid var(--border-color)";
              }

              if (isToday && !isSelected && clickable) {
                inlineStyle.borderColor = CONTACT_ACCENT;
              }

              return (
                <button
                  key={i}
                  onClick={() => clickable && handleDateClick(date)}
                  disabled={!clickable}
                  className={`${baseClass} ${stateClass}`}
                  style={inlineStyle}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="mb-6">
            <p className="font-body text-xs uppercase tracking-wide text-[var(--text-muted)] mb-3">
              Available times for {formatDate(selectedDate)}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => {
                const active = selectedTime === time;
                return (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className="neu-button px-3 py-2 font-body text-sm font-medium"
                    style={{
                      color: active ? "var(--background)" : "var(--foreground)",
                      background: active ? CONTACT_ACCENT : undefined,
                      borderColor: active ? CONTACT_ACCENT : undefined,
                    }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Form */}
        {selectedDate && selectedTime && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="neu-input w-full px-3 py-2 text-sm focus:border-[var(--accent-contact)]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block font-body text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="neu-input w-full px-3 py-2 text-sm focus:border-[var(--accent-contact)]"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div>
              <label className="block font-body text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="neu-input w-full px-3 py-2 text-sm focus:border-[var(--accent-contact)]"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block font-body text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                What are you looking for?
              </label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="neu-input w-full px-3 py-2 text-sm focus:border-[var(--accent-contact)] resize-none"
                placeholder="Brief description of what you're looking for..."
              />
            </div>

            {error && (
              <p className="font-body text-sm" style={{ color: "var(--accent-videography)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="neu-button w-full py-3 font-body text-sm font-medium text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderLeftWidth: "3px", borderLeftColor: CONTACT_ACCENT }}
            >
              {submitting ? "Booking..." : "Book consultation"}
            </button>
          </form>
        )}
      </article>
    </div>
  );
}
