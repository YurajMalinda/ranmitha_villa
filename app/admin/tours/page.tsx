'use client'

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/services/frontend/adminApi';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ImageDropZone from '@/components/admin/ImageDropZone';
import Modal from '@/components/admin/Modal';

interface Tour {
    _id: string;
    name: string;
    description: string;
    price: string;
    duration: string;
    features: string[];
    images: string[];
}

function ToursContent() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Tour | null>(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', duration: '', featuresText: '' });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [keptImages, setKeptImages] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Tour | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const toast = useToast();

    useEffect(() => { fetchTours(); }, []);

    const fetchTours = async () => {
        try {
            const res = await adminApi.get('/tour/list');
            setTours(res.data.tours || []);
        } catch { toast.error('Failed to load tours'); }
        finally { setLoading(false); }
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Tour name is required';
        if (!form.description.trim()) e.description = 'Description is required';
        if (keptImages.length === 0 && imageFiles.length === 0) e.image = 'At least one image is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const features = form.featuresText.split('\n').map(s => s.trim()).filter(Boolean);
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('description', form.description);
            fd.append('price', form.price);
            fd.append('duration', form.duration);
            fd.append('features', JSON.stringify(features));
            imageFiles.forEach((file, index) => {
                if (index < 5) fd.append(`image${index + 1}`, file);
            });
            fd.append('existingImages', JSON.stringify(keptImages));

            if (editing) {
                fd.append('tourId', editing._id);
                await adminApi.post('/tour/update', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Tour updated', `${form.name} has been updated.`);
            } else {
                await adminApi.post('/tour/create', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Tour created', `${form.name} has been added.`);
            }
            setModalOpen(false);
            fetchTours();
        } catch (err: any) {
            toast.error('Failed to save tour', err.response?.data?.message || 'Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await adminApi.post('/tour/remove', { tourId: deleteTarget._id });
            toast.success('Tour deleted', `${deleteTarget.name} has been removed.`);
            setDeleteTarget(null);
            fetchTours();
        } catch { toast.error('Failed to delete tour'); }
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', description: '', price: '', duration: '', featuresText: '' });
        setImageFiles([]);
        setKeptImages([]);
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (t: Tour) => {
        setEditing(t);
        setForm({ name: t.name, description: t.description, price: t.price || '', duration: t.duration || '', featuresText: (t.features || []).join('\n') });
        setImageFiles([]);
        setKeptImages(t.images || []);
        setErrors({});
        setModalOpen(true);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" /></div>;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tours</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage tour packages</p>
                </div>
                <button onClick={openAdd} className="admin-btn-primary whitespace-nowrap">
                    <Plus size={18} /> Add Tour
                </button>
            </div>

            {/* Tour cards */}
            {tours.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
                    <p>No tours found. Add your first tour.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tours.map((t) => (
                        <div key={t._id} className="admin-card flex flex-col relative group overflow-hidden">
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={t.images?.[0] || '/placeholder.svg'}
                                    alt={t.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                {t.images && t.images.length > 1 && (
                                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1 border border-white/10">
                                        <span className="text-emerald-400">📷</span> {t.images.length}
                                    </div>
                                )}
                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                    <h3 className="text-lg font-bold drop-shadow-md">{t.name}</h3>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                {(t.price || t.duration) && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {t.price && <span className="text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">{t.price}</span>}
                                        {t.duration && <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{t.duration}</span>}
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3 flex-1">{t.description}</p>
                                <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-blue-500 transition-colors">
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={() => setDeleteTarget(t)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Tour?"
                message={`Permanently remove "${deleteTarget?.name}"?`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* Modal */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Tour' : 'Add New Tour'}
                subtitle="Manage tour details and gallery"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button form="tourForm" type="submit" disabled={saving} className="admin-btn-primary px-6 py-2.5">
                            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (editing ? 'Update Tour' : 'Create Tour')}
                        </button>
                    </div>
                }
            >
                <form id="tourForm" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="admin-label">Tour Name *</label>
                        <input
                            className={`admin-input ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10' : ''}`}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Galle Fort Day Trip"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="admin-label">Description *</label>
                        <textarea
                            className={`admin-input ${errors.description ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10' : ''}`}
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Describe the tour experience..."
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.description}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="admin-label">Price</label>
                            <input
                                className="admin-input"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                placeholder="e.g. USD 45 / person"
                            />
                        </div>
                        <div>
                            <label className="admin-label">Duration</label>
                            <input
                                className="admin-input"
                                value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                placeholder="e.g. Full Day (8 hrs)"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="admin-label">What&apos;s Included (one per line)</label>
                        <textarea
                            className="admin-input"
                            rows={3}
                            value={form.featuresText}
                            onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                            placeholder={"Private Guide\nTransport\nRefreshments"}
                        />
                    </div>
                    <div>
                        <ImageDropZone
                            currentImages={keptImages}
                            onRemoveExisting={(idx) => setKeptImages(prev => prev.filter((_, i) => i !== idx))}
                            onFiles={setImageFiles}
                            label="Tour Images (Max 5) *"
                            multiple={true}
                            maxFiles={5}
                        />
                        {errors.image && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.image}</p>}
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default function ToursPage() {
    return <ToursContent />;
}
