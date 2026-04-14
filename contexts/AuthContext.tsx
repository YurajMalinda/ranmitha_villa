'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    return document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
}

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize directly from cookie — no useEffect delay, no null render
    const [isAuthenticated, setIsAuthenticated] = useState(() => getCookie('admin_authenticated') === '1');

    const login = useCallback(() => {
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(async () => {
        setIsAuthenticated(false);
        try {
            await fetch('/api/user/logout', { method: 'POST' });
        } catch {
            // ignore
        }
        window.location.href = '/admin/login';
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
