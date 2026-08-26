import type {
  EnergyUnit,
  FoodDocument,
  Micronutrient,
  QuantityUnit,
} from '../types/food.ts'

export type FoodFormValues = {
  name: string
  quantity: string
  quantityUnit: QuantityUnit
  energy: string
  energyUnit: EnergyUnit
  carbohydrates: string
  fat: string
  protein: string
  micronutrients: Micronutrient[]
  brand: string
  retailer: string
  price: string
  currency: string
}

export const EMPTY_FOOD_FORM_VALUES: FoodFormValues = {
  name: '',
  quantity: '',
  quantityUnit: 'g',
  energy: '',
  energyUnit: 'cal',
  carbohydrates: '',
  fat: '',
  protein: '',
  micronutrients: [],
  brand: '',
  retailer: '',
  price: '',
  currency: 'USD',
}

export function buildFoodDocument(values: FoodFormValues): FoodDocument {
  const micronutrients = Object.fromEntries(
    values.micronutrients
      .filter((m) => m.name.trim())
      .map((m) => [m.name.trim(), { amount: m.amount, unit: m.unit }]),
  )

  return {
    name: values.name,
    quantity: { amount: values.quantity, unit: values.quantityUnit },
    energy: { amount: values.energy, unit: values.energyUnit },
    macronutrients: {
      carbs: { amount: values.carbohydrates, unit: 'g' },
      fat: { amount: values.fat, unit: 'g' },
      protein: { amount: values.protein, unit: 'g' },
    },
    micronutrients,
    price: {
      amount: values.price,
      currency: values.currency,
      brand: values.brand,
      retailer: values.retailer,
    },
  }
}

/**
 * Picks the currency with the highest total price across a set of foods
 * (summing every food's price within each currency), so new foods default
 * to whichever currency already dominates the user's data. Returns null if
 * no food has a priced, currencied entry.
 */
export function dominantCurrency(foods: FoodDocument[]): string | null {
  const totals = new Map<string, number>()

  for (const food of foods) {
    const currency = food.price.currency
    if (!currency) continue

    const amount = Number(food.price.amount)
    if (Number.isNaN(amount)) continue

    totals.set(currency, (totals.get(currency) ?? 0) + amount)
  }

  let best: string | null = null
  let bestTotal = -Infinity
  for (const [currency, total] of totals) {
    if (total > bestTotal) {
      bestTotal = total
      best = currency
    }
  }

  return best
}

export function foodDocumentToFormValues(
  record: FoodDocument,
): FoodFormValues {
  return {
    name: record.name,
    quantity: record.quantity.amount,
    quantityUnit: record.quantity.unit,
    energy: record.energy.amount,
    energyUnit: record.energy.unit,
    carbohydrates: record.macronutrients.carbs.amount,
    fat: record.macronutrients.fat.amount,
    protein: record.macronutrients.protein.amount,
    micronutrients: Object.entries(record.micronutrients ?? {}).map(
      ([name, v]) => ({
        id: crypto.randomUUID(),
        name,
        amount: v.amount,
        unit: v.unit,
      }),
    ),
    brand: record.price.brand ?? '',
    retailer: record.price.retailer ?? '',
    price: record.price.amount,
    currency: record.price.currency,
  }
}
