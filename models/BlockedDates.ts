import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IBlockedDate extends Document {
  block_id: string
  room: Types.ObjectId
  from: Date
  to: Date
  reason: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const blockedDateSchema = new Schema(
  {
    block_id: { type: String, required: true },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'room',
      required: true,
    },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String, trim: true, required: true },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
)

const BlockedDate =
  mongoose.models.blocked_date || mongoose.model<IBlockedDate>('blocked_date', blockedDateSchema)

export default BlockedDate
