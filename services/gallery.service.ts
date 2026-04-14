import GalleryRepository from '@/repositories/gallery.repository'

class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

class GalleryService {
  async create(body: any, imageUrl: string) {
    try {
      const { title, alt, description, order } = body
      if (!title || !imageUrl) throw new AppError('Title and image are required', 400)
      return await GalleryRepository.create({
        src: imageUrl,
        alt: alt || title,
        title,
        description: description || '',
        order: Number(order) || 0,
      })
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500)
    }
  }

  async update(body: any, newImageUrl?: string) {
    try {
      const { galleryId, title, alt, description, order } = body
      if (!galleryId) throw new AppError('Gallery ID required', 400)
      const existing = await GalleryRepository.getOne(galleryId)
      if (!existing) throw new AppError('Gallery item not found', 404)
      const updateData: any = { title, alt: alt || title, description, order: Number(order) || 0 }
      if (newImageUrl) updateData.src = newImageUrl
      return await GalleryRepository.update(galleryId, updateData)
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500)
    }
  }

  async list() {
    try {
      return await GalleryRepository.getAll()
    } catch (error: any) {
      throw new AppError(error.message, 500)
    }
  }

  async remove(body: any) {
    try {
      const { galleryId } = body
      if (!galleryId) throw new AppError('Gallery ID required', 400)
      return await GalleryRepository.remove(galleryId)
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500)
    }
  }
}

export default new GalleryService()
