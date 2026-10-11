// In-memory sliding-window rate limiter.
//
// Suitable for this single-instance systemd Node app: state lives in one
// process, so limits are per-process (not shared across a cluster). If the app
// is ever horizontally scaled, swap this for a shared store (Redis/Upstash).

interface Entry {
  // Timestamps (ms) of hits still inside the current window, oldest first.
  hits: number[];
}

const buckets = new Map<string, Entry>();

// Occasionally drop fully-expired buckets so the Map doesn't grow unbounded.
let lastPrune = 0;
function prune(now: number, windowMs: number) {
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [key, entry] of buckets) {
    if (entry.hits.length === 0 || now - entry.hits[entry.hits.length - 1] > windowMs) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterMs: number;
}

/**
 * Sliding-window limiter. Returns `ok: false` once `limit` hits have occurred
 * within the trailing `windowMs` for a given `key`. On rejection, `retryAfterMs`
 * is how long until the oldest in-window hit ages out.
 */
export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): RateLimitResult {
  const { limit, windowMs } = opts;
  const now = Date.now();
  prune(now, windowMs);

  const entry = buckets.get(key) ?? { hits: [] };
  // Drop hits that have aged out of the window.
  entry.hits = entry.hits.filter((t) => now - t < windowMs);

  if (entry.hits.length >= limit) {
    buckets.set(key, entry);
    const retryAfterMs = windowMs - (now - entry.hits[0]);
    return { ok: false, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  entry.hits.push(now);
  buckets.set(key, entry);
  return { ok: true, retryAfterMs: 0 };
}

/** First hop of X-Forwarded-For, or "unknown". */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}
