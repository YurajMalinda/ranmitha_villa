'use client'

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const authInputClass =
    'w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all';

export const authButtonClass =
    'w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10';

export function AuthShell({
    icon,
    title,
    subtitle,
    error,
    notice,
    children,
    footer,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    error?: string | null;
    notice?: string | null;
    children: React.ReactNode;
    footer?: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100 dark:border-slate-800">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        {icon}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 flex items-start gap-2 border border-red-100 dark:border-red-500/20"
                    >
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {notice && (
                    <div
                        role="status"
                        className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-sm mb-6 flex items-start gap-2 border border-emerald-100 dark:border-emerald-500/20"
                    >
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                        <span>{notice}</span>
                    </div>
                )}

                {children}

                {footer && (
                    <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800 text-center text-sm text-gray-500">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
