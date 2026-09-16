import { connectDB } from '@/lib/db'
import ExchangeRate from '@/models/ExchangeRate'
import { BASE_CURRENCY } from '@/lib/currency'

const TTL_MS = 6 * 60 * 60 * 1000 // 6 hours — fine for a display estimate, not a live rate feed.
const RATES_URL = `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`

/**
 * Cached in Mongo (not memory) because this runs on Vercel — a serverless
 * instance's memory does not survive between invocations, so an in-memory
 * cache would refetch on almost every request.
 *
 * Falls back to a stale cached rate set if the upstream API is unreachable,
 * rather than breaking price display on a transient outage.
 */
export async function getExchangeRates(): Promise<{ rates: Record<string, number>; fetchedAt: Date; stale: boolean }> {
  await connectDB()

  const cached = await ExchangeRate.findOne({ base: BASE_CURRENCY })
  const isFresh = cached && Date.now() - cached.fetchedAt.getTime() < TTL_MS
  if (isFresh) {
    return { rates: cached.rates, fetchedAt: cached.fetchedAt, stale: false }
  }

  try {
    const res = await fetch(RATES_URL, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`Exchange rate API returned ${res.status}`)
    const data = await res.json()
    if (!data?.rates) throw new Error('Exchange rate API response missing rates')

    const fetchedAt = new Date()
    await ExchangeRate.findOneAndUpdate(
      { base: BASE_CURRENCY },
      { $set: { rates: data.rates, fetchedAt } },
      { upsert: true }
    )
    return { rates: data.rates, fetchedAt, stale: false }
  } catch (err: any) {
    console.error('Exchange rate fetch failed:', err.message)
    if (cached) return { rates: cached.rates, fetchedAt: cached.fetchedAt, stale: true }
    // No cache and no live data: caller must treat this as conversion unavailable.
    return { rates: {}, fetchedAt: new Date(0), stale: true }
  }
}
