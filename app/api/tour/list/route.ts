export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import tourService from '@/services/tour.service'

export async function GET() {
  try {
    await connectDB()
    const tours = await tourService.listTour()
    return NextResponse.json({ success: true, tours })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
