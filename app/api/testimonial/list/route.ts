export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import testimonialService from '@/services/testimonial.service'

export async function GET() {
  try {
    await connectDB()
    const testimonials = await testimonialService.list()
    return NextResponse.json({ success: true, testimonials })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
