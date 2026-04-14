import mongoose, { Schema, Document } from 'mongoose'

export interface IRoom extends Document {
  type: 'Standard Villa' | 'Family Villa'
  description: string
  pricePerNight: number
  maxGuests: number
  beds: { king: number; queen: number; twin: number }
  size: string
  images: string[]
  amenities: string[]
  bedrooms: number
  bathrooms: number
  hasAC: boolean
  status: 'available' | 'booked' | 'maintenance'
  createdAt: Date
  updatedAt: Date
}

const roomSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Standard Villa', 'Family Villa'],
      required: true,
    },
    description: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    maxGuests: { type: Number, required: true },
    beds: {
      king: { type: Number, required: true, default: 0 },
      queen: { type: Number, required: true, default: 0 },
      twin: { type: Number, required: true, default: 0 },
    },
    size: { type: String, required: true },
    images: { type: Array, required: true },
    amenities: { type: Array, required: true },
    bedrooms: { type: Number, required: true, default: 1 },
    bathrooms: { type: Number, required: true },
    hasAC: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ['available', 'booked', 'maintenance'],
      default: 'available',
    },
  },
  { timestamps: true, minimize: false }
)

const Room = mongoose.models.room || mongoose.model<IRoom>('room', roomSchema)

export default Room
