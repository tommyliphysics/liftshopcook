export type MicronutrientUnit = 'g' | 'mg'

export type Micronutrient = {
  id: string
  name: string
  amount: string
  unit: MicronutrientUnit
}

export type QuantityUnit = 'g' | 'kg' | 'lb' | 'oz'

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

export type MealTime = '' | 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'

export type MealDocument = {
  date: string
  name: string
  time: MealTime
  foods: Record<string, FoodDocument>
}

export type RecipeDocument = {
  name: string
  servings: string
  foods: Record<string, FoodDocument>
  recipeText: string
}

export type MealListItem = MealDocument & { id: string }
