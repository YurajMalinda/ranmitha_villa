export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import testimonialService from '@/services/testimonial.service'
import { verifyAdminRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const body = await request.json()
    await testimonialService.update(body)
    return NextResponse.json({ success: true, message: 'Testimonial updated' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode || 500 })
  }
}
