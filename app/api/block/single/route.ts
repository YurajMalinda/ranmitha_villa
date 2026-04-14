import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import BlockedDateService from '@/services/blockedDate.service'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const blockedDate = await BlockedDateService.listOneDate(body)
    return NextResponse.json({ success: true, blockedDate })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
