'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BedDouble, CalendarCheck, Map, CalendarX, Users, Settings as SettingsIcon, MoreHorizontal, LogOut, X, Quote, Sparkles, Images } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileBottomNav() {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/admin/login');
    };

    const bottomNavItems = [
        { to: '/admin', icon: LayoutDashboard, label: 'Home', exact: true },
        { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
        { to: '/admin/rooms', icon: BedDouble, label: 'Rooms' },
        { to: '/admin/tours', icon: Map, label: 'Tours' },
    ];

    const moreMenuItems = [
        { to: '/admin/gallery', icon: Images, label: 'Gallery' },
        { to: '/admin/testimonials', icon: Quote, label: 'Testimonials' },
        { to: '/admin/amenities', icon: Sparkles, label: 'Amenities' },
        { to: '/admin/blocked-dates', icon: CalendarX, label: 'Blocked Dates' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/settings', icon: SettingsIcon, label: 'Settings' },
    ];

    const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname.startsWith(to);

    return (
        <>
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 z-50 px-4 py-2 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                {bottomNavItems.map(({ to, icon: Icon, label, exact }) => (
                    <Link
                        key={to}
                        href={to}
                        onClick={() => setMoreMenuOpen(false)}
                        className="relative p-2"
                    >
                        <motion.div
                            className="relative flex flex-col items-center gap-1"
                            whileTap={{ scale: 0.9 }}
                        >
                            {isActive(to, exact) && (
                                <motion.div
                                    layoutId="mobile-nav-active"
                                    className="absolute -inset-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <div className={`relative z-10 flex flex-col items-center gap-1 transition-colors ${isActive(to, exact)
                                ? 'text-emerald-500'
                                : 'text-gray-400 dark:text-slate-500'
                                }`}>
                                <Icon size={20} className="mb-0.5" />
                                <span className="text-[10px] font-medium">{label}</span>
                            </div>
                        </motion.div>
                    </Link>
                ))}

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMoreMenuOpen(true)}
                    className={`relative p-2 rounded-xl transition-all ${moreMenuOpen
                        ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                        : 'text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-400'
                        }`}
                >
                    <div className="flex flex-col items-center gap-1">
                        <MoreHorizontal size={20} className="mb-0.5" />
                        <span className="text-[10px] font-medium">More</span>
                    </div>
                </motion.button>
            </div>

            <AnimatePresence>
                {moreMenuOpen && (
                    <div className="fixed inset-0 z-[60] lg:hidden flex flex-col justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setMoreMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
                        >
                            <div className="w-12 h-1 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mb-6" />

                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h3>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setMoreMenuOpen(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {moreMenuItems.map(({ to, icon: Icon, label }) => (
                                    <Link
                                        key={to}
                                        href={to}
                                        onClick={() => setMoreMenuOpen(false)}
                                    >
                                        <motion.div
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${isActive(to)
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/50'
                                                : 'border-gray-100 bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400'
                                                }`}
                                        >
                                            <Icon size={24} className="mb-2" />
                                            <span className="text-sm font-medium">{label}</span>
                                        </motion.div>
                                    </Link>
                                ))}

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleLogout}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-red-100 bg-red-50 text-red-500 dark:border-red-900/30 dark:bg-red-900/10"
                                >
                                    <LogOut size={24} className="mb-2" />
                                    <span className="text-sm font-medium">Logout</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
