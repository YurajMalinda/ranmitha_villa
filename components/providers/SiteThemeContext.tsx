'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface SiteThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

const STORAGE_KEY = 'site_theme';

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
    // Starts at 'light' on both server and client so the first client render
    // matches the server-rendered HTML — no hydration mismatch. The actual
    // <html class="dark"> is applied pre-paint by an inline script in
    // layout.tsx, so this state exists only to drive the toggle icon; it is
    // synced from storage once after mount and never itself touches the DOM
    // class on mount (only toggleTheme does, imperatively, on user action).
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === 'dark' && theme !== 'dark') setTheme('dark');
        } catch {
            /* private browsing / blocked storage — default theme is fine */
        }
        // Runs once on mount only, to pick up the stored preference.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next: Theme = prev === 'light' ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark', next === 'dark');
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                /* not persisted this session, still usable */
            }
            return next;
        });
    };

    return (
        <SiteThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </SiteThemeContext.Provider>
    );
}

export function useSiteTheme() {
    const context = useContext(SiteThemeContext);
    if (!context) throw new Error('useSiteTheme must be used within a SiteThemeProvider');
    return context;
}
