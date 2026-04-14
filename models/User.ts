import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  firstname: string
  lastname?: string
  email: string
  country?: string
  mobile?: number
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: false, default: '' },
    email: { type: String, required: true, unique: true },
    country: { type: String, required: false, default: '' },
    mobile: { type: Number, required: false },
  },
  { timestamps: true }
)

const User = mongoose.models.user || mongoose.model<IUser>('user', userSchema)

export default User
