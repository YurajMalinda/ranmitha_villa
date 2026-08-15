'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';
import { AuthShell, authInputClass, authButtonClass } from '@/components/admin/AuthShell';

const MIN_PASSWORD = 12;

export default function SignUpPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setNotice(null);

        // Checked here purely for a faster message; the server enforces both.
        if (form.password.length < MIN_PASSWORD) {
            setError(`Password must be at least ${MIN_PASSWORD} characters.`);
            return;
        }
        if (form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setNotice(data.message);
                setForm({ name: '', email: '', password: '', confirm: '' });
            } else {
                setError(data.message || 'Could not create the account.');
            }
        } catch {
            setError('Could not reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            icon={<UserPlus size={24} />}
            title="Create Admin Account"
            subtitle="Only approved email addresses can register"
            error={error}
            notice={notice}
            footer={
                <>
                    Already have an account?{' '}
                    <Link href="/admin/login" className="text-emerald-600 hover:underline font-medium">
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Full Name *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input id="name" type="text" required autoComplete="name" className={authInputClass}
                            placeholder="Yuraj Malinda" value={form.name} onChange={set('name')} />
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input id="email" type="email" required autoComplete="email" className={authInputClass}
                            placeholder="you@example.com" value={form.email} onChange={set('email')} />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Password *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input id="password" type="password" required autoComplete="new-password" className={authInputClass}
                            placeholder="••••••••••••" value={form.password} onChange={set('password')} />
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
                            placeholder="••••••••••••" value={form.confirm} onChange={set('confirm')} />
                    </div>
                </div>

                <button type="submit" disabled={loading} className={authButtonClass}>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
                </button>
            </form>
        </AuthShell>
    );
}
