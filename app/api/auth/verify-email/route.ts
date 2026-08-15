export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import adminAuthService, { AppError } from '@/services/adminAuth.service'
import { rateLimitShared, clientIp } from '@/lib/rate-limit'
import { connectDB } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Guards against brute-forcing the token space, remote as that is with 32 bytes.
    const limit = await rateLimitShared(`verify:${clientIp(request)}`, 20, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    const { token } = await request.json()
    await adminAuthService.verifyEmail(token)

    return NextResponse.json({ success: true, message: 'Email confirmed. You can sign in now.' })
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode })
    }
    console.error('Email verification failed:', error)
    return NextResponse.json({ success: false, message: 'Could not confirm email.' }, { status: 500 })
  }
}
