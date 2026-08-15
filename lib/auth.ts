import { jwtVerify, SignJWT } from 'jose'
import { NextRequest } from 'next/server'

// Without this guard a missing JWT_SECRET silently becomes the literal string
// "undefined" — every token would then be signed with a publicly guessable key.
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Refusing to start with an unsigned-token configuration.')
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  if (payload.role !== 'admin') throw new Error('Forbidden')
  return payload
}

/**
 * Extract token from request headers/cookies and verify admin access.
 * Returns { success: true, payload } or { success: false, message }
 */
export async function verifyAdminRequest(request: NextRequest): Promise<{ success: boolean; message?: string; payload?: any }> {
  try {
    const token =
      request.headers.get('token') ||
      request.cookies.get('admin_token')?.value
    if (!token) return { success: false, message: 'Unauthorized' }
    const payload = await verifyAdminToken(token)
    return { success: true, payload }
  } catch {
    return { success: false, message: 'Unauthorized' }
  }
}

/** Pulls the acting admin out of a verified token payload, for ActivityLog. */
export function adminActor(payload: any): { adminId?: string; name?: string } {
  return { adminId: payload?.adminId, name: payload?.name ?? payload?.username }
}

export async function verifyUserToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload
}

/** `actor` rides in the token so admin routes can attribute an action without
 *  a second database lookup. */
export async function signAdminToken(
  username: string,
  actor?: { adminId: string; name: string }
) {
  return new SignJWT({ username, role: 'admin', ...actor })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret)
}

export async function signUserToken(userId: string) {
  return new SignJWT({ id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret)
}
