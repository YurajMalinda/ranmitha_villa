export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import adminAuthService, { AppError } from '@/services/adminAuth.service'
import ActivityLogService from '@/services/activityLog.service'
import { verifyAdminRequest, adminActor } from '@/lib/auth'
import { rateLimitShared } from '@/lib/rate-limit'
import { connectDB } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request)
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 })
    }
    const actor = adminActor(auth.payload)

    await connectDB()

    // Keyed on the inviting admin, not the IP, so it limits invite spam without
    // punishing an office sharing a NAT address.
    const limit = await rateLimitShared(`invite:${actor.adminId ?? 'unknown'}`, 20, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many invites sent. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    const { email, name } = await request.json()
    const result = await adminAuthService.inviteAdmin({ email, name })

    await ActivityLogService.log(
      'INVITE_ADMIN',
      'Admin',
      undefined,
      `Invited ${email} as an admin`,
      actor
    )

    return NextResponse.json({
      success: true,
      message: result.reinvited
        ? 'Invite resent — the previous one is no longer valid.'
        : 'Invite sent.',
    })
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode })
    }
    console.error('Admin invite failed:', error)
    return NextResponse.json({ success: false, message: 'Could not send invite.' }, { status: 500 })
  }
}
