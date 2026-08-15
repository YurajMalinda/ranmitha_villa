import crypto from 'crypto'
import bcrypt from 'bcrypt'
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
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  // timingSafeEqual throws on length mismatch, so hash first to equalise length
  // without revealing whether the mismatch was length or content.
  const hashA = crypto.createHash('sha256').update(bufA).digest()
  const hashB = crypto.createHash('sha256').update(bufB).digest()
  return crypto.timingSafeEqual(hashA, hashB)
}

const authService = {
  authenticateUser: async (userData: { username: string; password: string }) => {
    const { username, password } = userData

    const expectedUsername = process.env.ADMIN_USERNAME
    const passwordHash = process.env.ADMIN_PASSWORD_HASH
    const plaintextPassword = process.env.ADMIN_PASSWORD

    // Fail closed. Previously both sides of the comparison could be `undefined`
    // when these vars were missing, and `undefined === undefined` let an empty
    // request body authenticate as admin.
    if (!expectedUsername || (!passwordHash && !plaintextPassword)) {
      throw new AppError('Admin authentication is not configured', 500)
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new AppError('Invalid Username or Password', 400)
    }

    const usernameOk = safeEquals(username, expectedUsername)

    const passwordOk = passwordHash
      ? await bcrypt.compare(password, passwordHash)
      : safeEquals(password, plaintextPassword!)

    // Evaluate both before branching so a wrong username and a wrong password
    // cost the same amount of time.
    if (!usernameOk || !passwordOk) {
      throw new AppError('Invalid Username or Password', 400)
    }

    const token = await signAdminToken(username)
    return { token }
  },
}

export default authService
