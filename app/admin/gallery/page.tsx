'use client'

import React, { useEffect, useRef, useState } from 'react';
import { adminApi } from '@/services/frontend/adminApi';
import { Plus, Pencil, Trash2, Loader2, ImageIcon, Upload, X, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/admin/Modal';

interface GalleryItem {
    _id: string;
    src: string;
    alt: string;
    title: string;
    description: string;
    order: number;
}

interface PendingFile {
    file: File;
    preview: string;
    title: string;
    status: 'pending' | 'uploading' | 'done' | 'error';
}

function GalleryContent() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    // Bulk upload state
    const [bulkOpen, setBulkOpen] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const bulkFileRef = useRef<HTMLInputElement>(null);

    // Edit state
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<GalleryItem | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '' });
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
    const toast = useToast();

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            const res = await adminApi.get('/gallery/list');
            setItems(res.data.images || []);
        } catch { toast.error('Failed to load gallery'); }
        finally { setLoading(false); }
    };

    // ── Bulk upload ──────────────────────────────────────────────
    const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const newPending: PendingFile[] = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            status: 'pending',
        }));
        setPendingFiles(prev => [...prev, ...newPending]);
        e.target.value = '';
    };

    const removePending = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleBulkUpload = async () => {
        if (!pendingFiles.length) return;
        setUploading(true);
        setUploadProgress(0);
        let done = 0;

        for (let i = 0; i < pendingFiles.length; i++) {
            const item = pendingFiles[i];
            if (item.status === 'done') { done++; continue; }

            setPendingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));
            try {
                const fd = new FormData();
                fd.append('image', item.file);
                fd.append('title', item.title || item.file.name);
                fd.append('alt', item.title || item.file.name);
                fd.append('order', String(i));
                await adminApi.post('/gallery/create', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                setPendingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done' } : f));
            } catch {
                setPendingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f));
            }
            done++;
            setUploadProgress(Math.round((done / pendingFiles.length) * 100));
        }

        setUploading(false);
        fetchItems();
        const errors = pendingFiles.filter(f => f.status === 'error').length;
        if (errors > 0) {
            toast.error(`${errors} image(s) failed to upload`);
        } else {
            toast.success('All images uploaded successfully');
            setBulkOpen(false);
            setPendingFiles([]);
        }
    };

    const openBulk = () => {
        setPendingFiles([]);
        setUploadProgress(0);
        setBulkOpen(true);
    };

    // ── Edit ─────────────────────────────────────────────────────
    const openEdit = (item: GalleryItem) => {
        setEditing(item);
        setEditForm({ title: item.title, description: item.description });
        setEditOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('galleryId', editing._id);
            fd.append('title', editForm.title);
            fd.append('alt', editForm.title);
            fd.append('description', editForm.description);
            await adminApi.post('/gallery/update', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Image updated');
            setEditOpen(false);
            fetchItems();
        } catch (err: any) {
            toast.error('Failed to update', err.response?.data?.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await adminApi.post('/gallery/remove', { galleryId: deleteTarget._id });
            toast.success('Image deleted');
            setDeleteTarget(null);
            fetchItems();
        } catch { toast.error('Failed to delete'); }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" /></div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{items.length} image{items.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={openBulk} className="admin-btn-primary whitespace-nowrap">
                    <Upload size={18} /> Upload Images
                </button>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 cursor-pointer hover:border-emerald-400 transition-colors" onClick={openBulk}>
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No images yet</p>
                    <p className="text-sm mt-1">Click to upload photos</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {items.map((item) => (
                        <div key={item._id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-slate-800 cursor-pointer">
                            <img src={item.src} alt={item.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <button onClick={() => openEdit(item)} className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-700 shadow transition-transform hover:scale-110">
                                    <Pencil size={15} />
                                </button>
                                <button onClick={() => setDeleteTarget(item)} className="p-2 bg-white rounded-full hover:bg-red-50 text-red-500 shadow transition-transform hover:scale-110">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <p className="text-white text-xs truncate">{item.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Bulk Upload Modal ─────────────────────────────── */}
            <Modal
                open={bulkOpen}
                onClose={() => { if (!uploading) { setBulkOpen(false); setPendingFiles([]); } }}
                title="Upload Gallery Images"
                subtitle="Select multiple photos and upload them all at once"
                footer={
                    <div className="flex items-center justify-between gap-3 w-full">
                        <button
                            type="button"
                            onClick={() => bulkFileRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            <Plus size={16} /> Add More
                        </button>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => { setBulkOpen(false); setPendingFiles([]); }} disabled={uploading} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkUpload}
                                disabled={uploading || pendingFiles.filter(f => f.status !== 'done').length === 0}
                                className="admin-btn-primary px-6 py-2.5"
                            >
                                {uploading ? (
                                    <><Loader2 size={16} className="animate-spin" /> Uploading {uploadProgress}%</>
                                ) : (
                                    <><Upload size={16} /> Upload {pendingFiles.filter(f => f.status !== 'done').length} Image{pendingFiles.filter(f => f.status !== 'done').length !== 1 ? 's' : ''}</>
                                )}
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4">
                    {/* Drop zone */}
                    {pendingFiles.length === 0 ? (
                        <div
                            onClick={() => bulkFileRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-emerald-400 transition-colors"
                        >
                            <Upload className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-slate-600" />
                            <p className="font-medium text-gray-600 dark:text-gray-300">Click to select images</p>
                            <p className="text-sm text-gray-400 mt-1">JPG, PNG, WebP — select as many as you want</p>
                        </div>
                    ) : (
                        <div>
                            {/* Progress bar */}
                            {uploading && (
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* Image grid with editable titles */}
                            <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                                {pendingFiles.map((pf, index) => (
                                    <div key={index} className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800">
                                        <img src={pf.preview} alt="" className="w-full aspect-square object-cover" />

                                        {/* Status overlay */}
                                        {pf.status === 'uploading' && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                                            </div>
                                        )}
                                        {pf.status === 'done' && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                                            </div>
                                        )}
                                        {pf.status === 'error' && (
                                            <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
                                                <span className="text-white text-xs font-semibold">Failed</span>
                                            </div>
                                        )}

                                        {/* Remove button */}
                                        {pf.status === 'pending' && !uploading && (
                                            <button
                                                onClick={() => removePending(index)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={10} />
                                            </button>
                                        )}

                                        {/* Editable title */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                                            <input
                                                className="w-full bg-transparent text-white text-xs placeholder-white/50 outline-none truncate"
                                                value={pf.title}
                                                onChange={(e) => setPendingFiles(prev => prev.map((f, i) => i === index ? { ...f, title: e.target.value } : f))}
                                                disabled={uploading || pf.status === 'done'}
                                                placeholder="Image title"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{pendingFiles.length} image{pendingFiles.length !== 1 ? 's' : ''} selected · click title to edit</p>
                        </div>
                    )}

                    <input ref={bulkFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilePick} />
                </div>
            </Modal>

            {/* ── Edit Modal ───────────────────────────────────── */}
            <Modal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                title="Edit Image"
                subtitle="Update title, description or category"
                footer={
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setEditOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            Cancel
                        </button>
                        <button form="editForm" type="submit" disabled={saving} className="admin-btn-primary px-6 py-2.5">
                            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
                        </button>
                    </div>
                }
            >
                <form id="editForm" onSubmit={handleEditSubmit} className="space-y-4">
                    {editing && (
                        <img src={editing.src} alt={editing.alt} className="w-full h-40 object-cover rounded-xl" />
                    )}
                    <div>
                        <label className="admin-label">Title</label>
                        <input
                            className="admin-input"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            placeholder="Image title"
                        />
                    </div>
                    <div>
                        <label className="admin-label">Description</label>
                        <input
                            className="admin-input"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Short caption"
                        />
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Image?"
                message={`Remove "${deleteTarget?.title}" from gallery?`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

export default function GalleryPage() {
    return <GalleryContent />;
}
