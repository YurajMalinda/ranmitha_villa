export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import amenityService from '@/services/amenity.service'

export async function GET() {
  try {
    await connectDB()
    const amenities = await amenityService.list()
    return NextResponse.json({ success: true, amenities })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
