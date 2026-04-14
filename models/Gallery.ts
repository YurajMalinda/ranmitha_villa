import mongoose, { Schema, Document } from 'mongoose'

export interface IGallery extends Document {
  src: string
  alt: string
  title: string
  description: string
  order: number
}

const gallerySchema = new Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, default: '' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const Gallery = mongoose.models.gallery || mongoose.model<IGallery>('gallery', gallerySchema)

export default Gallery
