import "server-only";

/**
 * A fixed-window limiter for the sign-in endpoints.
 *
 * Both of them verify a scrypt hash, so an unlimited guess rate is two problems
 * at once: credentials can be attacked offline-fast, and every attempt spends
 * real CPU on a function someone else is paying for.
 *
 * It is honest about what it is: counters in memory, so the window is per
 * running instance rather than per deployment. On a platform that reuses
 * instances across requests that still blunts a sustained attack from one
 * address considerably; it is not a substitute for a shared counter or a WAF
 * rule, and should be replaced by one when there is somewhere to keep state.
 * Only failures are counted, so a member signing in normally never meets it.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Stops the map growing without bound on a long-lived instance. */
const sweep = (now: number) => {
  if (windows.size < 2048) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
};

export type Limit = { limit: number; windowMs: number };

/** Ten wrong passwords in fifteen minutes is a person; a hundred is not. */
export const SIGN_IN_LIMIT: Limit = { limit: 10, windowMs: 15 * 60 * 1000 };

export type LimitResult =
  { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** Records nothing — asks whether this key is currently locked out. */
export function checkLimit(key: string, { limit }: Limit): LimitResult {
  const now = Date.now();
  const window = windows.get(key);
  if (!window || window.resetAt <= now) return { allowed: true };
  if (window.count < limit) return { allowed: true };
  return {
    allowed: false,
    retryAfterSeconds: Math.ceil((window.resetAt - now) / 1000),
  };
}

/** Counts one failure against the key. */
export function recordFailure(key: string, { windowMs }: Limit): void {
  const now = Date.now();
  sweep(now);
  const window = windows.get(key);
  if (!window || window.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  window.count += 1;
}

/** A successful sign-in clears the count, so one typo costs nothing later. */
export function clearFailures(key: string): void {
  windows.delete(key);
}

/**
 * The client's address as the platform reports it.
 *
 * `x-forwarded-for` is set by Vercel's proxy and cannot be trusted in general,
 * but the alternative here is not limiting at all. The address is combined with
 * the audience so a member and a staff attempt from the same office do not
 * share a budget.
 */
export function clientKey(request: Request, audience: string): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const address = forwarded.split(",")[0].trim() || "unknown";
  return `${audience}:${address}`;
}
