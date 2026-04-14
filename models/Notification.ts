import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  type: 'BOOKING_NEW' | 'BOOKING_CANCELLED' | 'BOOKING_CONFIRMED' | 'ROOM_STATUS' | 'SYSTEM'
  message: string
  entityId?: string
  entityType?: 'Booking' | 'Room' | 'User' | 'System'
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['BOOKING_NEW', 'BOOKING_CANCELLED', 'BOOKING_CONFIRMED', 'ROOM_STATUS', 'SYSTEM'],
      required: true,
    },
    message: { type: String, required: true },
    entityId: {
      type: String,
      required: false,
    },
    entityType: {
      type: String,
      enum: ['Booking', 'Room', 'User', 'System'],
      required: false,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Force re-register to pick up schema changes during hot-reload
if (mongoose.models.Notification) {
  mongoose.deleteModel('Notification')
}
const Notification = mongoose.model<INotification>('Notification', notificationSchema)

export default Notification
