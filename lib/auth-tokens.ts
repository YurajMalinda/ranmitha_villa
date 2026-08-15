import crypto from 'crypto'
import AuthToken, { AuthTokenPurpose } from '@/models/AuthToken'

const TTL_MS: Record<AuthTokenPurpose, number> = {
  'verify-email': 24 * 60 * 60 * 1000, // 24 hours
  'reset-password': 60 * 60 * 1000, // 1 hour — shorter, it can change a password
}

/** Tokens are compared by hash, so the raw value never has to be stored. */
export const hashToken = (raw: string) => crypto.createHash('sha256').update(raw).digest('hex')

/**
 * Issues a single-use token and returns the raw value for the email link.
 * Any earlier unused token for the same purpose is dropped, so a freshly
 * requested link always invalidates the previous one.
 */
export async function issueToken(adminId: string, purpose: AuthTokenPurpose) {
  await AuthToken.deleteMany({ admin: adminId, purpose, usedAt: { $exists: false } })

  const raw = crypto.randomBytes(32).toString('base64url')

  await AuthToken.create({
    admin: adminId,
    tokenHash: hashToken(raw),
    purpose,
    expiresAt: new Date(Date.now() + TTL_MS[purpose]),
  })

  return raw
}

/**
 * Validates and atomically consumes a token. The findOneAndUpdate marks it used
 * in the same operation that reads it, so the same link cannot be redeemed twice
 * by two concurrent requests.
 */
export async function consumeToken(raw: string, purpose: AuthTokenPurpose) {
  if (!raw || typeof raw !== 'string') return null

  const token = await AuthToken.findOneAndUpdate(
    {
      tokenHash: hashToken(raw),
      purpose,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    },
    { $set: { usedAt: new Date() } },
    { new: true }
  )

  return token ? String(token.admin) : null
}
