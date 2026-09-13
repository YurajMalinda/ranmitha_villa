'use client'

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserPlus, Lock, Loader2 } from 'lucide-react';
import { AuthShell, authInputClass, authButtonClass } from '@/components/admin/AuthShell';

const MIN_PASSWORD = 8;

function AcceptInviteForm() {
    const token = useSearchParams().get('token') ?? '';
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < MIN_PASSWORD) {
            setError(`Password must be at least ${MIN_PASSWORD} characters.`);
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/accept-invite', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setNotice(`${data.message} Redirecting to sign in…`);
                setTimeout(() => router.push('/admin/login'), 2000);
            } else {
                setError(data.message || 'Could not activate the account.');
            }
        } catch {
            setError('Could not reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <AuthShell
                icon={<UserPlus size={24} />}
                title="Accept Invite"
                subtitle="Something is missing"
                error="This link is incomplete. Ask whoever invited you to send a new one."
                footer={
                    <Link href="/admin/login" className="text-emerald-600 hover:underline font-medium">
                        Back to sign in
                    </Link>
                }
            >
                <span />
            </AuthShell>
        );
    }

    return (
        <AuthShell
            icon={<UserPlus size={24} />}
            title="Welcome to Ranmitha Villa Admin"
            subtitle="Choose a password to activate your account"
            error={error}
            notice={notice}
            footer={
                <Link href="/admin/login" className="text-emerald-600 hover:underline font-medium">
                    Back to sign in
                </Link>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Password *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input id="password" type="password" required autoComplete="new-password" className={authInputClass}
                            placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                        At least {MIN_PASSWORD} characters, with letters and numbers.
                    </p>
                </div>

                <div>
                    <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Confirm Password *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input id="confirm" type="password" required autoComplete="new-password" className={authInputClass}
                            placeholder="••••••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                    </div>
                </div>

                <button type="submit" disabled={loading} className={authButtonClass}>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Activate Account'}
                </button>
            </form>
        </AuthShell>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-950" />}>
            <AcceptInviteForm />
        </Suspense>
    );
}
