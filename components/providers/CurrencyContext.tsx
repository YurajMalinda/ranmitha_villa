'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CurrencyService } from '@/services/frontend/currency.service';
import {
    BASE_CURRENCY,
    CurrencyCode,
    SUPPORTED_CURRENCIES,
    convertFromBase,
    formatCurrency,
    isSupportedCurrency,
} from '@/lib/currency';

interface CurrencyContextValue {
    currency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
    /** True once live rates have loaded — until then, or if they failed to
     *  load, conversion silently falls back to LKR rather than showing a
     *  wrong number. */
    ratesReady: boolean;
    format: (amountLKR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = 'display_currency';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    // Starts at the base currency on both server and client so the first
    // client render matches the server-rendered HTML exactly; the stored
    // preference (an external system) is applied after mount, once hydration
    // has already committed, so it never causes a hydration mismatch.
    const [currency, setCurrencyState] = useState<CurrencyCode>(BASE_CURRENCY);
    const [rates, setRates] = useState<Record<string, number> | null>(null);

    useEffect(() => {
        let stored: string | null = null;
        try {
            stored = localStorage.getItem(STORAGE_KEY);
        } catch {
            /* private browsing / blocked storage — default currency is fine */
        }
        if (stored && isSupportedCurrency(stored) && stored !== currency) {
            setCurrencyState(stored);
        }

        CurrencyService.getRates()
            .then((data) => {
                if (data?.success && data.rates) setRates(data.rates);
            })
            .catch(() => {
                /* conversion just falls back to LKR below */
            });
        // Runs once on mount only — reads the stored preference and kicks off
        // the rates fetch; `currency` is read only to avoid a redundant set.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setCurrency = useCallback((next: CurrencyCode) => {
        setCurrencyState(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* not persisted this session, still usable */
        }
    }, []);

    const format = useCallback(
        (amountLKR: number) => {
            if (currency === BASE_CURRENCY || !rates) return formatCurrency(amountLKR, BASE_CURRENCY);
            return formatCurrency(convertFromBase(amountLKR, currency, rates), currency);
        },
        [currency, rates]
    );

    const value = useMemo(
        () => ({ currency, setCurrency, ratesReady: !!rates, format }),
        [currency, setCurrency, rates, format]
    );

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
    return context;
}

export { SUPPORTED_CURRENCIES };
