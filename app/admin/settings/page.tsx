'use client'

import React from 'react';
import { Shield, Server, Lock, Info } from 'lucide-react';

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
                                This admin account is managed via server environment variables.
                                Password changes must be done by updating the server configuration.
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
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return <SettingsContent />;
}
