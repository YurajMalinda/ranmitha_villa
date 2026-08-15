import mongoose, { Schema, Document } from 'mongoose'

export interface IAdmin extends Document {
  email: string
  name: string
  passwordHash: string
  isActive: boolean
  emailVerified: boolean
  lastLoginAt?: Date
  /** Bumped on password reset so any session issued earlier stops validating. */
  tokenVersion: number
  createdAt: Date
  updatedAt: Date
}

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    // bcrypt hash — plaintext is never stored or logged.
    passwordHash: { type: String, required: true },
    // Deactivate rather than delete, so ActivityLog entries keep resolving to a name.
    isActive: { type: Boolean, required: true, default: true },
    // No admin access until the address is proven to belong to them.
    emailVerified: { type: Boolean, required: true, default: false },
    lastLoginAt: { type: Date, required: false },
    tokenVersion: { type: Number, required: true, default: 0 },
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
