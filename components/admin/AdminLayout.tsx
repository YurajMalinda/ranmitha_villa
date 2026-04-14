'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
    LayoutDashboard, BedDouble, CalendarCheck, Map, CalendarX,
    Users, LogOut, Sun, Moon, ChevronRight, Settings as SettingsIcon,
    Quote, Sparkles, Images
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import MobileBottomNav from './MobileBottomNav';

const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/rooms', icon: BedDouble, label: 'Rooms' },
    { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
    { to: '/admin/tours', icon: Map, label: 'Tours' },
    { to: '/admin/gallery', icon: Images, label: 'Gallery' },
    { to: '/admin/testimonials', icon: Quote, label: 'Testimonials' },
    { to: '/admin/amenities', icon: Sparkles, label: 'Amenities' },
    { to: '/admin/blocked-dates', icon: CalendarX, label: 'Blocked Dates' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/settings', icon: SettingsIcon, label: 'Settings' },
];

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push('/admin/login');
    };

    const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname.startsWith(to);

    return (
        <div className="admin-layout">
            <MobileBottomNav />

            <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col z-50 hidden lg:flex">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700/50">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-sm font-bold text-white">RV</span>
                        Ranmitha Villa
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Admin Dashboard</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label, exact }) => (
                        <Link
                            key={to}
                            href={to}
                            className={`admin-nav-link group ${isActive(to, exact) ? 'admin-nav-link-active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                            <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700/50">
                    <button onClick={handleLogout} className="admin-nav-link w-full text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div className="admin-main pb-24 lg:pb-0 lg:pl-[260px]">
                <header className="admin-topbar">
                    <div className="flex-1 flex items-center gap-3 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                            RV
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                            Ranmitha Villa
                        </h1>
                    </div>

                    <div className="flex-1 hidden lg:block" />

                    <div className="flex items-center gap-4">
                        <NotificationBell />

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-500 dark:text-gray-400"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                                A
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">Admin</span>
                        </div>
                    </div>
                </header>

                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
