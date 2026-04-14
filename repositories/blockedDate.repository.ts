import BlockedDate from '@/models/BlockedDates'

class BlockedDateRepository {
  async create(blockedDateDetails: any) {
    return await new BlockedDate(blockedDateDetails).save()
  }

  async update(blockedDate: any) {
    return await BlockedDate.findByIdAndUpdate(blockedDate._id, blockedDate)
  }

  async getOne(blockId: string) {
    return await BlockedDate.findById(blockId)
  }

  async getAll() {
    return await BlockedDate.find({})
  }

  async updateStatus(blockedDate: any) {
    return await BlockedDate.findByIdAndUpdate(blockedDate._id, blockedDate)
  }
}

export default new BlockedDateRepository()
