import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import BlockedDateService from '@/services/blockedDate.service'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const blockedDates = await BlockedDateService.listAllDates()
    return NextResponse.json({ success: true, blockedDates })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
