import type { FoodDocument, QuantityUnit } from '../types/food.ts'

export type FoodRow = {
  id: string
  foodId: string
  foodSnapshot: FoodDocument | null
  amount: string
  unit: QuantityUnit
}

export function buildFoodsMap(rows: FoodRow[]): Record<string, FoodDocument> {
  return Object.fromEntries(
    rows
      .filter((row) => row.foodId && row.foodSnapshot)
      .map((row) => [
        row.foodId,
        {
          ...(row.foodSnapshot as FoodDocument),
          quantity: { amount: row.amount, unit: row.unit },
        },
      ]),
  )
}

export function foodsMapToRows(
  foods: Record<string, FoodDocument> | undefined,
): FoodRow[] {
  return Object.entries(foods ?? {}).map(([foodId, food]) => ({
    id: crypto.randomUUID(),
    foodId,
    foodSnapshot: food,
    amount: food.quantity.amount,
    unit: food.quantity.unit,
  }))
}
