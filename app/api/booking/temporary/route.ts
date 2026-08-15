export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import bookingService from '@/services/booking.service'
import { signHoldToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const reservation = await bookingService.temporaryReserve(body)

    // Only the client that placed the hold can release it.
    const holdToken = await signHoldToken(reservation['booking_id'])

    return NextResponse.json({ success: true, reservation, holdToken })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
