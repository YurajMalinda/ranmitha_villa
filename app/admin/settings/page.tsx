'use client'

import React, { useEffect, useState } from 'react';
import { Shield, Server, Lock, Info, UserPlus, Loader2, Mail, CheckCircle2, Clock } from 'lucide-react';
import { authInputClass, authButtonClass } from '@/components/admin/AuthShell';

type AdminRow = {
    _id: string;
    email: string;
    name: string;
    isActive: boolean;
    emailVerified: boolean;
    lastLoginAt?: string;
    createdAt: string;
};

function AdminTeamCard() {
    const [admins, setAdmins] = useState<AdminRow[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const loadAdmins = async () => {
        setLoadingList(true);
        try {
            const res = await fetch('/api/admin/list');
            const data = await res.json();
            if (res.ok && data.success) setAdmins(data.admins);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => { loadAdmins(); }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setNotice(null);
        setSending(true);
        try {
            const res = await fetch('/api/admin/invite', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email, name }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setNotice(data.message);
                setEmail('');
                setName('');
                loadAdmins();
            } else {
                setError(data.message || 'Could not send invite.');
            }
        } catch {
            setError('Could not reach the server. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="admin-card p-6 md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <UserPlus size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Admin Team</h3>
                    <p className="text-sm text-gray-500">Invite other admins — no server configuration needed</p>
                </div>
            </div>

            <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 mb-6">
                <input
                    type="text" required placeholder="Name" className={authInputClass}
                    value={name} onChange={(e) => setName(e.target.value)}
                />
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="email" required placeholder="Email address" className={authInputClass}
                        value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button type="submit" disabled={sending} className={`${authButtonClass} sm:w-auto sm:px-6`}>
                    {sending ? <Loader2 size={18} className="animate-spin" /> : 'Invite'}
                </button>
            </form>

            {error && (
                <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">{error}</div>
            )}
            {notice && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-sm mb-4">{notice}</div>
            )}

            {loadingList ? (
                <div className="flex justify-center py-6"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : (
                <div className="space-y-2">
                    {admins.map((a) => (
                        <div key={a._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-800 last:border-0">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{a.name}</p>
                                <p className="text-xs text-gray-500">{a.email}</p>
                            </div>
                            {a.emailVerified ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                    <CheckCircle2 size={14} /> Active
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                                    <Clock size={14} /> Invite pending
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SettingsContent() {
    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Settings</h1>
                    <p className="admin-subtitle">System configuration and profile</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="admin-card p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Admin Profile</h3>
                            <p className="text-sm text-gray-500">Super Administrator</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-1">
                                <Lock size={14} className="text-gray-400" />
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Authentication</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Admin accounts are stored in the database. Invite new admins below —
                                the environment-configured account is a break-glass fallback only.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="admin-card p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Server size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">System Info</h3>
                            <p className="text-sm text-gray-500">Application Status</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-slate-800">
                            <span className="text-sm text-gray-500">Environment</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white uppercase">{process.env.NODE_ENV || 'Development'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-slate-800">
                            <span className="text-sm text-gray-500">Version</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">v1.2.0</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-slate-800">
                            <span className="text-sm text-gray-500">Backend Status</span>
                            <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex gap-3 text-blue-700 dark:text-blue-300 text-sm">
                        <Info size={20} className="shrink-0" />
                        <p>For advanced configuration changes, please contact the development team.</p>
                    </div>
                </div>

                <AdminTeamCard />
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return <SettingsContent />;
}
