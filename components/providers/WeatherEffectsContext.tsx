'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

interface WeatherEffectsContextValue {
    enabled: boolean;
    toggle: () => void;
}

const WeatherEffectsContext = createContext<WeatherEffectsContextValue | null>(null);

const STORAGE_KEY = 'weather_effects_enabled';

export function WeatherEffectsProvider({ children }: { children: React.ReactNode }) {
    // Defaults to off. Controls both the hero's animated WeatherEffects layer
    // and its base color tint — both only ever apply client-side after live
    // weather has loaded (see HeroSection), so unlike theme/currency there is
    // no SSR tree to mismatch here — but the same lazy-read-after-mount shape
    // is kept anyway for consistency with the other preference contexts.
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === 'true' && !enabled) setEnabled(true);
        } catch {
            /* private browsing / blocked storage — default (off) is fine */
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggle = () => {
        setEnabled((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, String(next));
            } catch {
                /* not persisted this session, still usable */
            }
            return next;
        });
    };

    return (
        <WeatherEffectsContext.Provider value={{ enabled, toggle }}>
            {children}
        </WeatherEffectsContext.Provider>
    );
}

export function useWeatherEffectsToggle() {
    const context = useContext(WeatherEffectsContext);
    if (!context) throw new Error('useWeatherEffectsToggle must be used within a WeatherEffectsProvider');
    return context;
}
