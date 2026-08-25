import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.ts'
import type { ShoppingListEntry } from './report.ts'
import type { MealListItem } from '../types/food.ts'

export type ResolutionMode = 'update-prices' | 'exchange-rate'
export type ResolutionScope = 'database' | 'this-week'

export type ExchangeRateRecord = {
  from: string
  to: string
  rate: number
}

export function currenciesInUse(entries: ShoppingListEntry[]): string[] {
  const set = new Set<string>()
  for (const entry of entries) {
    if (entry.currency) set.add(entry.currency)
  }
  return [...set].sort()
}

export function hasCurrencyMismatch(entries: ShoppingListEntry[]): boolean {
  return currenciesInUse(entries).length > 1
}

export function resolveShoppingList(
  entries: ShoppingListEntry[],
  targetCurrency: string,
  mode: ResolutionMode,
  priceInputs: Record<string, string>,
  rateInputs: Record<string, string>,
): ShoppingListEntry[] {
  return entries.map((entry) => {
    if (mode === 'update-prices') {
      const input = priceInputs[entry.foodId]
      const amount = input !== undefined && input.trim() !== '' ? Number(input) : entry.totalPrice
      return {
        ...entry,
        totalPrice: Number.isFinite(amount) ? amount : entry.totalPrice,
        currency: targetCurrency,
      }
    }

    if (entry.currency === targetCurrency) return entry

    const rate = Number(rateInputs[entry.currency])
    const amount = Number.isFinite(rate) ? entry.totalPrice * rate : entry.totalPrice
    return { ...entry, totalPrice: amount, currency: targetCurrency }
  })
}

/**
 * Picks the currency (among those in use) that already has a stored
 * exchange-rate record from the most of the other currencies present, so
 * converting to it requires the fewest still-missing rates. Returns null if
 * no stored rate applies to any currency pair present.
 */
export function findBestAutoTarget(
  entries: ShoppingListEntry[],
  rates: ExchangeRateRecord[],
): string | null {
  const currencies = currenciesInUse(entries)
  if (currencies.length <= 1) return null

  const rateKeys = new Set(rates.map((r) => `${r.from}_${r.to}`))

  let best: string | null = null
  let bestCoverage = 1

  for (const target of currencies) {
    const coverage = currencies.filter(
      (c) => c === target || rateKeys.has(`${c}_${target}`),
    ).length
    if (coverage > bestCoverage) {
      bestCoverage = coverage
      best = target
    }
  }

  return best
}

/**
 * Converts every entry whose currency has a stored rate to `targetCurrency`;
 * entries without a matching record are left untouched (still mismatched).
 */
export function autoResolveShoppingList(
  entries: ShoppingListEntry[],
  targetCurrency: string,
  rates: ExchangeRateRecord[],
): ShoppingListEntry[] {
  const rateMap = new Map(rates.map((r) => [`${r.from}_${r.to}`, r.rate]))

  return entries.map((entry) => {
    if (entry.currency === targetCurrency) return entry
    const rate = rateMap.get(`${entry.currency}_${targetCurrency}`)
    if (rate === undefined) return entry
    return { ...entry, totalPrice: entry.totalPrice * rate, currency: targetCurrency }
  })
}

/**
 * "update prices" mode: always corrects the embedded price on every meal
 * this week that contains the food. When `updateCanonicalFood` is true
 * (the "update in database" scope), the food's catalog entry is corrected too.
 */
export async function persistPriceUpdates(
  uid: string,
  meals: MealListItem[],
  entries: ShoppingListEntry[],
  targetCurrency: string,
  priceInputs: Record<string, string>,
  updateCanonicalFood: boolean,
): Promise<void> {
  const writes: Promise<unknown>[] = []

  for (const entry of entries) {
    const input = priceInputs[entry.foodId]
    if (input === undefined || input.trim() === '') continue
    const total = Number(input)
    if (!Number.isFinite(total)) continue

    const instances = meals.filter((meal) => meal.foods?.[entry.foodId])
    if (instances.length === 0) continue

    const perInstance = total / instances.length
    for (const meal of instances) {
      writes.push(
        updateDoc(doc(db, 'users', uid, 'meals', meal.id), {
          [`foods.${entry.foodId}.price.amount`]: perInstance.toFixed(2),
          [`foods.${entry.foodId}.price.currency`]: targetCurrency,
        }),
      )
    }

    if (updateCanonicalFood) {
      writes.push(
        updateDoc(doc(db, 'users', uid, 'foods', entry.foodId), {
          'price.amount': perInstance.toFixed(2),
          'price.currency': targetCurrency,
        }).catch(() => {}),
      )
    }
  }

  await Promise.all(writes)
}

/**
 * "input exchange rate" mode: doesn't touch any food or meal prices — it just
 * records the rate for each source currency so a future mismatch involving
 * that currency pair can be auto-resolved from this record.
 */
export async function persistExchangeRates(
  uid: string,
  fromCurrencies: string[],
  targetCurrency: string,
  rateInputs: Record<string, string>,
  weekStart: string,
  weekEnd: string,
): Promise<void> {
  const writes: Promise<unknown>[] = []
  const updatedAt = new Date().toISOString()

  for (const from of fromCurrencies) {
    const rate = Number(rateInputs[from])
    if (!Number.isFinite(rate)) continue

    writes.push(
      setDoc(doc(db, 'users', uid, 'exchangeRates', `${from}_${targetCurrency}`), {
        from,
        to: targetCurrency,
        rate,
        weekStart,
        weekEnd,
        updatedAt,
      }),
    )
  }

  await Promise.all(writes)
}
