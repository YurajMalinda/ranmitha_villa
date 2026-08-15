export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import roomService from '@/services/room.service'
import ActivityLogService from '@/services/activityLog.service'
import { verifyAdminToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    await verifyAdminToken(token)

    await connectDB()
    const { roomId, status } = await request.json()
    await roomService.updateStatus(roomId, status)
    await ActivityLogService.log('UPDATE_STATUS', 'Room', roomId, `Status updated to ${status}`)

    return NextResponse.json({ success: true, message: 'Room status successfully updated' })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
