/** All prices are entered and stored in this currency — it is the source of
 *  truth for what a guest actually pays at the villa ("Pay at Villa", no
 *  payment gateway). Every other currency is a converted estimate only. */
export const BASE_CURRENCY = 'USD'

export const SUPPORTED_CURRENCIES = ['USD', 'LKR', 'EUR', 'GBP', 'AUD'] as const
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]

export function isSupportedCurrency(value: string): value is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
}

/** Converts a base-currency amount into `currency` using `rates` (base-keyed,
 *  as returned by the exchange-rate API: 1 base unit = rates[XXX] XXX). */
export function convertFromBase(amountBase: number, currency: CurrencyCode, rates: Record<string, number>) {
  if (currency === BASE_CURRENCY) return amountBase
  const rate = rates[currency]
  if (!rate) return amountBase
  return amountBase * rate
}

export function formatCurrency(amount: number, currency: CurrencyCode) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
