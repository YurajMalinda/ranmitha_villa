import mongoose, { Schema, Document, Types } from 'mongoose'

export type AuthTokenPurpose = 'verify-email' | 'reset-password'

export interface IAuthToken extends Document {
  admin: Types.ObjectId
  /** SHA-256 of the token. The raw value only ever exists in the emailed link,
   *  so a database leak cannot be replayed to take over an account. */
  tokenHash: string
  purpose: AuthTokenPurpose
  expiresAt: Date
  usedAt?: Date
  createdAt: Date
}

const authTokenSchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: 'admin', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    purpose: { type: String, required: true, enum: ['verify-email', 'reset-password'] },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, required: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

// Mongo reaps expired tokens on its own.
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const AuthToken =
  mongoose.models.auth_token || mongoose.model<IAuthToken>('auth_token', authTokenSchema)

export default AuthToken
