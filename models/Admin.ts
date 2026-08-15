import mongoose, { Schema, Document } from 'mongoose'

export interface IAdmin extends Document {
  username: string
  name: string
  email?: string
  passwordHash: string
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

const adminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: false, lowercase: true, trim: true },
    // bcrypt hash — the plaintext password is never stored or logged.
    passwordHash: { type: String, required: true },
    // Deactivate rather than delete, so ActivityLog entries keep resolving to a name.
    isActive: { type: Boolean, required: true, default: true },
    lastLoginAt: { type: Date, required: false },
  },
  { timestamps: true }
)

// Never let a hash escape through a route that serialises the document.
adminSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.passwordHash
    return ret
  },
})

const Admin = mongoose.models.admin || mongoose.model<IAdmin>('admin', adminSchema)

export default Admin
