export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import bookingService from '@/services/booking.service'
import { verifyHoldToken } from '@/lib/auth'

/**
 * Releasing a hold requires the token issued when it was created. Without it,
 * anyone holding a booking id could cancel a stranger's hold mid-checkout.
 * There is no account to check instead: a hold is created before the guest
 * identifies themselves.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { bookingId, holdToken } = await request.json()

    if (!bookingId || typeof bookingId !== 'string') {
      return NextResponse.json({ success: false, message: 'Booking ID required' }, { status: 400 })
    }

    if (!holdToken || !(await verifyHoldToken(String(holdToken), bookingId))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    await bookingService.releaseTemporary(bookingId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
