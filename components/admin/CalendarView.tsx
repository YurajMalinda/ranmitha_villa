'use client'

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';

interface Booking {
    _id: string;
    booking_id: string;
    room?: { type: string; _id: string };
    user?: { firstname: string; lastname?: string; email?: string; mobile?: string; phone?: string };
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

interface CalendarViewProps {
    bookings: Booking[];
    rooms?: Room[];
    onBookingClick: (booking: Booking) => void;
}

export default function CalendarView({ bookings, rooms = [], onBookingClick }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedRoom, setSelectedRoom] = useState<string>('all');

    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const filteredBookings = useMemo(() => {
        if (selectedRoom === 'all') return bookings;
        return bookings.filter(b => b.room?._id === selectedRoom);
    }, [bookings, selectedRoom]);

    const getBookingsForDate = (day: number) => {
        const target = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return filteredBookings.filter(b => {
            const start = new Date(b.check_in_date);
            const end = new Date(b.check_out_date);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            target.setHours(0, 0, 0, 0);
            return target >= start && target < end;
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col h-[800px]">
            <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Calendar className="text-emerald-500" size={24} />
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all"><ChevronLeft size={18} /></button>
                        <button onClick={goToToday} className="px-3 text-xs font-semibold hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all">Today</button>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all"><ChevronRight size={18} /></button>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="hidden lg:flex items-center gap-3 text-xs mr-4">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Confirmed</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span> Cancelled</div>
                    </div>

                    <div className="relative flex-1 md:flex-none">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <select
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            className="w-full md:w-48 pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-emerald-500 rounded-lg text-sm outline-none transition-all dark:text-gray-200"
                        >
                            <option value="all">All Rooms</option>
                            {rooms.map(r => (
                                <option key={r._id} value={r._id}>{r.type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                    <div key={d} className={`p-3 text-center text-xs font-bold uppercase tracking-wider ${i === 0 || i === 6 ? 'text-red-400 dark:text-red-400/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 grid-rows-6 flex-1 bg-gray-100 dark:bg-slate-800 gap-[1px]">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-white dark:bg-slate-900 opacity-50" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date_obj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                    const isWeekend = date_obj.getDay() === 0 || date_obj.getDay() === 6;
                    const dayBookings = getBookingsForDate(day);

                    return (
                        <div key={day} className={`bg-white dark:bg-slate-900 p-2 relative group overflow-hidden ${isWeekend ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}>
                            <span className={`text-xs font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                : isWeekend ? 'text-red-400 dark:text-red-400/80' : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {day}
                            </span>

                            <div className="space-y-1 overflow-y-auto max-h-[100px]">
                                {dayBookings.map(b => (
                                    <div
                                        key={b._id}
                                        onClick={() => onBookingClick(b)}
                                        className={`text-[10px] px-2 py-1.5 rounded-md cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-sm border-l-2 ${b.status === 'confirmed' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-emerald-500' :
                                            b.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-l-amber-500' :
                                                'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-l-gray-400'
                                            }`}
                                    >
                                        <div className="font-bold truncate">{b.room?.type.split(' ')[0]}</div>
                                        <div className="truncate opacity-90">{b.user?.firstname || 'Guest'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
