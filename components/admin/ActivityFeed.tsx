'use client'

import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, Trash2, Edit2, PlusCircle, AlertCircle } from 'lucide-react';
import { adminApi } from '@/services/frontend/adminApi';

interface ActivityLog {
    _id: string;
    action: string;
    entity: string;
    details: string;
    timestamp: string;
}

export default function ActivityFeed() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await adminApi.get('/activity-log/list');
                setLogs(res?.data?.logs || []);
            } catch (error) {
                console.error('Failed to fetch activity logs', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getIcon = (action: string) => {
        if (action.includes('CREATE')) return <PlusCircle size={16} className="text-emerald-500" />;
        if (action.includes('DELETE')) return <Trash2 size={16} className="text-red-500" />;
        if (action.includes('UPDATE')) return <Edit2 size={16} className="text-blue-500" />;
        if (action.includes('CONFIRM')) return <CheckCircle size={16} className="text-emerald-500" />;
        return <AlertCircle size={16} className="text-gray-500" />;
    };

    const formatTime = (iso: string) => {
        const date = new Date(iso);
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000;

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) return <div className="p-4 text-center text-gray-400 text-sm">Loading activity...</div>;
    if (logs.length === 0) return <div className="p-4 text-center text-gray-400 text-sm">No recent activity</div>;

    return (
        <div className="space-y-4">
            {logs.map((log) => (
                <div key={log._id} className="flex gap-3 items-start">
                    <div className="mt-0.5 min-w-[24px] flex justify-center">
                        {getIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">
                            {log.details}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {log.entity}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                <Clock size={10} /> {formatTime(log.timestamp)}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
