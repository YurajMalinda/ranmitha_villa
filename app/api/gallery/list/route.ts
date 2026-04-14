export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import galleryService from '@/services/gallery.service'

export async function GET() {
  try {
    await connectDB()
    const images = await galleryService.list()
    return NextResponse.json({ success: true, images })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
