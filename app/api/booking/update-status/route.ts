export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import bookingService from '@/services/booking.service'
import ActivityLogService from '@/services/activityLog.service'
import NotificationService from '@/services/notification.service'
import { verifyAdminToken, adminActor } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const adminPayload = await verifyAdminToken(token)

    await connectDB()
    const { bookingId, status } = await request.json()

    if (!bookingId || !status) {
      return NextResponse.json(
        { success: false, message: 'bookingId and status are required' },
        { status: 400 }
      )
    }

    if (!['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status must be confirmed or cancelled' },
        { status: 400 }
      )
    }

    const updated = await bookingService.adminUpdateStatus(bookingId, status)
    await ActivityLogService.log('UPDATE_STATUS', 'Booking', bookingId, `Status updated to ${status}`, adminActor(adminPayload))

    if (status === 'pending') {
      await NotificationService.create({
        type: 'BOOKING_NEW',
        message: `New booking received for ${(updated as any).room?.type || 'Room'}`,
        entityId: bookingId,
        entityType: 'Booking',
      })
    } else if (status === 'cancelled') {
      await NotificationService.create({
        type: 'BOOKING_CANCELLED',
        message: `Booking cancelled for ${(updated as any).user?.firstname || 'Guest'}`,
        entityId: bookingId,
        entityType: 'Booking',
      })
    }

    return NextResponse.json({ success: true, message: `Booking ${status}`, booking: updated })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
