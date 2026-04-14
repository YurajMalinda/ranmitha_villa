'use client'

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { adminApi } from '@/services/frontend/adminApi';
import { useToast } from './Toast';

interface Notification {
    _id: string;
    type: string;
    message: string;
    entityId?: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const toast = useToast();

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await adminApi.get('/notifications/list');
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await adminApi.put('/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch {
            toast.error('Failed to update notifications');
        }
    };

    const handleMarkRead = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try {
            await adminApi.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 z-20 py-2">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-semibold text-sm text-gray-800 dark:text-white">Notifications</h3>
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                disabled={unreadCount === 0}
                            >
                                Mark all read
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(n => (
                                    <div
                                        key={n._id}
                                        onClick={() => handleMarkRead(n._id, n.isRead)}
                                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-50 dark:border-slate-800 last:border-0 cursor-pointer ${!n.isRead ? 'bg-blue-50/30 dark:bg-blue-500/5' : ''}`}
                                    >
                                        <p className={`text-sm ${!n.isRead ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {n.message}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(n.createdAt)}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                                    No notifications
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
