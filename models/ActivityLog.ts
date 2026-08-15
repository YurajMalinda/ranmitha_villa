import mongoose, { Schema, Document } from 'mongoose'

export interface IActivityLog extends Document {
  action: string
  entity: string
  entityId?: string
  details?: string
  /** Who did it. Absent on entries predating admin accounts, and on
   *  guest-triggered actions such as a booking confirmation. */
  actorId?: string
  actorName?: string
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}

const activityLogSchema = new Schema(
  {
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: false },
    details: { type: String, required: false },
    actorId: { type: String, required: false },
    actorName: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const ActivityLog =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema)

export default ActivityLog
