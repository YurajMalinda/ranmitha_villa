import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import BlockedDateService from '@/services/blockedDate.service'
import { verifyAdminRequest } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const body = await request.json()
    await BlockedDateService.addDate(body)
    return NextResponse.json({ success: true, message: 'Date successfully blocked' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
