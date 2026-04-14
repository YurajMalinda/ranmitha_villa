import Gallery from '@/models/Gallery'

class GalleryRepository {
  async create(data: any) {
    return await new Gallery(data).save()
  }

  async getOne(id: string) {
    return await Gallery.findById(id)
  }

  async getAll() {
    return await Gallery.find({}).sort({ category: 1, order: 1, createdAt: -1 })
  }

  async update(id: string, data: any) {
    return await Gallery.findByIdAndUpdate(id, data, { new: true })
  }

  async remove(id: string) {
    return await Gallery.findByIdAndDelete(id)
  }
}

export default new GalleryRepository()
