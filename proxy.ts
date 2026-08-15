import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

// Admin-only API routes (cookie-based auth)
const ADMIN_API = [
    /^\/api\/user\/(remove|list|single)/,
    /^\/api\/room\/(add|remove|update|updateStatus)/,
    /^\/api\/booking\/(list|update-status)/,
    /^\/api\/tour\/(create|update|remove)/,
    /^\/api\/block\/(create|update|disable)/,
    /^\/api\/notifications/,
    /^\/api\/activity-log/,
]

// Admin pages reachable without a session — the sign-in and account-recovery
// flow itself. Everything else under /admin requires a valid cookie.
const PUBLIC_ADMIN_PAGES = [
    '/admin/login',
    '/admin/signup',
    '/admin/forgot-password',
    '/admin/reset-password',
    '/admin/verify-email',
]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // --- Protect admin pages (redirect to login if no valid cookie) ---
    if (pathname.startsWith('/admin') && !PUBLIC_ADMIN_PAGES.includes(pathname)) {
        const token = request.cookies.get('admin_token')?.value
        if (!token) return NextResponse.redirect(new URL('/admin/login', request.url))
        try {
            const { payload } = await jwtVerify(token, secret)
            if (payload.role !== 'admin') return NextResponse.redirect(new URL('/admin/login', request.url))
        } catch {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    // --- Protect admin API routes (cookie-based, same-origin requests auto-send cookies) ---
    if (ADMIN_API.some(p => p.test(pathname))) {
        const token = request.cookies.get('admin_token')?.value
        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        try {
            const { payload } = await jwtVerify(token, secret)
            if (payload.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
        } catch {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/api/:path*'],
}
