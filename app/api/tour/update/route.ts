export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import tourService from '@/services/tour.service'
import { uploadBuffer } from '@/lib/cloudinary'
import { verifyAdminToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    await verifyAdminToken(token)

    await connectDB()
    const formData = await request.formData()

    const body: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        body[key] = value
      }
    }

    const imageUrls: Record<string, string> = {}
    for (const key of ['image1', 'image2', 'image3', 'image4', 'image5']) {
      const file = formData.get(key) as File | null
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        imageUrls[key] = await uploadBuffer(buffer, 'ranmitha_villa/tours')
      }
    }

    await tourService.updateTour(body, imageUrls)
    return NextResponse.json({ success: true, message: 'Tour details successfully updated' })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
