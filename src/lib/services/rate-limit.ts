/**
 * Rate limiting service.
 *
 * Default implementation: in-memory sliding window, sufficient for a single-
 * instance deployment (e.g. one Vercel serverless region with no horizontal
 * scaling, or a single VPS process). It intentionally lives behind the
 * `RateLimiter` interface so swapping to a distributed limiter (Upstash
 * Redis, etc.) for a multi-instance production deployment is a one-file
 * change — nothing that calls `limit()` needs to know which backend is used.
 *
 * Production (multi-instance) upgrade: set UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN (see .env.example) and this module automatically
 * switches to the Upstash-backed limiter below — no code change needed. If
 * those vars are absent, it falls back to the in-memory limiter and says so
 * once in the server log, rather than silently behaving as if Redis were
 * configured when it isn't.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimiter {
  limit(key: string, max: number, windowMs: number): Promise<RateLimitResult>;
}

class InMemoryRateLimiter implements RateLimiter {
  async limit(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true, remaining: max - 1, resetAt: now + windowMs };
    }

    if (existing.count >= max) {
      return { success: false, remaining: 0, resetAt: existing.resetAt };
    }

    existing.count += 1;
    return { success: true, remaining: max - existing.count, resetAt: existing.resetAt };
  }
}

/**
 * Upstash Redis REST-based limiter — no SDK dependency, just fetch, since
 * Upstash's REST API is plain HTTP (ideal for serverless: no persistent TCP
 * connection to manage). Uses INCR + EXPIRE for a fixed-window counter,
 * pipelined into a single request per `limit()` call.
 */
class UpstashRateLimiter implements RateLimiter {
  constructor(private url: string, private token: string) {}

  async limit(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
    const windowSeconds = Math.ceil(windowMs / 1000);
    const redisKey = `ratelimit:${key}`;

    // Pipeline: INCR then EXPIRE NX (only sets TTL on the first hit in the
    // window, so later hits don't keep pushing the reset time out).
    const res = await fetch(`${this.url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, String(windowSeconds), "NX"],
      ]),
    });

    if (!res.ok) {
      // Fail open rather than 500ing a login/contact form if Upstash is
      // briefly unreachable — but log it, since silent fail-open on a
      // security-relevant limiter shouldn't go unnoticed.
      console.error(`Upstash rate limit request failed (${res.status}); allowing request.`);
      return { success: true, remaining: max, resetAt: Date.now() + windowMs };
    }

    const [incrResult] = (await res.json()) as { result: number }[];
    const count = incrResult.result;
    const resetAt = Date.now() + windowMs;

    if (count > max) {
      return { success: false, remaining: 0, resetAt };
    }
    return { success: true, remaining: max - count, resetAt };
  }
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!upstashUrl || !upstashToken) {
  // Logged once at module load, not on every request — visible in server
  // logs/build output without being noisy. Never claims Redis is active
  // when it isn't.
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set — using the in-memory rate limiter. " +
      "Fine for a single instance; set both env vars for multi-instance production deployments."
  );
}

export const rateLimiter: RateLimiter =
  upstashUrl && upstashToken ? new UpstashRateLimiter(upstashUrl, upstashToken) : new InMemoryRateLimiter();

/** Preset: admin login — 5 attempts per 10 minutes per IP+email combo. */
export function limitLogin(identifier: string) {
  return rateLimiter.limit(`login:${identifier}`, 5, 10 * 60 * 1000);
}

/** Preset: public contact form — 3 submissions per hour per IP. */
export function limitContact(identifier: string) {
  return rateLimiter.limit(`contact:${identifier}`, 3, 60 * 60 * 1000);
}

/** Preset: password change — 5 attempts per 15 minutes per authenticated user (guards against brute-forcing the current-password check). */
export function limitPasswordChange(userId: string) {
  return rateLimiter.limit(`password-change:${userId}`, 5, 15 * 60 * 1000);
}
