export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import galleryService from '@/services/gallery.service'
import { uploadBuffer } from '@/lib/cloudinary'
import { verifyAdminToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await verifyAdminToken(token)

    await connectDB()
    const formData = await request.formData()

    const body: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') body[key] = value
    }

    let newImageUrl: string | undefined
    const file = formData.get('image') as File | null
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      newImageUrl = await uploadBuffer(buffer, 'ranmitha_villa/gallery')
    }

    await galleryService.update(body, newImageUrl)
    return NextResponse.json({ success: true, message: 'Gallery image updated' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode || 500 })
  }
}
