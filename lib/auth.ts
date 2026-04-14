import { jwtVerify, SignJWT } from 'jose'
import { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

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

export async function verifyUserToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload
}

export async function signAdminToken(username: string) {
  return new SignJWT({ username, role: 'admin' })
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
