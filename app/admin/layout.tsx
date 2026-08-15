'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/components/admin/Toast'
import { AdminLayout } from '@/components/admin/AdminLayout'

// The sign-in and account-recovery pages render standalone: they are reachable
// without a session, so they must not be wrapped in the authenticated chrome
// (which redirects to login and fetches admin-only data).
const PUBLIC_ADMIN_PAGES = [
    '/admin/login',
    '/admin/signup',
    '/admin/forgot-password',
    '/admin/reset-password',
    '/admin/verify-email',
]

function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    if (PUBLIC_ADMIN_PAGES.includes(pathname)) return <>{children}</>
    return <AdminLayout>{children}</AdminLayout>
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <ToastProvider>
                    <AdminShell>{children}</AdminShell>
                </ToastProvider>
            </ThemeProvider>
        </AuthProvider>
    )
}
