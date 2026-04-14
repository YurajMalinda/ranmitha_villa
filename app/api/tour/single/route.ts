export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import tourService from '@/services/tour.service'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const tour = await tourService.listOne(body)
    return NextResponse.json({ success: true, tour })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
