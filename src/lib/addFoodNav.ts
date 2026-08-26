import type { MealFormValues } from './meal.ts'
import type { RecipeFormValues } from './recipe.ts'
import type { FoodDocument } from '../types/food.ts'

/**
 * Carried as router navigation state when a meal/recipe form sends the user
 * to Add Food from a "food not found" search, so the in-progress form isn't
 * lost. `returnTo` is where Add Food navigates back to on success.
 */
export type AddFoodNavRequest =
  | {
      formKind: 'meal'
      mealValues: MealFormValues
      forRowId: string
      returnTo: string
      prefillName: string
    }
  | {
      formKind: 'recipe'
      recipeValues: RecipeFormValues
      returnTo: string
      prefillName: string
    }

/** Carried back from Add Food to the originating meal/recipe form on save. */
export type AddFoodNavResult =
  | {
      formKind: 'meal'
      mealValues: MealFormValues
      forRowId: string
      newFood: FoodDocument & { id: string }
    }
  | {
      formKind: 'recipe'
      recipeValues: RecipeFormValues
      newFood: FoodDocument & { id: string }
    }
