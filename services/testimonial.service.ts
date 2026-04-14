import TestimonialRepository from '@/repositories/testimonial.repository'

class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

class TestimonialService {
  async create(body: any) {
    try {
      const { author, quote, rating, source } = body
      if (!author || !quote) throw new AppError('Author and quote are required', 400)
      return await TestimonialRepository.create({ author, quote, rating: Number(rating) || 5, source: source || 'Google' })
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500)
    }
  }

  async update(body: any) {
    try {
      const { testimonialId, author, quote, rating, source } = body
      if (!testimonialId) throw new AppError('Testimonial ID required', 400)
      const existing = await TestimonialRepository.getOne(testimonialId)
      if (!existing) throw new AppError('Testimonial not found', 404)
      return await TestimonialRepository.update(testimonialId, { author, quote, rating: Number(rating) || 5, source })
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500)
    }
  }

  async list() {
    try {
      return await TestimonialRepository.getAll()
    } catch (error: any) {
      throw new AppError(error.message, 500)
    }
  }

  async remove(body: any) {
    try {
      const { testimonialId } = body
      if (!testimonialId) throw new AppError('Testimonial ID required', 400)
      return await TestimonialRepository.remove(testimonialId)
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500)
    }
  }
}

export default new TestimonialService()
