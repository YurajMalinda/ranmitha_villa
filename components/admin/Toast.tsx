'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
    warning: <AlertTriangle size={18} />,
};

const colors: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', icon: '#16a34a', text: '#15803d' },
    error: { bg: '#fef2f2', border: '#fecaca', icon: '#dc2626', text: '#b91c1c' },
    info: { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb', text: '#1d4ed8' },
    warning: { bg: '#fffbeb', border: '#fde68a', icon: '#d97706', text: '#b45309' },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
    const c = colors[toast.type];
    return (
        <div
            style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                minWidth: 320,
                maxWidth: 420,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                animation: 'toast-slide 0.3s ease',
            }}
        >
            <span style={{ color: c.icon, flexShrink: 0, marginTop: 1 }}>{icons[toast.type]}</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: c.text }}>{toast.title}</div>
                {toast.message && <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{toast.message}</div>}
            </div>
            <button
                onClick={() => onDismiss(toast.id)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, flexShrink: 0 }}
            >
                <X size={16} />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idCounter = useRef(0);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
        const id = ++idCounter.current;
        setToasts((prev) => [...prev, { id, type, title, message, duration }]);
        if (duration > 0) setTimeout(() => dismiss(id), duration);
    }, [dismiss]);

    const api: ToastContextType = {
        success: (t, m) => addToast('success', t, m),
        error: (t, m) => addToast('error', t, m, 6000),
        info: (t, m) => addToast('info', t, m),
        warning: (t, m) => addToast('warning', t, m, 5000),
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div
                style={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                }}
            >
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
