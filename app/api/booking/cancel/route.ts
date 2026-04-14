export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import bookingService from '@/services/booking.service'
import { verifyUserToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token') || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized Login' }, { status: 401 })
    }

    const decoded = await verifyUserToken(token)
    await connectDB()
    const body = await request.json()
    body.userId = decoded.id

    await bookingService.cancelReservation(body)
    return NextResponse.json({ success: true, message: 'Reservation successfully cancelled' })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode || 400 }
    )
  }
}
