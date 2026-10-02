// Shared booking availability config — used by the public booking card,
// the availability API, and the admin editor. Stored as JSON in
// Settings.bookingConfig; falls back to these defaults.

export interface BookingConfig {
  days: number[]; // allowed weekdays, 0=Sun..6=Sat
  startMinutes: number; // first slot start, minutes from midnight (Eastern)
  endMinutes: number; // slots end by this time
  slotMinutes: number; // slot length
  windowDays: number; // how many days out to offer
}

export const DEFAULT_BOOKING_CONFIG: BookingConfig = {
  days: [1, 2, 3, 4, 5], // Mon–Fri
  startMinutes: 15 * 60, // 3:00 PM
  endMinutes: 19 * 60, // 7:00 PM
  slotMinutes: 30,
  windowDays: 14,
};

export function to12h(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** "15:30" -> minutes from midnight; null if malformed. */
export function hhmmToMinutes(s: string): number | null {
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function minutesToHHMM(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

/** The ordered list of 12h time-slot labels implied by a config. */
export function generateSlots(cfg: BookingConfig): string[] {
  const out: string[] = [];
  for (let t = cfg.startMinutes; t + cfg.slotMinutes <= cfg.endMinutes; t += cfg.slotMinutes) {
    out.push(to12h(t));
  }
  return out;
}

/** Merge a possibly-partial stored config over the defaults, with light validation. */
export function resolveConfig(raw: unknown): BookingConfig {
  const c = { ...DEFAULT_BOOKING_CONFIG };
  if (raw && typeof raw === "object") {
    const r = raw as Partial<BookingConfig>;
    if (Array.isArray(r.days) && r.days.every((d) => typeof d === "number" && d >= 0 && d <= 6)) {
      c.days = r.days;
    }
    if (typeof r.startMinutes === "number") c.startMinutes = r.startMinutes;
    if (typeof r.endMinutes === "number") c.endMinutes = r.endMinutes;
    if (typeof r.slotMinutes === "number" && r.slotMinutes > 0) c.slotMinutes = r.slotMinutes;
    if (typeof r.windowDays === "number" && r.windowDays > 0) c.windowDays = Math.min(60, r.windowDays);
  }
  // Guard against inverted/empty ranges.
  if (c.endMinutes <= c.startMinutes) {
    c.startMinutes = DEFAULT_BOOKING_CONFIG.startMinutes;
    c.endMinutes = DEFAULT_BOOKING_CONFIG.endMinutes;
  }
  return c;
}
