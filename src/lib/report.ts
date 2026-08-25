import { toCalories, toGrams, toMilligrams } from './units.ts'
import type { EnergyUnit, MealDocument } from '../types/food.ts'

export type ShoppingListEntry = {
  foodId: string
  name: string
  brand: string
  totalGrams: number
  totalPrice: number
  currency: string
}

export type MicronutrientAverage = {
  name: string
  amountMg: number
}

export type ReportData = {
  days: number
  avgCaloriesPerDay: number
  energyUnitsInUse: EnergyUnit[]
  avgCostPerDay: number
  costCurrency: string | null
  shoppingList: ShoppingListEntry[]
  avgCarbs: number
  avgFat: number
  avgProtein: number
  micronutrients: MicronutrientAverage[]
}

export function computeReport(meals: MealDocument[], days: number): ReportData {
  let totalCalories = 0
  let totalCost = 0
  let totalCarbs = 0
  let totalFat = 0
  let totalProtein = 0
  const currencies = new Set<string>()
  const energyUnits = new Set<EnergyUnit>()
  const microMap = new Map<string, number>()
  const shoppingMap = new Map<
    string,
    { name: string; brand: string; totalGrams: number; totalPrice: number; currency: string }
  >()

  for (const meal of meals) {
    for (const [foodId, food] of Object.entries(meal.foods ?? {})) {
      totalCalories += toCalories(food.energy.amount, food.energy.unit)
      if (food.energy.unit) energyUnits.add(food.energy.unit)

      const price = Number(food.price.amount)
      const safePrice = Number.isNaN(price) ? 0 : price
      totalCost += safePrice
      if (food.price.currency) currencies.add(food.price.currency)

      totalCarbs += Number(food.macronutrients.carbs.amount) || 0
      totalFat += Number(food.macronutrients.fat.amount) || 0
      totalProtein += Number(food.macronutrients.protein.amount) || 0

      for (const [microName, micro] of Object.entries(
        food.micronutrients ?? {},
      )) {
        const mg = toMilligrams(micro.amount, micro.unit)
        microMap.set(microName, (microMap.get(microName) ?? 0) + mg)
      }

      const grams = toGrams(food.quantity.amount, food.quantity.unit)
      const existing = shoppingMap.get(foodId)
      if (existing) {
        existing.totalGrams += grams
        existing.totalPrice += safePrice
      } else {
        shoppingMap.set(foodId, {
          name: food.name,
          brand: food.price.brand,
          totalGrams: grams,
          totalPrice: safePrice,
          currency: food.price.currency,
        })
      }
    }
  }

  const safeDays = days || 1

  return {
    days,
    avgCaloriesPerDay: totalCalories / safeDays,
    energyUnitsInUse: [...energyUnits],
    avgCostPerDay: totalCost / safeDays,
    costCurrency: currencies.size === 1 ? [...currencies][0] : null,
    shoppingList: [...shoppingMap.entries()].map(([foodId, entry]) => ({
      foodId,
      ...entry,
    })),
    avgCarbs: totalCarbs / safeDays,
    avgFat: totalFat / safeDays,
    avgProtein: totalProtein / safeDays,
    micronutrients: [...microMap.entries()].map(([name, totalMg]) => ({
      name,
      amountMg: totalMg / safeDays,
    })),
  }
}
