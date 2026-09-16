import { connectDB } from '@/lib/db'
import WeatherCache from '@/models/WeatherCache'

const LOCATION = 'weligama'
const LAT = 5.9738813
const LON = 80.4347476
const TTL_MS = 30 * 60 * 1000 // 30 minutes — current conditions, not a forecast.
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&timezone=auto`

/** WMO weather codes (used by Open-Meteo) collapsed into a short label. */
const WEATHER_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
}

export function weatherLabel(code: number) {
  return WEATHER_LABELS[code] ?? 'Weather unavailable'
}

/**
 * Cached in Mongo, same reasoning as the exchange-rate cache: this runs on
 * Vercel, where an in-memory cache would not survive between invocations.
 * Falls back to a stale cached reading if the upstream API is unreachable.
 */
export async function getWeligamaWeather(): Promise<{ tempC: number; weatherCode: number; fetchedAt: Date; stale: boolean } | null> {
  await connectDB()

  const cached = await WeatherCache.findOne({ location: LOCATION })
  const isFresh = cached && Date.now() - cached.fetchedAt.getTime() < TTL_MS
  if (isFresh) {
    return { tempC: cached.tempC, weatherCode: cached.weatherCode, fetchedAt: cached.fetchedAt, stale: false }
  }

  try {
    const res = await fetch(WEATHER_URL, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`Weather API returned ${res.status}`)
    const data = await res.json()
    const tempC = data?.current?.temperature_2m
    const weatherCode = data?.current?.weather_code
    if (typeof tempC !== 'number' || typeof weatherCode !== 'number') {
      throw new Error('Weather API response missing current conditions')
    }

    const fetchedAt = new Date()
    await WeatherCache.findOneAndUpdate(
      { location: LOCATION },
      { $set: { tempC, weatherCode, fetchedAt } },
      { upsert: true }
    )
    return { tempC, weatherCode, fetchedAt, stale: false }
  } catch (err: any) {
    console.error('Weather fetch failed:', err.message)
    if (cached) return { tempC: cached.tempC, weatherCode: cached.weatherCode, fetchedAt: cached.fetchedAt, stale: true }
    return null
  }
}
