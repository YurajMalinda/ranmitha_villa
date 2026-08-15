'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { AuthShell, authInputClass, authButtonClass } from '@/components/admin/AuthShell';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                login();
                router.push('/admin');
            } else {
                setError(data.message || 'Failed to sign in');
            }
        } catch {
            setError('Could not reach the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            icon={<Lock size={24} />}
            title="Admin Sign In"
            subtitle="Sign in to manage Ranmitha Villa"
            error={error}
            footer={
                <>
                    Need an account?{' '}
                    <Link href="/admin/signup" className="text-emerald-600 hover:underline font-medium">
                        Sign up
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        {/* Every credential that can sign in here is an email address;
                            the server enforces that. */}
                        <input
                            id="email"
                            type="email"
                            autoComplete="username"
                            required
                            className={authInputClass}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password *
                        </label>
                        <Link href="/admin/forgot-password" className="text-xs text-emerald-600 hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className={authInputClass}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button type="submit" disabled={loading} className={authButtonClass}>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
                </button>
            </form>
        </AuthShell>
    );
}
