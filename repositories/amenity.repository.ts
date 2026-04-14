import Amenity from '@/models/Amenity'

class AmenityRepository {
  async create(data: any) {
    return await new Amenity(data).save()
  }

  async getOne(id: string) {
    return await Amenity.findById(id)
  }

  async getAll() {
    return await Amenity.find({}).sort({ category: 1, order: 1 })
  }

  async update(id: string, data: any) {
    return await Amenity.findByIdAndUpdate(id, data, { new: true })
  }

  async remove(id: string) {
    return await Amenity.findByIdAndDelete(id)
  }
}

export default new AmenityRepository()
