export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
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
