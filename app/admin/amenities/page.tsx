'use client'

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/services/frontend/adminApi';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/admin/Modal';

interface Amenity {
    _id: string;
    label: string;
    description: string;
    icon: string;
    category: 'room' | 'property';
    order: number;
}

const AVAILABLE_ICONS = [
    'Wind', 'Droplets', 'Wifi', 'UtensilsCrossed', 'Bed', 'Car', 'Clock', 'Sparkle',
    'Briefcase', 'ShowerHead', 'Coffee', 'Shirt', 'VolumeX', 'Flower', 'Bike', 'Waves',
    'Check', 'Tv', 'Umbrella', 'Utensils', 'Bath', 'Sun', 'Globe', 'Phone',
    'Star', 'Music', 'Package', 'Heart', 'Shield', 'Zap'
];

function AmenitiesContent() {
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Amenity | null>(null);
    const [form, setForm] = useState({ label: '', description: '', icon: 'Check', category: 'room' as 'room' | 'property', order: '0' });
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Amenity | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const toast = useToast();

    useEffect(() => { fetchAmenities(); }, []);

    const fetchAmenities = async () => {
        try {
            const res = await adminApi.get('/amenity/list');
            setAmenities(res.data.amenities || []);
        } catch { toast.error('Failed to load amenities'); }
        finally { setLoading(false); }
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.label.trim()) e.label = 'Label is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = { ...form, order: Number(form.order) || 0 };
            if (editing) {
                await adminApi.post('/amenity/update', { amenityId: editing._id, ...payload });
                toast.success('Amenity updated');
            } else {
                await adminApi.post('/amenity/create', payload);
                toast.success('Amenity added');
            }
            setModalOpen(false);
            fetchAmenities();
        } catch (err: any) {
            toast.error('Failed to save', err.response?.data?.message || 'Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await adminApi.post('/amenity/remove', { amenityId: deleteTarget._id });
            toast.success('Amenity deleted');
            setDeleteTarget(null);
            fetchAmenities();
        } catch { toast.error('Failed to delete'); }
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ label: '', description: '', icon: 'Check', category: 'room', order: '0' });
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (a: Amenity) => {
        setEditing(a);
        setForm({ label: a.label, description: a.description, icon: a.icon, category: a.category, order: String(a.order) });
        setErrors({});
        setModalOpen(true);
    };

    const roomAmenities = amenities.filter(a => a.category === 'room');
    const propertyAmenities = amenities.filter(a => a.category === 'property');

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" /></div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Amenities</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage villa amenities shown on the website</p>
                </div>
                <button onClick={openAdd} className="admin-btn-primary whitespace-nowrap">
                    <Plus size={18} /> Add Amenity
                </button>
            </div>

            {amenities.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
                    <p>No amenities yet. Add your first amenity.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {[{ label: 'In Your Private Villa', items: roomAmenities, bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' },
                      { label: 'Property & Services', items: propertyAmenities, bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' }
                    ].map(({ label, items, bg }) => (
                        items.length > 0 && (
                            <div key={label}>
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">{label}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {items.map((a) => (
                                        <div key={a._id} className={`flex items-center gap-3 p-4 rounded-xl border ${bg} group`}>
                                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{a.icon.slice(0, 2)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">{a.label}</p>
                                                <p className="text-xs text-gray-500 truncate">{a.description}</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-gray-400 hover:text-blue-500 transition-colors">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => setDeleteTarget(a)} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Amenity?"
                message={`Remove "${deleteTarget?.label}"?`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Amenity' : 'Add Amenity'}
                subtitle="Villa amenity details"
                footer={
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            Cancel
                        </button>
                        <button form="amenityForm" type="submit" disabled={saving} className="admin-btn-primary px-6 py-2.5">
                            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (editing ? 'Update' : 'Add')}
                        </button>
                    </div>
                }
            >
                <form id="amenityForm" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="admin-label">Label *</label>
                            <input
                                className={`admin-input ${errors.label ? 'border-red-400' : ''}`}
                                value={form.label}
                                onChange={(e) => setForm({ ...form, label: e.target.value })}
                                placeholder="e.g. Full Kitchen"
                            />
                            {errors.label && <p className="text-red-500 text-xs mt-1 ml-1">{errors.label}</p>}
                        </div>
                        <div>
                            <label className="admin-label">Category</label>
                            <select className="admin-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as 'room' | 'property' })}>
                                <option value="room">In Your Private Villa</option>
                                <option value="property">Property & Services</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="admin-label">Description</label>
                        <input
                            className="admin-input"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="e.g. Fridge, stove, cookware"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="admin-label">Icon</label>
                            <select className="admin-input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                                {AVAILABLE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="admin-label">Order</label>
                            <input
                                type="number"
                                className="admin-input"
                                value={form.order}
                                onChange={(e) => setForm({ ...form, order: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default function AmenitiesPage() {
    return <AmenitiesContent />;
}
