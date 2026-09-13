export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import adminAuthService from '@/services/adminAuth.service'
import { verifyAdminRequest } from '@/lib/auth'
import { connectDB } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request)
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 })
    }

    await connectDB()
    const admins = await adminAuthService.listAdmins()
    return NextResponse.json({ success: true, admins })
  } catch (error: any) {
    console.error('Admin list failed:', error)
    return NextResponse.json({ success: false, message: 'Could not load admins.' }, { status: 500 })
  }
}
