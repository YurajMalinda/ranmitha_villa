'use client'

import React, { useEffect } from 'react';
import { AlertTriangle, X, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [open]);

    const getIcon = () => {
        switch (variant) {
            case 'warning': return <AlertTriangle className="w-6 h-6 text-amber-500" />;
            case 'info': return <Info className="w-6 h-6 text-blue-500" />;
            default: return <AlertCircle className="w-6 h-6 text-red-500" />;
        }
    };

    const getColors = () => {
        switch (variant) {
            case 'warning': return { bg: 'bg-amber-50 dark:bg-amber-500/10', btn: 'bg-amber-500 hover:bg-amber-600', text: 'text-amber-700 dark:text-amber-400' };
            case 'info': return { bg: 'bg-blue-50 dark:bg-blue-500/10', btn: 'bg-blue-500 hover:bg-blue-600', text: 'text-blue-700 dark:text-blue-400' };
            default: return { bg: 'bg-red-50 dark:bg-red-500/10', btn: 'bg-red-500 hover:bg-red-600', text: 'text-red-700 dark:text-red-400' };
        }
    };

    const colors = getColors();

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex gap-5">
                            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                                {getIcon()}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-none">{title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{message}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-black/5 transition-all transform active:scale-95 ${colors.btn}`}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
