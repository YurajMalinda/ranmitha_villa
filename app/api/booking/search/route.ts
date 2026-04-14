export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import bookingService from '@/services/booking.service'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const rooms = await bookingService.getAvailableRooms(body)
    return NextResponse.json({ success: true, rooms })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
