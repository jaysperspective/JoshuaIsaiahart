"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DEFAULT_BOOKING_CONFIG,
  minutesToHHMM,
  hhmmToMinutes,
  type BookingConfig,
} from "@/app/lib/booking-config";

interface Booking {
  id: string;
  date: string;
  dateYmd: string | null;
  time: string;
  name: string;
  email: string;
  phone: string | null;
  description: string;
  contactPref: string;
  status: string;
  createdAt: string;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_STYLE: Record<string, string> = {
  new: "bg-[#547890] text-white",
  done: "bg-[#2f6b4f] text-white",
  cancelled: "bg-gray-300 text-gray-600",
};

export default function BookingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cfg, setCfg] = useState<BookingConfig>(DEFAULT_BOOKING_CONFIG);
  const [savingCfg, setSavingCfg] = useState(false);
  const [cfgSaved, setCfgSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        fetch("/api/booking/list"),
        fetch("/api/booking/config"),
      ]);
      if (bRes.ok) setBookings(await bRes.json());
      if (cRes.ok) setCfg(await cRes.json());
    } catch {
      // leave defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/booking/list", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this booking?")) return;
    const res = await fetch(`/api/booking/list?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) setBookings((bs) => bs.filter((b) => b.id !== id));
  }

  async function saveConfig() {
    setSavingCfg(true);
    setCfgSaved(false);
    try {
      const res = await fetch("/api/booking/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (res.ok) {
        setCfg(await res.json());
        setCfgSaved(true);
        setTimeout(() => setCfgSaved(false), 2500);
      }
    } finally {
      setSavingCfg(false);
    }
  }

  function toggleDay(d: number) {
    setCfg((c) => ({
      ...c,
      days: c.days.includes(d) ? c.days.filter((x) => x !== d) : [...c.days, d].sort(),
    }));
  }

  const upcoming = bookings.filter((b) => new Date(b.date) >= new Date(Date.now() - 86400000) && b.status !== "cancelled");
  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-8">
      {/* Availability config */}
      <div className="card card-white p-10">
        <h2 className="font-heading text-xl font-bold mb-2">Availability</h2>
        <p className="font-body text-[#6b6b6b] mb-6">
          The window the booking card offers. Times are Eastern.
        </p>

        <div className="mb-5">
          <label className="font-body text-sm text-gray-600 block mb-2">Days</label>
          <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map((label, d) => {
              const on = cfg.days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className="px-3 py-1.5 rounded-lg font-body text-sm border transition-colors"
                  style={{
                    background: on ? "#547890" : "transparent",
                    borderColor: on ? "#547890" : "#d1d5db",
                    color: on ? "#fff" : "#374151",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="font-body text-sm text-gray-600 block mb-2">Start</label>
            <input
              type="time"
              value={minutesToHHMM(cfg.startMinutes)}
              onChange={(e) => {
                const m = hhmmToMinutes(e.target.value);
                if (m !== null) setCfg((c) => ({ ...c, startMinutes: m }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl font-body focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="font-body text-sm text-gray-600 block mb-2">End</label>
            <input
              type="time"
              value={minutesToHHMM(cfg.endMinutes)}
              onChange={(e) => {
                const m = hhmmToMinutes(e.target.value);
                if (m !== null) setCfg((c) => ({ ...c, endMinutes: m }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl font-body focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="font-body text-sm text-gray-600 block mb-2">Slot (min)</label>
            <input
              type="number"
              min={5}
              step={5}
              value={cfg.slotMinutes}
              onChange={(e) => setCfg((c) => ({ ...c, slotMinutes: Math.max(5, parseInt(e.target.value || "30", 10)) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl font-body focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="font-body text-sm text-gray-600 block mb-2">Window (days)</label>
            <input
              type="number"
              min={1}
              max={60}
              value={cfg.windowDays}
              onChange={(e) => setCfg((c) => ({ ...c, windowDays: Math.min(60, Math.max(1, parseInt(e.target.value || "14", 10))) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl font-body focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        <button
          onClick={saveConfig}
          disabled={savingCfg}
          className="mt-6 bg-[#1a1a1a] text-white px-6 py-3 rounded-xl font-body hover:bg-[#333] transition-colors disabled:opacity-50"
        >
          {savingCfg ? "Saving..." : cfgSaved ? "Saved ✓" : "Save availability"}
        </button>
      </div>

      {/* Bookings list */}
      <div className="card card-white p-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-xl font-bold mb-1">Bookings</h2>
            <p className="font-body text-[#6b6b6b]">
              {upcoming.length} upcoming · {bookings.length} total
            </p>
          </div>
          <button onClick={load} className="font-body text-sm text-gray-500 hover:text-gray-800">
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="font-body text-gray-400">Loading…</p>
        ) : bookings.length === 0 ? (
          <p className="font-body text-gray-400">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="border border-gray-200 rounded-xl p-4"
                style={{ opacity: b.status === "cancelled" ? 0.55 : 1 }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-gray-900">{b.name}</span>
                      <span className={`text-[0.65rem] uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLE[b.status] || "bg-gray-200 text-gray-600"}`}>
                        {b.status}
                      </span>
                      <span className="text-[0.65rem] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {b.contactPref === "text" ? "Text" : "Video"}
                      </span>
                    </div>
                    <p className="font-body text-sm text-gray-700 mt-1">
                      {fmtDate(b.date)} · {b.time}
                    </p>
                    <p className="font-body text-sm text-gray-500">
                      <a href={`mailto:${b.email}`} className="underline">{b.email}</a>
                      {b.phone ? ` · ${b.phone}` : ""}
                    </p>
                    {b.description && (
                      <p className="font-body text-sm text-gray-600 mt-2 max-w-xl whitespace-pre-wrap">{b.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {b.status !== "done" && (
                      <button onClick={() => setStatus(b.id, "done")} className="font-body text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">
                        Done
                      </button>
                    )}
                    {b.status !== "cancelled" ? (
                      <button onClick={() => setStatus(b.id, "cancelled")} className="font-body text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">
                        Cancel
                      </button>
                    ) : (
                      <button onClick={() => setStatus(b.id, "new")} className="font-body text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">
                        Restore
                      </button>
                    )}
                    <button onClick={() => remove(b.id)} className="font-body text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
