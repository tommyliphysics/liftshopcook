export type MicronutrientUnit = 'g' | 'mg' | 'ug'

export type Micronutrient = {
  id: string
  name: string
  amount: string
  unit: MicronutrientUnit
}

export type QuantityUnit =
  | 'g'
  | 'kg'
  | 'lb'
  | 'oz'
  | 'mL'
  | 'qt'
  | 'fl oz'
  | ''
  | 'serving'

export type EnergyUnit = 'cal' | 'kJ'

export type FoodDocument = {
  name: string
  quantity: { amount: string; unit: QuantityUnit }
  energy: { amount: string; unit: EnergyUnit }
  macronutrients: {
    carbs: { amount: string; unit: 'g' }
    fat: { amount: string; unit: 'g' }
    protein: { amount: string; unit: 'g' }
  }
  micronutrients: Record<string, { amount: string; unit: MicronutrientUnit }>
  price: {
    amount: string
    currency: string
    brand: string
    retailer: string
  }
}

/** A shared reference food from /public/publicNutritionData/foods, values per 100g edible portion. */
export type PublicFoodDocument = {
  name: string
  source: string
  energy: { amount: string; unit: EnergyUnit }
  macronutrients: {
    carbs: { amount: string; unit: 'g' }
    fat: { amount: string; unit: 'g' }
    protein: { amount: string; unit: 'g' }
  }
  micronutrients: Record<string, { amount: string; unit: MicronutrientUnit }>
}

export type MealTime = '' | 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'

export type MealEntry =
  | { kind: 'food'; foodId: string; name: string }
  | {
      kind: 'recipe'
      recipeId: string
      name: string
      servings: string
      foods: { foodId: string; name: string; amount: string; unit: QuantityUnit }[]
    }

export type MealDocument = {
  date: string
  name: string
  time: MealTime
  foods: Record<string, FoodDocument>
  entries?: MealEntry[]
}

export type RecipeDocument = {
  name: string
  servings: string
  foods: Record<string, FoodDocument>
  recipeText: string
}

export type MealListItem = MealDocument & { id: string }
