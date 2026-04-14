export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import roomService from '@/services/room.service'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { roomId } = await request.json()
    const room = await roomService.getRoom(roomId)
    return NextResponse.json({ success: true, room })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
