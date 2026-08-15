import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { connectDB } from '@/lib/db'
import Admin from '@/models/Admin'
import { signAdminToken } from '@/lib/auth'

class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

/**
 * Constant-time string comparison. `===` short-circuits on the first differing
 * byte, which leaks the length of the matching prefix through response timing.
 */
const safeEquals = (a: string, b: string) => {
  // Hash first to equalise length without revealing whether the mismatch was
  // length or content (timingSafeEqual throws on differing lengths).
  const hashA = crypto.createHash('sha256').update(Buffer.from(a, 'utf8')).digest()
  const hashB = crypto.createHash('sha256').update(Buffer.from(b, 'utf8')).digest()
  return crypto.timingSafeEqual(hashA, hashB)
}

/**
 * A bcrypt comparison against a throwaway hash, run when no account matched.
 * Without it, an unknown username returns far faster than a known one, which
 * lets an attacker enumerate valid usernames by timing alone.
 */
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.PxxxxxxxxxxxxxxxxxxxxxxxxxxxxxO'
const burnComparison = async (password: string) => {
  try {
    await bcrypt.compare(password, DUMMY_HASH)
  } catch {
    /* shape of the hash does not matter — only the time it takes */
  }
}

/**
 * The env credential is a break-glass account: it bypasses the admin collection
 * entirely, so it exists only to bootstrap the first real account or to get back
 * in when the database is unreachable. Every use is logged loudly.
 */
const authenticateMasterKey = async (username: string, password: string) => {
  const expectedUsername = process.env.ADMIN_USERNAME
  const passwordHash = process.env.ADMIN_PASSWORD_HASH
  const plaintextPassword = process.env.ADMIN_PASSWORD

  if (!expectedUsername || (!passwordHash && !plaintextPassword)) return null

  const usernameOk = safeEquals(username, expectedUsername)
  const passwordOk = passwordHash
    ? await bcrypt.compare(password, passwordHash)
    : safeEquals(password, plaintextPassword!)

  if (!usernameOk || !passwordOk) return null

  console.warn(
    `[SECURITY] Master key login used for "${username}". This bypasses the admin collection — ` +
      `create a real admin account and reserve this credential for recovery.`
  )

  return { id: 'master', username: expectedUsername, name: 'Master Key' }
}

const authService = {
  authenticateUser: async (userData: { username: string; password: string }) => {
    const { username, password } = userData

    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      throw new AppError('Invalid Username or Password', 400)
    }

    await connectDB()

    // Real accounts first; the master key is only consulted if none matched.
    const admin = await Admin.findOne({ username: username.toLowerCase().trim(), isActive: true })

    if (admin) {
      const ok = await bcrypt.compare(password, admin.passwordHash)
      if (!ok) throw new AppError('Invalid Username or Password', 400)

      admin.lastLoginAt = new Date()
      await admin.save()

      return {
        token: await signAdminToken(admin.username, {
          adminId: String(admin._id),
          name: admin.name,
        }),
      }
    }

    // Equalise timing between "no such account" and "wrong password".
    await burnComparison(password)

    const master = await authenticateMasterKey(username, password)
    if (master) {
      return {
        token: await signAdminToken(master.username, { adminId: master.id, name: master.name }),
      }
    }

    throw new AppError('Invalid Username or Password', 400)
  },
}

export default authService
