import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import NotificationService from '@/services/notification.service'
import { verifyAdminRequest } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const notifications = await NotificationService.getRecent(50)
    const unreadCount = await NotificationService.getUnreadCount()
    return NextResponse.json({ success: true, notifications, unreadCount })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
