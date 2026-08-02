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

  const canGoPrev = currentMonth.year > today.getFullYear() ||
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
      <div className="surface p-12 text-center">
        <p className="eyebrow mb-3">Confirmed</p>
        <p className="headline mb-3">Consultation Booked</p>
        <p className="font-sans text-sm text-ink-soft mb-1">
          {formatDate(selectedDate!)} at {selectedTime}
        </p>
        <p className="label normal-case tracking-normal">
          A confirmation email has been sent to {form.email}
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setSelectedDate(null);
            setSelectedTime(null);
            setForm({ name: "", phone: "", email: "", description: "" });
          }}
          className="btn mt-7"
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-12">
      {/* Contact Info */}
      <div>
        <h2 className="label mb-4">Contact</h2>
        <hr className="rule mb-5" />
        <dl className="grid gap-2 font-sans text-sm sm:grid-cols-[6rem_1fr]">
          <dt className="label">Name</dt>
          <dd className="text-ink-soft">Joshua</dd>
          <dt className="label">Email</dt>
          <dd>
            <a href="mailto:Josh@plusntrust.org" className="link-underline">
              Josh@plusntrust.org
            </a>
          </dd>
        </dl>
      </div>

      {/* Booking Section */}
      <div>
        <h2 className="headline mb-2">Book a Consultation</h2>
        <p className="label normal-case tracking-normal mb-6">
          30-minute Google Meet session · Weekdays 3 PM – 7 PM
        </p>

        {/* Calendar */}
        <div className="surface p-6 mb-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              disabled={!canGoPrev}
              className={`p-1.5 rounded-full transition-colors ${
                canGoPrev
                  ? "text-ink-soft hover:text-accent hover:bg-paper-2"
                  : "text-muted/30 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-display text-lg font-medium text-emerald">
              {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-full text-ink-soft hover:text-accent hover:bg-paper-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center label text-[0.6rem] py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {weeks.flat().map((date, i) => {
              const inMonth = date.getMonth() === currentMonth.month;
              const weekday = isWeekday(date);
              const past = date < today;
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              const clickable = inMonth && weekday && !past;

              return (
                <button
                  key={i}
                  onClick={() => clickable && handleDateClick(date)}
                  disabled={!clickable}
                  className={`
                    aspect-square flex items-center justify-center rounded-[3px] font-sans text-sm numeral transition-all
                    ${!inMonth ? "text-muted/25" : ""}
                    ${inMonth && !weekday ? "text-muted/30" : ""}
                    ${inMonth && weekday && past ? "text-muted/40" : ""}
                    ${clickable && !isSelected ? "text-ink-soft hover:bg-paper-2 hover:text-accent cursor-pointer" : ""}
                    ${isSelected ? "bg-emerald text-paper font-medium" : ""}
                    ${isToday && !isSelected ? "ring-1 ring-accent/40" : ""}
                    ${!clickable ? "cursor-default" : ""}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="mb-6">
            <p className="label mb-3">
              Available times for {formatDate(selectedDate)}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-3 py-2.5 rounded-[3px] font-sans text-sm numeral border transition-all ${
                    selectedTime === time
                      ? "bg-emerald border-emerald text-paper font-medium"
                      : "border-rule text-ink-soft hover:border-accent hover:text-accent"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Booking Form */}
        {selectedDate && selectedTime && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block label mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="field"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block label mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="field"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div>
              <label className="block label mb-2">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="field"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block label mb-2">What are you looking for?</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="field resize-none"
                placeholder="Brief description of what you're looking for..."
              />
            </div>

            {error && <p className="font-sans text-sm text-earth">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-accent w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Booking..." : "Book Consultation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
