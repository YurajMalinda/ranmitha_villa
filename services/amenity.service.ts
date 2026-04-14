import AmenityRepository from '@/repositories/amenity.repository'

class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

class AmenityService {
  async create(body: any) {
    try {
      const { label, description, icon, category, order } = body
      if (!label || !category) throw new AppError('Label and category are required', 400)
      return await AmenityRepository.create({ label, description: description || '', icon: icon || 'Check', category, order: Number(order) || 0 })
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500)
    }
  }

  async update(body: any) {
    try {
      const { amenityId, label, description, icon, category, order } = body
      if (!amenityId) throw new AppError('Amenity ID required', 400)
      const existing = await AmenityRepository.getOne(amenityId)
      if (!existing) throw new AppError('Amenity not found', 404)
      return await AmenityRepository.update(amenityId, { label, description, icon, category, order: Number(order) || 0 })
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500)
    }
  }

  async list() {
    try {
      return await AmenityRepository.getAll()
    } catch (error: any) {
      throw new AppError(error.message, 500)
    }
  }

  async remove(body: any) {
    try {
      const { amenityId } = body
      if (!amenityId) throw new AppError('Amenity ID required', 400)
      return await AmenityRepository.remove(amenityId)
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500)
    }
  }
}

export default new AmenityService()
