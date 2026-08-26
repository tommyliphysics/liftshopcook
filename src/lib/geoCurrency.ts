import { CURRENCIES } from '../data/currencies.ts'

/**
 * Looks up the visitor's currency from their IP address via a free, keyless
 * IP-geolocation API. Used only as a last-resort default (when there's no
 * priced food data yet to infer a dominant currency from), so any failure
 * here — network error, timeout, unrecognized currency — just resolves to
 * null and the caller falls back to its own default.
 */
export async function currencyFromIP(): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!response.ok) return null

    const data = await response.json()
    const currency = typeof data.currency === 'string' ? data.currency : null
    if (!currency) return null

    return CURRENCIES.some((c) => c.code === currency) ? currency : null
  } catch {
    return null
  }
}
