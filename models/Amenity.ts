import mongoose, { Schema, Document } from 'mongoose'

export interface IAmenity extends Document {
  label: string
  description: string
  icon: string
  category: 'room' | 'property'
  order: number
}

const amenitySchema = new Schema(
  {
    label: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true, default: 'Check' },
    category: { type: String, enum: ['room', 'property'], required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const Amenity = mongoose.models.amenity || mongoose.model<IAmenity>('amenity', amenitySchema)

export default Amenity
