'use client'

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/frontend/adminApi';
import { Search, Mail, Phone, Trash2, Shield, User as UserIcon, X } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
}

function UsersContent() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const toast = useToast();

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await adminApi.get('/user/list');
            setUsers(res.data.users || []);
        } catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await adminApi.post('/user/remove', { userId: deleteTarget._id });
            toast.success('User removed', `${deleteTarget.firstname} has been removed.`);
            setDeleteTarget(null);
            fetchUsers();
        } catch { toast.error('Failed to remove user'); }
    };

    const filtered = users.filter(u => {
        const matchesSearch = u.firstname.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" /></div>;

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Users</h1>
                    <p className="admin-subtitle">Manage registered users</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            className="admin-input pl-10 w-full sm:w-64"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className="admin-input w-full sm:w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            <div className="admin-card overflow-hidden">
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No users found</div>
                    ) : (
                        filtered.map((u) => (
                            <div key={u._id} className="p-4 flex flex-col gap-3 bg-white dark:bg-slate-900">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3" onClick={() => setSelectedUser(u)}>
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm uppercase">
                                            {u.firstname[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{u.firstname} {u.lastname}</h3>
                                            <span className={`admin-badge mt-1 ${u.role === 'admin' ? 'admin-badge-warning' : 'admin-badge-neutral'}`}>
                                                {u.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
                                                {u.role?.toUpperCase() || 'USER'}
                                            </span>
                                        </div>
                                    </div>
                                    {u.role !== 'admin' && (
                                        <button onClick={() => setDeleteTarget(u)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No users found</td></tr>
                            ) : (
                                filtered.map((u) => (
                                    <tr key={u._id} className="group cursor-pointer" onClick={() => setSelectedUser(u)}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                                                    {u.firstname[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">{u.firstname} {u.lastname}</div>
                                                    <div className="text-xs text-gray-400">ID: {u._id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col gap-1">
                                                <div className="flex items-center gap-2"><Mail size={14} className="text-emerald-500" /> {u.email}</div>
                                                {u.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-blue-500" /> {u.phone}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${u.role === 'admin' ? 'admin-badge-warning' : 'admin-badge-neutral'}`}>
                                                {u.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                                                {u.role?.toUpperCase() || 'USER'}
                                            </span>
                                        </td>
                                        <td className="text-gray-500 dark:text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                {u.role !== 'admin' && (
                                                    <button onClick={() => setDeleteTarget(u)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedUser(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: 20 }}
                            transition={{ duration: 0.22, type: 'spring', damping: 28, stiffness: 320 }}
                            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Banner */}
                            <div className="relative h-28 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                                <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors backdrop-blur-sm">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="px-6 pb-6 relative">
                                {/* Avatar */}
                                <div className="absolute -top-10 left-6 w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-xl border-2 border-white dark:border-slate-700">
                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-2xl uppercase shadow-inner">
                                        {selectedUser.firstname[0]}
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {selectedUser.firstname} {selectedUser.lastname}
                                        </h2>
                                        <span className={`admin-badge ${selectedUser.role === 'admin' ? 'admin-badge-warning' : 'admin-badge-neutral'}`}>
                                            {selectedUser.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
                                            {selectedUser.role?.toUpperCase() || 'USER'}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Member since {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <div className="bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700 overflow-hidden">
                                        <div className="flex items-center gap-3 p-3.5">
                                            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0"><Mail size={16} /></div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Email</p>
                                                <p className="text-gray-700 dark:text-gray-200 font-medium text-sm truncate">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        {selectedUser.phone && (
                                            <div className="flex items-center gap-3 p-3.5">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0"><Phone size={16} /></div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Phone</p>
                                                    <p className="text-gray-700 dark:text-gray-200 font-medium text-sm">{selectedUser.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 p-3.5">
                                            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0"><Shield size={16} /></div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">User ID</p>
                                                <p className="text-gray-700 dark:text-gray-200 font-mono text-xs truncate">{selectedUser._id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedUser.role !== 'admin' && (
                                        <button
                                            onClick={() => { setSelectedUser(null); setDeleteTarget(selectedUser); }}
                                            className="w-full py-2.5 rounded-xl border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={15} /> Remove User
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Remove User?"
                message={`Permanently remove "${deleteTarget?.firstname}"? They will no longer be able to log in.`}
                confirmLabel="Remove User"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

export default function UsersPage() {
    return <UsersContent />;
}
