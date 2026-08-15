'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, Loader2 } from 'lucide-react';
import { AuthShell, authInputClass, authButtonClass } from '@/components/admin/AuthShell';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            // The server answers the same way whether or not the account exists,
            // so there is nothing here to branch on.
            setNotice(data.message);
            setEmail('');
        } catch {
            setNotice('If that address has an admin account, a reset link is on its way.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            icon={<KeyRound size={24} />}
            title="Forgot Password"
            subtitle="We'll email you a link to set a new one"
            notice={notice}
            footer={
                <Link href="/admin/login" className="text-emerald-600 hover:underline font-medium">
                    Back to sign in
                </Link>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            className={authInputClass}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <button type="submit" disabled={loading} className={authButtonClass}>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Send Reset Link'}
                </button>
            </form>
        </AuthShell>
    );
}
