import { connectDB } from '@/lib/db'
import ActivityLog from '@/models/ActivityLog'

export type Actor = { adminId?: string; name?: string }

const ActivityLogService = {
  /** `actor` is optional so guest-triggered actions still log without one. */
  log: async (action: string, entity: string, entityId?: string, details?: string, actor?: Actor) => {
    try {
      await connectDB()
      await ActivityLog.create({
        action,
        entity,
        entityId,
        details,
        actorId: actor?.adminId,
        actorName: actor?.name,
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
