export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import authService from '@/services/auth.service'
import { rateLimit, clientIp } from '@/lib/rate-limit'

const MAX_ATTEMPTS = 8
const WINDOW_MS = 10 * 60 * 1000 // 10 minutes

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(`admin-login:${clientIp(request)}`, MAX_ATTEMPTS, WINDOW_MS)
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    await connectDB()
    const body = await request.json()
    const { token } = await authService.authenticateUser(body)

    if (!token) {
      return NextResponse.json({ success: false, message: 'Invalid Credentials' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true, message: 'Login successful' })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
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
    // A misconfigured server is a 500, not a failed credential check — and its
    // message stays server-side rather than being handed to the caller.
    if (error?.statusCode === 500) {
      console.error('Admin login misconfiguration:', error.message)
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 })
    }
    return NextResponse.json({ success: false, message: 'Invalid Credentials' }, { status: 400 })
  }
}
