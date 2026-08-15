import LoginAttempt from '@/models/LoginAttempt'

/**
 * Fixed-window rate limiting.
 *
 * `rateLimitShared` counts in MongoDB, so the window holds across serverless
 * instances and survives cold starts. `rateLimit` is the in-memory fallback,
 * used only when the database is unreachable — per-process and therefore
 * weaker, but better than counting nothing.
 */

type Entry = { count: number; resetAt: number }

const buckets = new Map<string, Entry>()

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  entry.count += 1
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds }
  }

  return { allowed: true, remaining: limit - entry.count, retryAfterSeconds }
}

/**
 * Shared-state limiter. One atomic upsert per call: the window is created if
 * absent or expired, otherwise the counter increments. Because the read and the
 * increment happen in a single findOneAndUpdate, concurrent requests across
 * instances cannot race past the limit.
 *
 * Falls back to the in-memory limiter if Mongo is unavailable, so a database
 * blip cannot lock every admin out of logging in.
 */
export async function rateLimitShared(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date()

  try {
    const existing = await LoginAttempt.findOneAndUpdate(
      { key, resetAt: { $gt: now } },
      { $inc: { count: 1 } },
      { new: true }
    )

    if (existing) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000))
      if (existing.count > limit) {
        return { allowed: false, remaining: 0, retryAfterSeconds }
      }
      return { allowed: true, remaining: limit - existing.count, retryAfterSeconds }
    }

    // No live window: start a new one (upsert also replaces an expired row).
    await LoginAttempt.findOneAndUpdate(
      { key },
      { $set: { count: 1, resetAt: new Date(now.getTime() + windowMs) } },
      { upsert: true }
    )
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  } catch (err: any) {
    console.error('Shared rate limit unavailable, falling back to in-memory:', err.message)
    return rateLimit(key, limit, windowMs)
  }
}

/** Best-effort client IP from proxy headers. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

// Keep the map from growing without bound under sustained traffic.
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of buckets) {
    if (now >= entry.resetAt) buckets.delete(key)
  }
}, 60_000).unref?.()
