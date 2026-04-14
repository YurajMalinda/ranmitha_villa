import mongoose, { Schema, Document } from 'mongoose'

export interface ITour extends Document {
  name: string
  description: string
  price: string
  duration: string
  features: string[]
  images: string[]
}

const tourSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, default: 'Contact for Price' },
  duration: { type: String, default: 'Flexible' },
  features: { type: [String], default: [] },
  images: { type: Array, required: true },
})

const Tour = mongoose.models.tour || mongoose.model<ITour>('tour', tourSchema)

export default Tour
