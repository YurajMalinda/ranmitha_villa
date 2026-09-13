export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import adminAuthService, { AppError } from '@/services/adminAuth.service'
import { rateLimitShared, clientIp } from '@/lib/rate-limit'
import { connectDB } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const limit = await rateLimitShared(`accept-invite:${clientIp(request)}`, 10, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    const { token, password } = await request.json()
    await adminAuthService.acceptInvite(token, password)

    return NextResponse.json({
      success: true,
      message: 'Account activated. You can sign in now.',
    })
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode })
    }
    console.error('Accept invite failed:', error)
    return NextResponse.json({ success: false, message: 'Could not activate the account.' }, { status: 500 })
  }
}
