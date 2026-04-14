import Tour from '@/models/Tour'

class TourRepository {
  async create(tourData: any) {
    return await new Tour(tourData).save()
  }

  async getOne(tourId: string) {
    return await Tour.findById(tourId)
  }

  async getAll() {
    return await Tour.find({})
  }

  async update(tourData: any) {
    return await Tour.findByIdAndUpdate(tourData._id, tourData)
  }

  async remove(tourId: string) {
    return await Tour.findByIdAndDelete(tourId)
  }
}

export default new TourRepository()
