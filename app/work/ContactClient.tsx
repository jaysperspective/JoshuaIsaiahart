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

function getWeeksFromDate(start: Date, numWeeks: number): Date[][] {
  const weeks: Date[][] = [];
  const current = new Date(start);
  // Start from the beginning of the week (Sunday)
  current.setDate(current.getDate() - current.getDay());

  for (let w = 0; w < numWeeks; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

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
      <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-12 text-center">
        <div className="text-4xl mb-4">&#10003;</div>
        <p className="font-heading text-xl font-semibold text-white mb-2">
          Consultation Booked
        </p>
        <p className="font-body text-white/50 text-sm mb-1">
          {formatDate(selectedDate!)} at {selectedTime}
        </p>
        <p className="font-body text-white/40 text-sm">
          A confirmation email has been sent to {form.email}
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setSelectedDate(null);
            setSelectedTime(null);
            setForm({ name: "", phone: "", email: "", description: "" });
          }}
          className="mt-6 px-6 py-2.5 rounded-full font-body text-sm bg-white/10 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Contact Info */}
      <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-8">
        <h2 className="font-heading text-xl font-semibold text-white mb-4">
          Contact
        </h2>
        <div className="space-y-2 font-body text-sm">
          <p className="text-white/70">
            <span className="text-white/40 mr-3">Name</span> Joshua
          </p>
          <p className="text-white/70">
            <span className="text-white/40 mr-3">Email</span>{" "}
            <a
              href="mailto:Josh@plusntrust.org"
              className="hover:text-white transition-colors underline underline-offset-2"
            >
              Josh@plusntrust.org
            </a>
          </p>
        </div>
      </div>

      {/* Booking Section */}
      <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-8">
        <h2 className="font-heading text-xl font-semibold text-white mb-2">
          Book a Consultation
        </h2>
        <p className="font-body text-white/40 text-sm mb-6">
          30-minute Google Meet session &middot; Weekdays 3 PM &ndash; 7 PM
        </p>

        {/* Calendar */}
        <div className="mb-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              disabled={!canGoPrev}
              className={`p-1.5 rounded-full transition-colors ${
                canGoPrev
                  ? "text-white/60 hover:text-white hover:bg-white/10"
                  : "text-white/15 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-heading text-white text-base font-medium">
              {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="text-center font-body text-xs text-white/30 py-1"
              >
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
                    aspect-square flex items-center justify-center rounded-lg font-body text-sm transition-all
                    ${!inMonth ? "text-white/10" : ""}
                    ${inMonth && !weekday ? "text-white/15" : ""}
                    ${inMonth && weekday && past ? "text-white/20" : ""}
                    ${clickable && !isSelected ? "text-white/70 hover:bg-white/10 hover:text-white cursor-pointer" : ""}
                    ${isSelected ? "bg-white/20 text-white font-medium" : ""}
                    ${isToday && !isSelected ? "ring-1 ring-white/30" : ""}
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
            <p className="font-body text-white/50 text-sm mb-3">
              Available times for {formatDate(selectedDate)}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-3 py-2.5 rounded-lg font-body text-sm transition-all ${
                    selectedTime === time
                      ? "bg-white/20 text-white font-medium"
                      : "bg-white/[0.04] text-white/50 hover:bg-white/10 hover:text-white"
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-white/40 text-xs mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-4 py-2.5 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block font-body text-white/40 text-xs mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-4 py-2.5 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div>
              <label className="block font-body text-white/40 text-xs mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-4 py-2.5 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block font-body text-white/40 text-xs mb-1.5">
                What are you looking for?
              </label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-4 py-2.5 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
                placeholder="Brief description of what you're looking for..."
              />
            </div>

            {error && (
              <p className="font-body text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full font-body text-sm font-medium bg-white/15 hover:bg-white/20 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Booking..." : "Book Consultation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
