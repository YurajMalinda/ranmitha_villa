import mongoose, { Schema, Document } from 'mongoose'

export interface ITestimonial extends Document {
  author: string
  quote: string
  rating: number
  source: string
}

const testimonialSchema = new Schema(
  {
    author: { type: String, required: true },
    quote: { type: String, required: true },
    rating: { type: Number, required: true, default: 5 },
    source: { type: String, required: true, default: 'Google' },
  },
  { timestamps: true }
)

const Testimonial = mongoose.models.testimonial || mongoose.model<ITestimonial>('testimonial', testimonialSchema)

export default Testimonial
