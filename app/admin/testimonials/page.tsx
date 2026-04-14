'use client'

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/services/frontend/adminApi';
import { Plus, Pencil, Trash2, Loader2, Quote, Star } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/admin/Modal';

interface Testimonial {
    _id: string;
    author: string;
    quote: string;
    rating: number;
    source: string;
}

const SOURCES = ['TripAdvisor', 'Booking.com', 'Airbnb', 'Google', 'Facebook', 'Direct'];

function TestimonialsContent() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Testimonial | null>(null);
    const [form, setForm] = useState({ author: '', quote: '', rating: '5', source: 'TripAdvisor' });
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const toast = useToast();

    useEffect(() => { fetchTestimonials(); }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await adminApi.get('/testimonial/list');
            setTestimonials(res.data.testimonials || []);
        } catch { toast.error('Failed to load testimonials'); }
        finally { setLoading(false); }
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.author.trim()) e.author = 'Author is required';
        if (!form.quote.trim()) e.quote = 'Quote is required';
        const r = Number(form.rating);
        if (isNaN(r) || r < 1 || r > 5) e.rating = 'Rating must be 1–5';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = { ...form, rating: Number(form.rating) };
            if (editing) {
                await adminApi.post('/testimonial/update', { testimonialId: editing._id, ...payload });
                toast.success('Testimonial updated');
            } else {
                await adminApi.post('/testimonial/create', payload);
                toast.success('Testimonial added');
            }
            setModalOpen(false);
            fetchTestimonials();
        } catch (err: any) {
            toast.error('Failed to save', err.response?.data?.message || 'Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await adminApi.post('/testimonial/remove', { testimonialId: deleteTarget._id });
            toast.success('Testimonial deleted');
            setDeleteTarget(null);
            fetchTestimonials();
        } catch { toast.error('Failed to delete'); }
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ author: '', quote: '', rating: '5', source: 'TripAdvisor' });
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (t: Testimonial) => {
        setEditing(t);
        setForm({ author: t.author, quote: t.quote, rating: String(t.rating), source: t.source });
        setErrors({});
        setModalOpen(true);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" /></div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage guest reviews shown on the website</p>
                </div>
                <button onClick={openAdd} className="admin-btn-primary whitespace-nowrap">
                    <Plus size={18} /> Add Testimonial
                </button>
            </div>

            {testimonials.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
                    <Quote className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No testimonials yet. Add your first guest review.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {testimonials.map((t) => (
                        <div key={t._id} className="admin-card p-6 relative group">
                            <Quote className="w-8 h-8 text-gray-200 dark:text-slate-700 absolute top-4 right-4" />
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                                ))}
                                <span className="text-xs text-gray-400 ml-1">{Number(t.rating).toFixed(1)}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-4 line-clamp-3">&ldquo;{t.quote}&rdquo;</p>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                                <div>
                                    <p className="font-semibold text-sm text-gray-800 dark:text-white">{t.author}</p>
                                    <p className="text-xs text-gray-400">{t.source}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-blue-500 transition-colors">
                                        <Pencil size={15} />
                                    </button>
                                    <button onClick={() => setDeleteTarget(t)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Testimonial?"
                message={`Remove review by "${deleteTarget?.author}"?`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Testimonial' : 'Add Testimonial'}
                subtitle="Guest review details"
                footer={
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            Cancel
                        </button>
                        <button form="testimonialForm" type="submit" disabled={saving} className="admin-btn-primary px-6 py-2.5">
                            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (editing ? 'Update' : 'Add')}
                        </button>
                    </div>
                }
            >
                <form id="testimonialForm" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="admin-label">Author *</label>
                        <input
                            className={`admin-input ${errors.author ? 'border-red-400' : ''}`}
                            value={form.author}
                            onChange={(e) => setForm({ ...form, author: e.target.value })}
                            placeholder="e.g. Happy Guest"
                        />
                        {errors.author && <p className="text-red-500 text-xs mt-1 ml-1">{errors.author}</p>}
                    </div>
                    <div>
                        <label className="admin-label">Review *</label>
                        <textarea
                            className={`admin-input ${errors.quote ? 'border-red-400' : ''}`}
                            rows={4}
                            value={form.quote}
                            onChange={(e) => setForm({ ...form, quote: e.target.value })}
                            placeholder="What did the guest say?"
                        />
                        {errors.quote && <p className="text-red-500 text-xs mt-1 ml-1">{errors.quote}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="admin-label">Rating (1–5) *</label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                step="0.1"
                                className={`admin-input ${errors.rating ? 'border-red-400' : ''}`}
                                value={form.rating}
                                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                            />
                            {errors.rating && <p className="text-red-500 text-xs mt-1 ml-1">{errors.rating}</p>}
                        </div>
                        <div>
                            <label className="admin-label">Source</label>
                            <select
                                className="admin-input"
                                value={form.source}
                                onChange={(e) => setForm({ ...form, source: e.target.value })}
                            >
                                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default function TestimonialsPage() {
    return <TestimonialsContent />;
}
