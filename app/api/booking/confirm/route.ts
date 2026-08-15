export const runtime = 'nodejs'

// Chrome renders the invoice PDF inside the after() callback; the default 10s
// is not enough headroom for a cold start plus the SMTP round trip.
export const maxDuration = 60

import { NextRequest, NextResponse, after } from 'next/server'
import { connectDB } from '@/lib/db'
import bookingService from '@/services/booking.service'
import NotificationService from '@/services/notification.service'
import ActivityLogService from '@/services/activityLog.service'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const reservation = await bookingService.confirmReservation(body)

    await NotificationService.create({
      type: 'BOOKING_NEW',
      message: `New booking confirmed: ${reservation.booking_id}`,
      entityId: reservation.booking_id,
      entityType: 'Booking',
    })

    await ActivityLogService.log('CONFIRM_BOOKING', 'Booking', reservation.booking_id, `Booking confirmed`)

    // Runs after the response is sent (Vercel keeps the invocation alive via
    // waitUntil), so a slow PDF render or SMTP handshake never delays or fails
    // the guest's confirmation.
    if (reservation.email) {
      after(async () => {
        await bookingService.sendConfirmationEmail(reservation.email)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Room reservation has successful',
      token: reservation.token,
      booking_id: reservation.booking_id,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
