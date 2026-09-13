'use client'

import { useCurrency, SUPPORTED_CURRENCIES } from '@/components/providers/CurrencyContext';
import type { CurrencyCode } from '@/lib/currency';

export function CurrencySelector({ light }: { light?: boolean }) {
    const { currency, setCurrency } = useCurrency();

    return (
        <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            aria-label="Display currency"
            title="Prices convert for reference only — payable in LKR at the villa"
            className={`text-xs font-medium bg-transparent border rounded-full px-2.5 py-1.5 outline-none cursor-pointer transition-colors ${light
                ? 'text-white/90 border-white/30 hover:border-white/60'
                : 'text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
        >
            {SUPPORTED_CURRENCIES.map((code) => (
                <option key={code} value={code} className="text-gray-900">
                    {code}
                </option>
            ))}
        </select>
    );
}
