import blockedDateRepository from '@/repositories/blockedDate.repository'

class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

class BlockedDateService {
  async addDate(body: any) {
    try {
      const { block_id, room, from, to, reason } = body

      const blockedDateDetails = {
        block_id,
        room,
        from: new Date(from).getTime(),
        to: new Date(to).getTime(),
        reason,
      }

      const blockedDate = await blockedDateRepository.create(blockedDateDetails)
      if (!blockedDate) throw new AppError('Block date not found', 400)

      return blockedDate
    } catch (error: any) {
      throw new AppError(`Can't block date: ${error.message}`, error.statusCode || 500)
    }
  }

  async updateDate(body: any) {
    try {
      const { blockId, room, from, to, reason } = body

      const blockedDate: any = await blockedDateRepository.getOne(blockId)
      if (!blockedDate) throw new AppError('Date not found', 404)

      blockedDate['room'] = room
      blockedDate['from'] = new Date(from).getTime()
      blockedDate['to'] = new Date(to).getTime()
      blockedDate['reason'] = reason

      return await blockedDateRepository.update(blockedDate)
    } catch (error: any) {
      throw new AppError(`Can't update blocked date: ${error.message}`, error.statusCode || 500)
    }
  }

  async listAllDates() {
    try {
      const blockedDates = await blockedDateRepository.getAll()
      if (!blockedDates) throw new AppError('Not found blocked dates', 400)
      return blockedDates
    } catch (error: any) {
      throw new AppError(`Can't fetch blocked dates: ${error.message}`, error.statusCode || 500)
    }
  }

  async listOneDate(body: any) {
    try {
      const { blockId } = body
      if (!blockId) throw new AppError('Not found block ID', 400)

      const blockedDate = await blockedDateRepository.getOne(blockId)
      if (!blockedDate) throw new AppError('Blocked date not found', 404)

      return blockedDate
    } catch (error: any) {
      throw new AppError(`Can't fetch blocked date: ${error.message}`, error.statusCode || 500)
    }
  }

  async disableDate(body: any) {
    try {
      const { blockId } = body
      if (!blockId) throw new AppError('Not found block ID', 400)

      const blockedDate: any = await blockedDateRepository.getOne(blockId)
      if (!blockedDate) throw new AppError('Blocked date not found', 404)

      blockedDate['isActive'] = false

      return await blockedDateRepository.updateStatus(blockedDate)
    } catch (error: any) {
      throw new AppError(`Can't disable this date: ${error.message}`, error.statusCode || 500)
    }
  }
}

export default new BlockedDateService()
