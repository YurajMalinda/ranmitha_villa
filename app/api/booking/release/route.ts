export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import bookingService from '@/services/booking.service'

// No auth required — only deletes pending reservations with no user attached
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { bookingId } = await request.json()
    await bookingService.releaseTemporary(bookingId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
