import Testimonial from '@/models/Testimonial'

class TestimonialRepository {
  async create(data: any) {
    return await new Testimonial(data).save()
  }

  async getOne(id: string) {
    return await Testimonial.findById(id)
  }

  async getAll() {
    return await Testimonial.find({}).sort({ createdAt: -1 })
  }

  async update(id: string, data: any) {
    return await Testimonial.findByIdAndUpdate(id, data, { new: true })
  }

  async remove(id: string) {
    return await Testimonial.findByIdAndDelete(id)
  }
}

export default new TestimonialRepository()
