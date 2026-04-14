'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/components/admin/Toast'
import { AdminLayout } from '@/components/admin/AdminLayout'

function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    if (pathname === '/admin/login') return <>{children}</>
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
