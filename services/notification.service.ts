import { connectDB } from '@/lib/db'
import Notification from '@/models/Notification'

const NotificationService = {
  create: async ({
    type,
    message,
    entityId,
    entityType,
  }: {
    type: string
    message: string
    entityId?: string
    entityType?: string
  }) => {
    try {
      await connectDB()
      const notification = await Notification.create({
        type,
        message,
        entityId,
        entityType,
      })
      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      return null
    }
  },

  getRecent: async (limit = 20) => {
    try {
      await connectDB()
      return await Notification.find().sort({ createdAt: -1 }).limit(limit)
    } catch (error) {
      throw error
    }
  },

  getUnreadCount: async () => {
    await connectDB()
    return await Notification.countDocuments({ isRead: false })
  },

  markAsRead: async (id: string) => {
    await connectDB()
    return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true })
  },

  markAllAsRead: async () => {
    await connectDB()
    return await Notification.updateMany({ isRead: false }, { isRead: true })
  },
}

export default NotificationService
