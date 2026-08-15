/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * LIMITATION: state lives in the process, so on serverless each warm instance
 * keeps its own counter and a cold start resets it. It raises the cost of a
 * brute-force attempt but does not make one impossible. For a hard guarantee
 * this needs shared state (Upstash Redis, Vercel KV, or the MongoDB you already
 * run). Treat this as defence in depth, not as the whole defence.
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
