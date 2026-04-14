import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import ActivityLogService from '@/services/activityLog.service'
import { verifyAdminRequest } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const logs = await ActivityLogService.getRecentLogs()
    return NextResponse.json({ success: true, logs })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
