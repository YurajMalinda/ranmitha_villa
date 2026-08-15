'use client'

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailCheck, Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/admin/AuthShell';

function VerifyEmail() {
    const token = useSearchParams().get('token') ?? '';
    const [state, setState] = useState<'working' | 'done' | 'failed'>('working');
    const [message, setMessage] = useState('');
    // React runs effects twice in dev StrictMode; the token is single-use, so a
    // second call would always report failure.
    const attempted = useRef(false);

    useEffect(() => {
        if (attempted.current) return;
        attempted.current = true;

        if (!token) {
            setState('failed');
            setMessage('This confirmation link is incomplete.');
            return;
        }

        (async () => {
            try {
                const res = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ token }),
                });
                const data = await res.json();
                setState(res.ok && data.success ? 'done' : 'failed');
                setMessage(data.message || 'Could not confirm this email address.');
            } catch {
                setState('failed');
                setMessage('Could not reach the server. Please try again.');
            }
        })();
    }, [token]);

    return (
        <AuthShell
            icon={state === 'working' ? <Loader2 size={24} className="animate-spin" /> : <MailCheck size={24} />}
            title="Confirm Email"
            subtitle={state === 'working' ? 'Checking your link…' : 'Account activation'}
            error={state === 'failed' ? message : null}
            notice={state === 'done' ? message : null}
            footer={
                state === 'failed' ? (
                    <Link href="/admin/signup" className="text-emerald-600 hover:underline font-medium">
                        Back to sign up
                    </Link>
                ) : (
                    <Link href="/admin/login" className="text-emerald-600 hover:underline font-medium">
                        Go to sign in
                    </Link>
                )
            }
        >
            <span />
        </AuthShell>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-950" />}>
            <VerifyEmail />
        </Suspense>
    );
}
