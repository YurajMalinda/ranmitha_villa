'use client'

import { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend
} from 'recharts';

interface Booking {
    _id: string;
    total_price: number;
    status: string;
    createdAt: string;
    check_in_date: string;
    room?: {
        type: string;
    };
}

interface AnalyticsChartsProps {
    bookings: Booking[];
}

export default function AnalyticsCharts({ bookings }: AnalyticsChartsProps) {
    const revenueData = useMemo(() => {
        const data: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('default', { month: 'short' });
            data[key] = 0;
        }

        bookings.forEach(b => {
            if (b.status === 'confirmed') {
                const date = new Date(b.check_in_date);
                const key = date.toLocaleString('default', { month: 'short' });
                if (data[key] !== undefined) {
                    data[key] += b.total_price;
                }
            }
        });

        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [bookings]);

    const statusData = useMemo(() => {
        const counts = { confirmed: 0, pending: 0, cancelled: 0 };
        bookings.forEach(b => {
            const s = b.status.toLowerCase();
            if (s === 'confirmed') counts.confirmed++;
            else if (s === 'pending') counts.pending++;
            else counts.cancelled++;
        });
        return [
            { name: 'Confirmed', value: counts.confirmed, color: '#10b981' },
            { name: 'Pending', value: counts.pending, color: '#f59e0b' },
            { name: 'Cancelled', value: counts.cancelled, color: '#ef4444' },
        ].filter(d => d.value > 0);
    }, [bookings]);

    return (
        <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 admin-card p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
                    <div className="h-[300px] w-full" style={{ height: 300, minHeight: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `LKR ${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`LKR ${(Number(value) || 0).toLocaleString()}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-card p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Booking Status</h3>
                    <div className="h-[300px] w-full relative" style={{ height: 300, minHeight: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{bookings.length}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
