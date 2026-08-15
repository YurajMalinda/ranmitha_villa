export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import adminAuthService, { AppError } from '@/services/adminAuth.service'
import { rateLimitShared, clientIp } from '@/lib/rate-limit'
import { connectDB } from '@/lib/db'

const MAX_ATTEMPTS = 8
const WINDOW_MS = 10 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const limit = await rateLimitShared(`signin:${clientIp(request)}`, MAX_ATTEMPTS, WINDOW_MS)
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many sign-in attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    const { email, password } = await request.json()
    const { token } = await adminAuthService.signIn({ email, password })

    const response = NextResponse.json({ success: true, message: 'Signed in' })

    // Same cookie the rest of the admin surface already validates, so proxy.ts
    // and every verifyAdminRequest call keep working unchanged.
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    response.cookies.set('admin_authenticated', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode })
    }
    console.error('Admin sign-in failed:', error)
    return NextResponse.json({ success: false, message: 'Could not sign in.' }, { status: 500 })
  }
}
