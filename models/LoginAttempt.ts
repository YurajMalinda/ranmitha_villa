import mongoose, { Schema, Document } from 'mongoose'

export interface ILoginAttempt extends Document {
  key: string
  count: number
  resetAt: Date
}

const loginAttemptSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  resetAt: { type: Date, required: true },
})

// Mongo reaps expired windows on its own, so nothing has to sweep this.
loginAttemptSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 })

const LoginAttempt =
  mongoose.models.login_attempt || mongoose.model<ILoginAttempt>('login_attempt', loginAttemptSchema)

export default LoginAttempt
