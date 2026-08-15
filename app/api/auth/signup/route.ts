export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import adminAuthService, { AppError } from '@/services/adminAuth.service'
import { rateLimitShared, clientIp } from '@/lib/rate-limit'
import { connectDB } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const limit = await rateLimitShared(`signup:${clientIp(request)}`, 5, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many sign-up attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    const { email, name, password } = await request.json()
    await adminAuthService.signUp({ email, name, password })

    // Deliberately identical whether the account was created or already existed,
    // so this cannot be used to discover which addresses are registered.
    return NextResponse.json({
      success: true,
      message: 'Check your inbox for a confirmation link to activate your account.',
    })
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode })
    }
    console.error('Admin sign-up failed:', error)
    return NextResponse.json({ success: false, message: 'Could not complete sign-up.' }, { status: 500 })
  }
}
