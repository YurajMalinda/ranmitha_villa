'use client'

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/services/frontend/adminApi';
import { Plus, Pencil, Trash2, Loader2, Check, Search, Filter } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ImageDropZone from '@/components/admin/ImageDropZone';
import Modal from '@/components/admin/Modal';

interface Room {
    _id: string;
    type: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    images: string[];
    beds: { king: number; queen: number; twin: number };
    size: string;
    amenities: string[];
    bathrooms: number;
    hasAC: boolean;
    status: 'available' | 'maintenance' | 'booked';
    bedrooms?: number;
}

function RoomsContent() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Room | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const toast = useToast();

    const [form, setForm] = useState({
        type: '', description: '', pricePerNight: '', maxGuests: '',
        size: '', amenities: '', bathrooms: '1', hasAC: true,
        beds: { king: 0, queen: 0, twin: 0 }
    });
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [keptImages, setKeptImages] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => { fetchRooms(); }, []);

    const fetchRooms = async () => {
        try {
            const res = await adminApi.get('/room/list');
            setRooms(res.data.rooms || []);
        } catch { toast.error('Failed to load rooms'); }
        finally { setLoading(false); }
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.type) e.type = 'Room type is required';
        if (!form.description) e.description = 'Description is required';
        if (!form.pricePerNight) e.pricePerNight = 'Price is required';
        const totalImages = keptImages.length + newFiles.length;
        if (totalImages === 0) e.image = 'At least one image is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('type', form.type);
            fd.append('description', form.description);
            fd.append('pricePerNight', form.pricePerNight);
            fd.append('maxGuests', form.maxGuests);
            fd.append('bathrooms', form.bathrooms);
            fd.append('size', form.size);
            const amenitiesList = form.amenities.split(',').map(a => a.trim()).filter(Boolean);
            fd.append('amenities', JSON.stringify(amenitiesList));
            fd.append('hasAC', String(form.hasAC));
            fd.append('beds', JSON.stringify(form.beds));
            fd.append('existingImages', JSON.stringify(keptImages));
            newFiles.forEach((file, index) => {
                if (index < 5) fd.append(`image${index + 1}`, file);
            });

            if (editing) {
                fd.append('roomId', editing._id);
                await adminApi.post('/room/update', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Room updated', `${form.type} has been updated.`);
            } else {
                fd.append('status', 'available');
                fd.append('bedrooms', '1');
                await adminApi.post('/room/add', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Room created', `${form.type} has been added.`);
            }
            setModalOpen(false);
            fetchRooms();
        } catch (err: any) {
            toast.error('Failed to save room', err.response?.data?.message || 'Try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await adminApi.post('/room/remove', { roomId: deleteTarget._id });
            toast.success('Room deleted');
            setDeleteTarget(null);
            fetchRooms();
        } catch { toast.error('Failed to delete room'); }
    };

    const toggleStatus = async (room: Room) => {
        const newStatus = room.status === 'maintenance' ? 'available' : 'maintenance';
        try {
            await adminApi.post('/room/updateStatus', { roomId: room._id, status: newStatus });
            toast.success('Status updated', `${room.type} is now ${newStatus}`);
            fetchRooms();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ type: '', description: '', pricePerNight: '', maxGuests: '2', size: '', amenities: '', bathrooms: '1', hasAC: true, beds: { king: 1, queen: 0, twin: 0 } });
        setNewFiles([]);
        setKeptImages([]);
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (r: Room) => {
        setEditing(r);
        setForm({
            type: r.type, description: r.description, pricePerNight: String(r.pricePerNight),
            maxGuests: String(r.maxGuests), size: r.size, amenities: r.amenities.join(', '),
            bathrooms: String(r.bathrooms), hasAC: r.hasAC, beds: r.beds || { king: 0, queen: 0, twin: 0 }
        });
        setNewFiles([]);
        setKeptImages(r.images || []);
        setErrors({});
        setModalOpen(true);
    };

    const filteredRooms = rooms.filter(r => {
        const matchesSearch = r.type.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500" /></div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rooms</h1><p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage accommodation</p></div>
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full md:w-64 transition-all"
                            placeholder="Search rooms..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            className="pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full md:w-auto transition-all dark:text-gray-200"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="booked">Booked</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                    <button onClick={openAdd} className="admin-btn-primary whitespace-nowrap"><Plus size={18} /> Add Room</button>
                </div>
            </div>

            {filteredRooms.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
                    <p>No rooms found matching your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRooms.map(r => (
                        <div key={r._id} className="admin-card flex flex-col relative group overflow-hidden">
                            <div className="relative h-48 overflow-hidden">
                                <img src={r.images?.[0] || '/placeholder.jpg'} alt={r.type} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                {r.images && r.images.length > 1 && (
                                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1 border border-white/10">
                                        <span className="text-emerald-400">📷</span> {r.images.length}
                                    </div>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleStatus(r); }}
                                    className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold uppercase backdrop-blur-md shadow-sm transition-colors hover:opacity-90 ${r.status === 'available' ? 'bg-emerald-500/90 text-white' :
                                        r.status === 'booked' ? 'bg-blue-500/90 text-white' :
                                            'bg-gray-500/90 text-white'
                                        }`}
                                >
                                    {r.status}
                                </button>
                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                    <h3 className="text-lg font-bold shadow-black drop-shadow-md">{r.type}</h3>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">LKR {r.pricePerNight.toLocaleString()}<span className="text-gray-400 text-xs font-normal"> / night</span></p>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1"><span className="font-semibold">{r.maxGuests}</span> Guests</span>
                                        <span className="flex items-center gap-1"><span className="font-semibold">{r.size}</span> ft²</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{r.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {r.amenities.slice(0, 3).map((a, i) => (
                                        <span key={i} className="px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-[10px] font-medium uppercase tracking-wide">{a}</span>
                                    ))}
                                    {r.amenities.length > 3 && (
                                        <span className="px-2 py-1 rounded-md bg-gray-50 dark:bg-slate-800/50 text-gray-400 text-[10px] font-medium">+{r.amenities.length - 3}</span>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-blue-500 transition-colors"><Pencil size={18} /></button>
                                    <button onClick={() => setDeleteTarget(r)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog open={!!deleteTarget} title="Delete Room?" message={`Remove "${deleteTarget?.type}"?`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Room' : 'Add Room'}
                subtitle="Manage room details and gallery"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                        <button form="roomForm" type="submit" disabled={saving} className="admin-btn-primary px-6 py-2.5">{saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (editing ? 'Update Room' : 'Create Room')}</button>
                    </div>
                }
            >
                <form id="roomForm" onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="admin-label">Room Type *</label>
                            <input className={`admin-input ${errors.type ? 'border-red-400' : ''}`} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="e.g. Deluxe Double" />
                            {errors.type && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.type}</p>}
                        </div>
                        <div>
                            <label className="admin-label">Price (LKR) *</label>
                            <input type="number" className={`admin-input ${errors.pricePerNight ? 'border-red-400' : ''}`} value={form.pricePerNight} onChange={e => setForm({ ...form, pricePerNight: e.target.value })} placeholder="e.g. 15000" />
                            {errors.pricePerNight && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.pricePerNight}</p>}
                        </div>
                        <div><label className="admin-label">Max Guests</label><input type="number" className="admin-input" value={form.maxGuests} onChange={e => setForm({ ...form, maxGuests: e.target.value })} /></div>
                        <div><label className="admin-label">Size (sq ft)</label><input className="admin-input" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} /></div>
                        <div><label className="admin-label">Bathrooms</label><input type="number" className="admin-input" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} /></div>
                    </div>

                    <div>
                        <label className="admin-label">Description *</label>
                        <textarea rows={3} className={`admin-input ${errors.description ? 'border-red-400' : ''}`} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the room..." />
                        {errors.description && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="admin-label">Beds Distribution</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[{ id: 'king', label: 'King' }, { id: 'queen', label: 'Queen' }, { id: 'twin', label: 'Twin' }].map(item => (
                                <div key={item.id} className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">{item.label}</label>
                                    <input type="number" min={0} className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors" value={form.beds[item.id as keyof typeof form.beds]} onChange={e => setForm({ ...form, beds: { ...form.beds, [item.id]: Number(e.target.value) } })} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors" onClick={() => setForm({ ...form, hasAC: !form.hasAC })}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${form.hasAC ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'}`}>{form.hasAC && <Check size={13} className="text-white" strokeWidth={3} />}</div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Air Conditioning</span>
                    </div>

                    <div>
                        <label className="admin-label">Amenities</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl min-h-[48px] focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                            {form.amenities.split(',').map(a => a.trim()).filter(Boolean).map((amenity, idx) => (
                                <span key={idx} className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                                    {amenity}
                                    <button type="button" onClick={() => {
                                        const current = form.amenities.split(',').map(a => a.trim()).filter(Boolean);
                                        setForm({ ...form, amenities: current.filter((_, i) => i !== idx).join(', ') });
                                    }} className="hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors text-base leading-none">×</button>
                                </span>
                            ))}
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 py-0.5 text-sm min-w-[140px] outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
                                placeholder="Type amenity and press Enter..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                            setForm({ ...form, amenities: form.amenities ? form.amenities + ', ' + val : val });
                                            e.currentTarget.value = '';
                                        }
                                    }
                                }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5 ml-1">Press Enter to add each amenity as a tag</p>
                    </div>

                    <div>
                        <ImageDropZone multiple={true} maxFiles={5} currentImages={keptImages} onFiles={setNewFiles} onRemoveExisting={i => setKeptImages(p => p.filter((_, x) => x !== i))} label="Room Images (Max 5) *" />
                        {errors.image && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.image}</p>}
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default function RoomsPage() {
    return <RoomsContent />;
}
