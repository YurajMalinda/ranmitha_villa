export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import roomService from '@/services/room.service'

export async function GET() {
  try {
    await connectDB()
    const rooms = await roomService.getRooms()
    return NextResponse.json({ success: true, rooms })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
