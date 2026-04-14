export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import authService from '@/services/auth.service'

export async function POST(request: NextRequest) {
  try {
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
    return NextResponse.json({ success: false, message: error.message }, { status: 400 })
  }
}
