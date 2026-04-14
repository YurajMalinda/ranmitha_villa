import { connectDB } from '@/lib/db'
import ActivityLog from '@/models/ActivityLog'

const ActivityLogService = {
  log: async (action: string, entity: string, entityId?: string, details?: string) => {
    try {
      await connectDB()
      await ActivityLog.create({
        action,
        entity,
        entityId,
        details,
      })
    } catch (error) {
      console.error('Failed to create activity log:', error)
      // Don't throw, just log error so main flow isn't interrupted
    }
  },

  getRecentLogs: async (limit = 20) => {
    await connectDB()
    return await ActivityLog.find().sort({ timestamp: -1 }).limit(limit)
  },
}

export default ActivityLogService
