export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import roomService from '@/services/room.service'
import { uploadBuffer } from '@/lib/cloudinary'
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
    const formData = await request.formData()

    // Extract text fields
    const body: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        body[key] = value
      }
    }

    // Upload images
    const imageUrls: Record<string, string> = {}
    for (const key of ['image1', 'image2', 'image3', 'image4', 'image5']) {
      const file = formData.get(key) as File | null
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        imageUrls[key] = await uploadBuffer(buffer, 'ranmitha_villa/rooms')
      }
    }

    const room = await roomService.createRoom(body, imageUrls)
    await ActivityLogService.log('CREATE_ROOM', 'Room', (room as any)._id?.toString(), `Room ${(room as any).type} created`, adminActor(adminPayload))

    return NextResponse.json({ success: true, message: 'New room successfully added!' }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
