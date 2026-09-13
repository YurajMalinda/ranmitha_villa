export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getExchangeRates } from '@/lib/exchange-rates'
import { BASE_CURRENCY } from '@/lib/currency'

export async function GET() {
  try {
    const { rates, fetchedAt, stale } = await getExchangeRates()
    return NextResponse.json({ success: true, base: BASE_CURRENCY, rates, fetchedAt, stale })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
