export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import userService from '@/services/user.service'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const user = await userService.register(body)
    return NextResponse.json({ success: true, token: user.token })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 })
  }
}
