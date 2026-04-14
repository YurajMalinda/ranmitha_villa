'use client'

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/frontend/adminApi';
import { CalendarCheck, Search, X, Printer } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import CalendarView from '@/components/admin/CalendarView';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
    _id: string;
    booking_id: string;
    user?: {
        firstname: string;
        lastname?: string;
        email?: string;
        mobile?: string;
        phone?: string;
    };
    room?: {
        _id: string;
        type: string;
    };
    check_in_date: string;
    check_out_date: string;
    total_price: number;
    status: string;
    created_at: string;
    createdAt?: string;
}

interface Room {
    _id: string;
    type: string;
}

function BookingsContent() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const toast = useToast();

    const handlePrint = () => {
        const printContent = document.getElementById('print-area');
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload();
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const fetchBookings = async () => {
        try {
            const [bRes, rRes] = await Promise.all([
                adminApi.get('/booking/list'),
                adminApi.get('/room/list')
            ]);
            setBookings(bRes.data.reservations || []);
            setRooms(rRes.data.rooms || []);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    const handleStatusUpdate = async (status: string, booking?: Booking) => {
        const target = booking || selectedBooking;
        if (!target) return;
        setActionLoading(true);
        try {
            await adminApi.post('/booking/update-status', { bookingId: target._id, status });
            toast.success(`Booking ${status}`);
            if (selectedBooking && selectedBooking._id === target._id) setSelectedBooking(null);
            fetchBookings();
        } catch { toast.error('Failed to update booking'); }
        finally { setActionLoading(false); }
    };

    const filtered = bookings.filter(b => {
        const matchesSearch = b.booking_id?.toLowerCase().includes(search.toLowerCase()) ||
            b.user?.firstname?.toLowerCase().includes(search.toLowerCase()) ||
            b.user?.email?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500" /></div>;

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Bookings</h1>
                    <p className="admin-subtitle">Manage reservations and check-ins</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full md:w-64 transition-all"
                            placeholder="Search guests or ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="pl-4 pr-8 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-gray-200"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setViewMode('list')}>List</button>
                        <button className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setViewMode('calendar')}>Calendar</button>
                    </div>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                <CalendarView bookings={bookings} rooms={rooms} onBookingClick={(booking) => setSelectedBooking(booking)} />
            ) : (
                <div className="admin-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead><tr><th>ID</th><th>Guest</th><th>Room</th><th>Dates</th><th>Status</th><th>Total Price</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">No bookings found</td></tr>
                                ) : (
                                    filtered.map(b => (
                                        <tr key={b._id}>
                                            <td className="font-mono text-xs text-gray-500">#{b.booking_id ? b.booking_id.split('-')[1] || b.booking_id : b._id.slice(-6)}</td>
                                            <td>
                                                <div className="font-medium text-gray-900 dark:text-white">{b.user?.firstname} {b.user?.lastname}</div>
                                                <div className="text-xs text-gray-500">{b.user?.email}</div>
                                            </td>
                                            <td><span className="font-medium text-gray-700 dark:text-gray-300">{b.room?.type || 'Unknown Room'}</span></td>
                                            <td className="text-xs text-gray-600 dark:text-gray-400">
                                                <div className="font-medium">{new Date(b.check_in_date).toLocaleDateString()}</div>
                                                <div className="opacity-75">to {new Date(b.check_out_date).toLocaleDateString()}</div>
                                            </td>
                                            <td>
                                                <span className={`admin-badge ${b.status === 'confirmed' ? 'admin-badge-success' :
                                                    b.status === 'pending' ? 'admin-badge-warning' :
                                                        b.status === 'cancelled' ? 'admin-badge-danger' : 'admin-badge-neutral'
                                                    }`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="font-medium text-gray-900 dark:text-white">
                                                LKR {b.total_price?.toLocaleString()}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {b.status === 'pending' && (
                                                        <>
                                                            <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate('confirmed', b); }} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors" title="Approve">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate('cancelled', b); }} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Reject">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                            </button>
                                                        </>
                                                    )}
                                                    {b.status === 'confirmed' && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate('cancelled', b); }} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Cancel Booking">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                                        </button>
                                                    )}
                                                    <button onClick={() => setSelectedBooking(b)} className="px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">
                                                        Details
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedBooking && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 print:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedBooking(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: 20 }}
                            transition={{ duration: 0.22, type: 'spring', damping: 28, stiffness: 320 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Status accent bar */}
                            <div className={`h-1 w-full ${selectedBooking.status === 'confirmed' ? 'bg-emerald-500' : selectedBooking.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />

                            <div className="flex justify-between items-start px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-800">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Booking Details</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-mono">#{selectedBooking.booking_id?.split('-')[1] || selectedBooking.booking_id}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`admin-badge text-xs ${selectedBooking.status === 'confirmed' ? 'admin-badge-success' : selectedBooking.status === 'pending' ? 'admin-badge-warning' : 'admin-badge-danger'}`}>
                                        {selectedBooking.status}
                                    </span>
                                    <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4" id="print-area">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-2">Guest</p>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{selectedBooking.user?.firstname} {selectedBooking.user?.lastname}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedBooking.user?.email}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{selectedBooking.user?.mobile || selectedBooking.user?.phone || '—'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-2">Room</p>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{selectedBooking.room?.type || 'Unknown'}</p>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-1">LKR {selectedBooking.total_price?.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-2 flex items-center gap-1"><CalendarCheck size={12} /> Check In</p>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{new Date(selectedBooking.check_in_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-2 flex items-center gap-1"><CalendarCheck size={12} /> Check Out</p>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{new Date(selectedBooking.check_out_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/30 flex justify-between items-center gap-3">
                                <button onClick={handlePrint} className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2 text-sm">
                                    <Printer size={15} /> Print
                                </button>
                                <div className="flex gap-2">
                                    <button onClick={() => setSelectedBooking(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Close</button>
                                    {selectedBooking.status === 'pending' && (
                                        <>
                                            <button disabled={actionLoading} onClick={() => handleStatusUpdate('cancelled')} className="px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50 border border-red-100 dark:border-red-500/20">Reject</button>
                                            <button disabled={actionLoading} onClick={() => handleStatusUpdate('confirmed')} className="admin-btn-primary px-4 py-2 text-sm disabled:opacity-70">
                                                {actionLoading ? 'Processing...' : 'Approve'}
                                            </button>
                                        </>
                                    )}
                                    {selectedBooking.status === 'confirmed' && (
                                        <button disabled={actionLoading} onClick={() => handleStatusUpdate('cancelled')} className="px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors border border-red-100 dark:border-red-500/20 disabled:opacity-50">
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function BookingsPage() {
    return <BookingsContent />;
}
