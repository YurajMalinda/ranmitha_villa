export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getWeligamaWeather, weatherLabel } from '@/lib/weather'

export async function GET() {
  try {
    const weather = await getWeligamaWeather()
    if (!weather) {
      return NextResponse.json({ success: false, message: 'Weather unavailable' }, { status: 503 })
    }
    return NextResponse.json({
      success: true,
      tempC: Math.round(weather.tempC),
      label: weatherLabel(weather.weatherCode),
      weatherCode: weather.weatherCode,
      fetchedAt: weather.fetchedAt,
      stale: weather.stale,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
