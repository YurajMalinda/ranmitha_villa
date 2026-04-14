import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IBooking extends Document {
  booking_id: string
  room: Types.ObjectId
  user: Types.ObjectId | null
  check_in_date: Date
  check_out_date: Date
  guests: number
  nights: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_price: number
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const bookingSchema = new Schema(
  {
    booking_id: { type: String, required: true, unique: true },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'room',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false,
      default: null,
    },
    check_in_date: { type: Date, required: true },
    check_out_date: { type: Date, required: true },
    guests: { type: Number, required: true },
    nights: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    total_price: { type: Number, required: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000),
    },
  },
  { timestamps: true }
)

bookingSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { status: 'pending' },
  }
)

bookingSchema.index({ room: 1, check_in_date: 1, check_out_date: 1 })

const Booking = mongoose.models.booking || mongoose.model<IBooking>('booking', bookingSchema)

export default Booking
