export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import roomService from '@/services/room.service'
import ActivityLogService from '@/services/activityLog.service'
import { verifyAdminToken, adminActor } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const adminPayload = await verifyAdminToken(token)

    await connectDB()
    const { roomId } = await request.json()
    await roomService.removeRoom(roomId)
    await ActivityLogService.log('DELETE_ROOM', 'Room', roomId, 'Room deleted', adminActor(adminPayload))

    return NextResponse.json({ success: true, message: 'Room successfully removed' })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
