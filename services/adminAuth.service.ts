import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { connectDB } from '@/lib/db'
import Admin from '@/models/Admin'
import AuthToken from '@/models/AuthToken'
import { issueToken, consumeToken } from '@/lib/auth-tokens'
import { isAllowedEmail, normaliseEmail, allowlistConfigured } from '@/lib/allowlist'
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/auth-mail'
import { signAdminToken } from '@/lib/auth'

export class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

const BCRYPT_COST = 12
export const MIN_PASSWORD_LENGTH = 12

/** A bcrypt comparison against a throwaway hash, so an unknown email costs the
 *  same as a wrong password and accounts cannot be enumerated by timing. */
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.Ni9Z7kZ7lQ0Xh3lQ0Xh3lQ0Xh3lQ0Xa'
const burnComparison = async (password: string) => {
  try {
    await bcrypt.compare(password, DUMMY_HASH)
  } catch {
    /* only the elapsed time matters */
  }
}

const safeEquals = (a: string, b: string) => {
  const ha = crypto.createHash('sha256').update(Buffer.from(a, 'utf8')).digest()
  const hb = crypto.createHash('sha256').update(Buffer.from(b, 'utf8')).digest()
  return crypto.timingSafeEqual(ha, hb)
}

export function assertPasswordStrength(password: string) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, 400)
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new AppError('Password must contain both letters and numbers.', 400)
  }
}

const adminAuthService = {
  /**
   * Creates an unverified account behind the allowlist, then emails a
   * verification link. Callers must respond identically whether or not the
   * address already existed, so this never signals account existence.
   */
  async signUp(input: { email: string; name: string; password: string }) {
    await connectDB()

    const email = normaliseEmail(input.email)
    const name = String(input.name ?? '').trim()

    if (!email.includes('@')) throw new AppError('Enter a valid email address.', 400)
    if (!name) throw new AppError('Name is required.', 400)
    assertPasswordStrength(input.password)

    if (!allowlistConfigured()) {
      console.error('[SECURITY] ADMIN_ALLOWED_EMAILS is not set — refusing all admin sign-ups.')
      throw new AppError('Admin sign-up is not configured.', 500)
    }

    // Rejected before any account is written, so the collection never fills with
    // sign-up attempts from people who could not use them anyway.
    if (!isAllowedEmail(email)) {
      throw new AppError('This email address is not permitted to create an admin account.', 403)
    }

    // Sign-in checks admin accounts before the master key, so an account sharing
    // the recovery address would shadow it and there would be no way back in.
    if (process.env.ADMIN_USERNAME && email === normaliseEmail(process.env.ADMIN_USERNAME)) {
      throw new AppError('This email address is reserved. Use a different one.', 403)
    }

    const existing = await Admin.findOne({ email })

    if (existing) {
      // Unverified and stale: let them retry rather than locking the address out.
      if (!existing.emailVerified) {
        existing.name = name
        existing.passwordHash = await bcrypt.hash(input.password, BCRYPT_COST)
        await existing.save()
        const raw = await issueToken(String(existing._id), 'verify-email')
        await sendVerificationEmail(email, name, raw)
        return { created: true }
      }
      // Already a real account — say nothing new, and do not touch the password.
      return { created: false }
    }

    const admin = await Admin.create({
      email,
      name,
      passwordHash: await bcrypt.hash(input.password, BCRYPT_COST),
      emailVerified: false,
      isActive: true,
    })

    const raw = await issueToken(String(admin._id), 'verify-email')
    await sendVerificationEmail(email, name, raw)

    return { created: true }
  },

  async verifyEmail(rawToken: string) {
    await connectDB()

    const adminId = await consumeToken(rawToken, 'verify-email')
    if (!adminId) throw new AppError('This confirmation link is invalid or has expired.', 400)

    const admin = await Admin.findById(adminId)
    if (!admin) throw new AppError('This confirmation link is invalid or has expired.', 400)

    admin.emailVerified = true
    await admin.save()

    return { email: admin.email }
  },

  /**
   * Admin accounts first; the environment credential is only consulted if none
   * matched, and every use of it is logged as a bypass.
   */
  async signIn(input: { email: string; password: string }) {
    await connectDB()

    const email = normaliseEmail(input.email)
    const password = input.password

    if (!email || typeof password !== 'string' || !password) {
      throw new AppError('Invalid email or password.', 400)
    }

    const admin = await Admin.findOne({ email })

    if (admin) {
      const ok = await bcrypt.compare(password, admin.passwordHash)
      if (!ok) throw new AppError('Invalid email or password.', 400)

      // Checked only after the password, so these states are not probeable
      // by someone who does not already hold valid credentials.
      if (!admin.emailVerified) {
        throw new AppError('Confirm your email address before signing in.', 403)
      }
      if (!admin.isActive) {
        throw new AppError('This account has been deactivated.', 403)
      }

      admin.lastLoginAt = new Date()
      await admin.save()

      return {
        token: await signAdminToken(admin.email, {
          adminId: String(admin._id),
          name: admin.name,
        }),
      }
    }

    await burnComparison(password)

    const master = await this.authenticateMasterKey(email, password)
    if (master) return { token: await signAdminToken(master.username, master) }

    throw new AppError('Invalid email or password.', 400)
  },

  /**
   * Break-glass credential from the environment. It bypasses the admin
   * collection entirely, so it exists only to bootstrap the first account or to
   * get back in when accounts are unusable.
   */
  async authenticateMasterKey(username: string, password: string) {
    const expectedUsername = process.env.ADMIN_USERNAME
    const passwordHash = process.env.ADMIN_PASSWORD_HASH
    const plaintext = process.env.ADMIN_PASSWORD

    if (!expectedUsername || (!passwordHash && !plaintext)) return null

    // The sign-in field is type="email", so the browser will not submit anything
    // without an "@" — a non-email ADMIN_USERNAME is unreachable through the form.
    if (!expectedUsername.includes('@')) {
      console.error(
        `[SECURITY] ADMIN_USERNAME ("${expectedUsername}") is not an email address. ` +
          `The sign-in form cannot submit it, so the recovery credential is unusable. ` +
          `Set it to an email address.`
      )
      return null
    }

    const usernameOk = safeEquals(username, normaliseEmail(expectedUsername))
    const passwordOk = passwordHash
      ? await bcrypt.compare(password, passwordHash)
      : safeEquals(password, plaintext!)

    if (!usernameOk || !passwordOk) return null

    console.warn(
      `[SECURITY] Master key sign-in used for "${username}". This bypasses admin accounts — ` +
        `use it only for recovery.`
    )

    return { adminId: 'master', name: 'Master Key', username: expectedUsername }
  },

  /**
   * Always succeeds from the caller's perspective. Revealing whether an address
   * has an account would turn this into an account-enumeration oracle.
   */
  async requestPasswordReset(rawEmail: string) {
    await connectDB()

    const email = normaliseEmail(rawEmail)
    const admin = await Admin.findOne({ email, isActive: true })

    if (admin) {
      const raw = await issueToken(String(admin._id), 'reset-password')
      await sendPasswordResetEmail(admin.email, admin.name, raw)
    }

    return { ok: true }
  },

  async resetPassword(rawToken: string, newPassword: string) {
    await connectDB()

    assertPasswordStrength(newPassword)

    const adminId = await consumeToken(rawToken, 'reset-password')
    if (!adminId) throw new AppError('This reset link is invalid or has expired.', 400)

    const admin = await Admin.findById(adminId)
    if (!admin) throw new AppError('This reset link is invalid or has expired.', 400)

    admin.passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST)
    // Someone resetting a password may be recovering from a compromise, so
    // invalidate existing sessions and any other outstanding links.
    admin.tokenVersion += 1
    // Completing a reset proves mailbox control, so it also verifies the address.
    admin.emailVerified = true
    await admin.save()

    await AuthToken.deleteMany({ admin: admin._id, usedAt: { $exists: false } })

    return { email: admin.email }
  },
}

export default adminAuthService
