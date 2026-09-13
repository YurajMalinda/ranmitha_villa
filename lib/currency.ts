/** All prices are entered and stored in this currency — it is the source of
 *  truth for what a guest actually pays at the villa ("Pay at Villa", no
 *  payment gateway). Every other currency is a converted estimate only. */
export const BASE_CURRENCY = 'LKR'

export const SUPPORTED_CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP', 'AUD'] as const
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]

export function isSupportedCurrency(value: string): value is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
}

/** Converts an LKR amount into `currency` using `rates` (LKR-based, as returned
 *  by the exchange-rate API: 1 LKR = rates[XXX] XXX). */
export function convertFromBase(amountLKR: number, currency: CurrencyCode, rates: Record<string, number>) {
  if (currency === BASE_CURRENCY) return amountLKR
  const rate = rates[currency]
  if (!rate) return amountLKR
  return amountLKR * rate
}

/** LKR keeps the plain "LKR 12,345" look already used across the site;
 *  everything else goes through Intl for correct symbols and grouping. */
export function formatCurrency(amount: number, currency: CurrencyCode) {
  if (currency === BASE_CURRENCY) {
    return `LKR ${Math.round(amount).toLocaleString()}`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
