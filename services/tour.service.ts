import TourRepository from '@/repositories/tour.repository'

class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

class TourService {
  async createTour(body: any, imageUrls: Record<string, string>) {
    try {
      const { name, description, price, duration, features } = body

      const images = Object.values(imageUrls).filter(Boolean)

      let parsedFeatures: string[] = []
      if (features) {
        try { parsedFeatures = JSON.parse(features) } catch { parsedFeatures = [] }
      }

      const tourData = {
        name,
        description,
        price: price || 'Contact for Price',
        duration: duration || 'Flexible',
        features: parsedFeatures,
        images,
      }

      const tour = await TourRepository.create(tourData)

      if (!tour) throw new AppError('Tour creation failed', 500)

      return tour
    } catch (error: any) {
      throw new AppError(`Can't create new tour: ${error.message}`, 500)
    }
  }

  async updateTour(body: any, newImageUrls: Record<string, string>) {
    try {
      const { tourId, name, description, price, duration, features, keptImages } = body

      const tour: any = await TourRepository.getOne(tourId)
      if (!tour) throw new AppError('Not found tour details', 404)

      let finalImages: string[] = []

      if (keptImages || body.existingImages) {
        try {
          const payload = keptImages || body.existingImages
          const parsed = JSON.parse(payload)
          if (Array.isArray(parsed)) finalImages = parsed
        } catch (e) {
          if (typeof body.existingImages === 'string' && body.existingImages.startsWith('http')) {
            finalImages = [body.existingImages]
          }
        }
      }

      const newUrls = Object.values(newImageUrls).filter(Boolean)
      if (newUrls.length > 0) {
        finalImages = [...finalImages, ...newUrls]
      }

      if ((keptImages !== undefined || body.existingImages !== undefined) || newUrls.length > 0) {
        tour['images'] = finalImages
      }

      tour['name'] = name
      tour['description'] = description
      tour['price'] = price || 'Contact for Price'
      tour['duration'] = duration || 'Flexible'
      if (features) {
        try { tour['features'] = JSON.parse(features) } catch { tour['features'] = [] }
      }

      return await TourRepository.update(tour)
    } catch (error: any) {
      throw new AppError(`Can't update tour details: ${error.message}`, 500)
    }
  }

  async listTour() {
    try {
      const tours = await TourRepository.getAll()
      if (!tours) throw new AppError('Tours Not Found', 404)
      return tours
    } catch (error: any) {
      throw new AppError(`Can't fetch tour details: ${error.message}`, 500)
    }
  }

  async listOne(body: any) {
    try {
      const { tourId } = body
      if (!tourId) throw new AppError('Tour ID not found', 400)
      return await TourRepository.getOne(tourId)
    } catch (error: any) {
      throw new AppError(`Can't fetch tour details: ${error.message}`, 500)
    }
  }

  async removeTour(body: any) {
    try {
      const { tourId } = body
      if (!tourId) throw new AppError('Tour ID not Found', 400)
      return await TourRepository.remove(tourId)
    } catch (error: any) {
      throw new AppError(`Can't remove tour details: ${error.message}`, 500)
    }
  }
}

export default new TourService()
