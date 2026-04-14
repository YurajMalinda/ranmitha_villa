'use client'

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/services/frontend/adminApi';
import { Plus, Trash2, CalendarOff, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/admin/Modal';

interface BlockedDate {
    _id: string;
    block_id: string;
    room: {
        _id: string;
        type: string;
    } | string;
    from: string;
    to: string;
    reason: string;
    isActive: boolean;
    createdAt?: string;
}

interface Room {
    _id: string;
    type: string;
}

function BlockedDatesContent() {
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<BlockedDate | null>(null);
    const [roomFilter, setRoomFilter] = useState('all');
    const toast = useToast();

    const [form, setForm] = useState({ roomId: '', from: '', to: '', reason: '' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [datesRes, roomsRes] = await Promise.all([
                adminApi.get('/block/list'),
                adminApi.get('/room/list')
            ]);
            setBlockedDates(datesRes.data.blockedDates || []);
            setRooms(roomsRes.data.rooms || []);
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.roomId || !form.from || !form.to || !form.reason) {
            toast.error('All fields are required');
            return;
        }
        setSaving(true);
        try {
            const block_id = `BLK-${Date.now()}`;
            await adminApi.post('/block/create', {
                block_id,
                room: form.roomId,
                from: form.from,
                to: form.to,
                reason: form.reason
            });
            toast.success('Date blocked successfully');
            setModalOpen(false);
            setForm({ roomId: '', from: '', to: '', reason: '' });
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to block date');
        } finally {
            setSaving(false);
        }
    };

    const handleDisable = async () => {
        if (!deleteTarget) return;
        try {
            await adminApi.post('/block/disable', { blockId: deleteTarget.block_id });
            toast.success('Block removed');
            setDeleteTarget(null);
            fetchData();
        } catch {
            toast.error('Failed to remove block');
        }
    };

    const getRoomName = (room: BlockedDate['room']) => {
        if (typeof room === 'object' && room?.type) return room.type;
        const found = rooms.find(r => r._id === room);
        return found ? found.type : 'Unknown Room';
    };

    if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500" /></div>;

    const filteredBlocks = blockedDates.filter(b => {
        if (!b.isActive) return false;
        if (roomFilter === 'all') return true;
        const rId = typeof b.room === 'string' ? b.room : b.room._id;
        return rId === roomFilter;
    });

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Blocked Dates</h1>
                    <p className="admin-subtitle">Manage room unavailability</p>
                </div>
                <div className="flex gap-3">
                    <select
                        className="admin-input py-2 pl-3 pr-8 text-sm w-48"
                        value={roomFilter}
                        onChange={(e) => setRoomFilter(e.target.value)}
                    >
                        <option value="all">All Rooms</option>
                        {rooms.map(r => (
                            <option key={r._id} value={r._id}>{r.type}</option>
                        ))}
                    </select>
                    <button onClick={() => setModalOpen(true)} className="admin-btn-primary">
                        <Plus size={18} /> Block Date
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlocks.length === 0 ? (
                    <div className="col-span-full admin-card p-12 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <CalendarOff size={32} />
                        </div>
                        <p>No active blocked dates found.</p>
                    </div>
                ) : (
                    filteredBlocks.map(b => (
                        <div key={b._id} className="admin-card p-5 flex flex-col border-l-4 border-l-red-500">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{getRoomName(b.room)}</h3>
                                    <span className="text-xs font-mono text-gray-400">{b.block_id}</span>
                                </div>
                                <button onClick={() => setDeleteTarget(b)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <CalendarOff size={16} className="text-red-500" />
                                    <span>{new Date(b.from).toLocaleDateString()} - {new Date(b.to).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <AlertCircle size={16} className="text-amber-500 mt-0.5" />
                                    <p>{b.reason}</p>
                                </div>
                            </div>

                            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-400">
                                Created on {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Remove Block?"
                message="This will make the room available for booking again during these dates."
                confirmLabel="Remove Block"
                onConfirm={handleDisable}
                onCancel={() => setDeleteTarget(null)}
            />

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Block Dates"
                subtitle="Prevent bookings for a room during a period"
                maxWidth="max-w-md"
                footer={
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                        <button form="blockForm" type="submit" disabled={saving} className="admin-btn-primary px-6 py-2.5">
                            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Block Dates'}
                        </button>
                    </div>
                }
            >
                <form id="blockForm" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="admin-label">Select Room</label>
                        <select className="admin-input" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })} required>
                            <option value="">-- Select Room --</option>
                            {rooms.map(r => <option key={r._id} value={r._id}>{r.type}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="admin-label">From</label>
                            <input type="date" className="admin-input" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} required />
                        </div>
                        <div>
                            <label className="admin-label">To</label>
                            <input type="date" className="admin-input" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} required />
                        </div>
                    </div>

                    <div>
                        <label className="admin-label">Reason</label>
                        <textarea className="admin-input" rows={3} placeholder="e.g. Maintenance, Private Event..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required />
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default function BlockedDatesPage() {
    return <BlockedDatesContent />;
}
