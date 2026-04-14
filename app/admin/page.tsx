'use client'

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/services/frontend/adminApi';
import { Hotel, CalendarCheck, DollarSign, Clock, TrendingUp, Users, CalendarOff } from 'lucide-react';
import dynamic from 'next/dynamic';
import ActivityFeed from '@/components/admin/ActivityFeed';
const AnalyticsCharts = dynamic(() => import('@/components/admin/AnalyticsCharts'), {
    loading: () => <div className="animate-pulse h-64 bg-gray-100 dark:bg-slate-800 rounded-2xl mb-6" />,
    ssr: false,
});

interface Booking {
    _id: string;
    booking_id: string;
    user?: {
        firstname: string;
        lastname?: string;
        email?: string;
    };
    room?: {
        type: string;
    };
    check_in_date: string;
    check_out_date: string;
    total_price: number;
    status: string;
    createdAt: string;
}

type DateRange = 'today' | 'week' | 'month' | 'year' | 'all';

function DashboardContent() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>('all');
    const router = useRouter();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [r, b] = await Promise.all([
                    adminApi.get('/room/list'),
                    adminApi.get('/booking/list'),
                ]);
                setRooms(r.data.rooms || []);
                setBookings(b.data.reservations || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    const filteredBookings = useMemo(() => {
        if (dateRange === 'all') return bookings;
        const now = new Date();
        let start: Date;
        switch (dateRange) {
            case 'today': start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
            case 'week': start = new Date(now.getTime() - 7 * 86400000); break;
            case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1); break;
            case 'year': start = new Date(now.getFullYear(), 0, 1); break;
            default: start = new Date(0);
        }
        return bookings.filter(b => new Date(b.createdAt || b.check_in_date) >= start);
    }, [bookings, dateRange]);

    const stats = useMemo(() => {
        const revenue = filteredBookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.total_price, 0);
        const pending = filteredBookings.filter(b => b.status === 'pending').length;
        const confirmed = filteredBookings.filter(b => b.status === 'confirmed').length;

        let occupancy = 0;
        if (rooms.length > 0) {
            let days = 30;
            if (dateRange === 'today') days = 1;
            if (dateRange === 'week') days = 7;
            if (dateRange === 'year') days = 365;
            const capacity = rooms.length * days;
            occupancy = Math.min(100, Math.round((confirmed * 2) / capacity * 100));
        }

        return { total: rooms.length, bookings: filteredBookings.length, revenue, pending, confirmed, users: 0, occupancy };
    }, [filteredBookings, rooms, dateRange]);

    const rangeLabel: Record<DateRange, string> = { today: 'Today', week: 'This Week', month: 'This Month', year: 'This Year', all: 'All Time' };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" /></div>;

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Dashboard</h1>
                    <p className="admin-subtitle">Welcome back! Here&apos;s what&apos;s happening at Ranmitha Villa.</p>
                </div>
                <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
                    {(['today', 'week', 'month', 'year', 'all'] as DateRange[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setDateRange(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dateRange === r
                                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                                }`}
                        >
                            {rangeLabel[r]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                {[
                    { label: 'Total Rooms', value: stats.total, icon: <Hotel size={20} />, color: '#6366f1' },
                    { label: 'Total Bookings', value: stats.bookings, icon: <CalendarCheck size={20} />, color: '#10b981' },
                    { label: 'Revenue', value: `LKR ${stats.revenue.toLocaleString()}`, icon: <DollarSign size={20} />, color: '#f59e0b', width: 'col-span-1 sm:col-span-2 xl:col-span-1' },
                    { label: 'Pending', value: stats.pending, icon: <Clock size={20} />, color: '#f97316' },
                    { label: 'Occupancy (Est.)', value: `${stats.occupancy}%`, icon: <TrendingUp size={20} />, color: '#8b5cf6' },
                    { label: 'Confirmed', value: stats.confirmed, icon: <Users size={20} />, color: '#10b981' },
                ].map((s, i) => (
                    <div key={i} className={`admin-card flex items-center p-4 gap-4 ${s.width || ''}`}>
                        <div style={{ minWidth: 40, width: 40, height: 40, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                            {s.icon}
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white leading-none">{s.value}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <button onClick={() => router.push('/admin/bookings')} className="p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CalendarCheck size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Bookings</span>
                </button>
                <button onClick={() => router.push('/admin/rooms')} className="p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Hotel size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Rooms</span>
                </button>
                <button onClick={() => router.push('/admin/blocked-dates')} className="p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CalendarOff size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Block Dates</span>
                </button>
                <button onClick={() => router.push('/admin/users')} className="p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Users</span>
                </button>
            </div>

            <AnalyticsCharts bookings={bookings} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 border border-gray-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[500px]">
                    <div className="p-5 border-b border-gray-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white m-0">Recent Bookings</h2>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{rangeLabel[dateRange]}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="md:hidden">
                            {filteredBookings.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">No bookings in this period</div>
                            ) : (
                                filteredBookings.slice(0, 5).map((b) => (
                                    <div key={b._id} className="p-4 border-b border-gray-100 last:border-0 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                    {b.user?.firstname?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-sm">{b.user?.firstname ? `${b.user.firstname} ${b.user.lastname || ''}` : 'Guest'}</h3>
                                                    <p className="text-xs text-gray-500">{b.room?.type || '—'}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                                                b.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                                    'bg-red-50 text-red-700'
                                                }`}>{b.status}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="hidden md:block">
                            <table className="admin-table w-full">
                                <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
                                    <tr>
                                        <th>Booking ID</th>
                                        <th>Guest</th>
                                        <th>Room</th>
                                        <th>Check-In</th>
                                        <th>Check-Out</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-8 text-gray-400">No bookings in this period</td></tr>
                                    ) : (
                                        filteredBookings.slice(0, 10).map((b) => (
                                            <tr key={b._id}>
                                                <td className="font-mono text-xs">{b.booking_id || b._id.slice(-8).toUpperCase()}</td>
                                                <td className="font-medium">{b.user?.firstname ? `${b.user.firstname} ${b.user.lastname || ''}` : '—'}</td>
                                                <td>{b.room?.type || '—'}</td>
                                                <td>{new Date(b.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td>{new Date(b.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td style={{ fontWeight: 600 }}>LKR {b.total_price.toLocaleString()}</td>
                                                <td>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                                                        b.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                                            'bg-red-50 text-red-700'
                                                        }`}>{b.status}</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 border border-gray-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[500px]">
                    <div className="p-5 border-b border-gray-100 dark:border-slate-800 shrink-0">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white m-0">Activity Log</h2>
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto">
                        <ActivityFeed />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return <DashboardContent />;
}
