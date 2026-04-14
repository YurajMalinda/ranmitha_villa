export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import amenityService from '@/services/amenity.service'
import { verifyAdminRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const body = await request.json()
    await amenityService.update(body)
    return NextResponse.json({ success: true, message: 'Amenity updated' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode || 500 })
  }
}
