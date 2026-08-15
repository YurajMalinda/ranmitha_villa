export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import adminAuthService from '@/services/adminAuth.service'
import { rateLimitShared, clientIp } from '@/lib/rate-limit'
import { connectDB } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const limit = await rateLimitShared(`forgot:${clientIp(request)}`, 5, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    const { email } = await request.json()
    await adminAuthService.requestPasswordReset(email)

    // Always the same answer, whether or not an account exists — otherwise this
    // route reveals which addresses are registered.
    return NextResponse.json({
      success: true,
      message: 'If that address has an admin account, a reset link is on its way.',
    })
  } catch (error: any) {
    console.error('Password reset request failed:', error)
    // Even a server-side failure returns the neutral message, for the same reason.
    return NextResponse.json({
      success: true,
      message: 'If that address has an admin account, a reset link is on its way.',
    })
  }
}
