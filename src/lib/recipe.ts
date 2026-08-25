import { buildFoodsMap, foodsMapToRows, type FoodRow } from './foodRow.ts'
import type { RecipeDocument } from '../types/food.ts'

export type RecipeFormValues = {
  name: string
  servings: string
  rows: FoodRow[]
  recipeText: string
}

export const EMPTY_RECIPE_FORM_VALUES: RecipeFormValues = {
  name: '',
  servings: '',
  rows: [],
  recipeText: '',
}

export function buildRecipeDocument(
  values: RecipeFormValues,
): RecipeDocument {
  return {
    name: values.name,
    servings: values.servings,
    foods: buildFoodsMap(values.rows),
    recipeText: values.recipeText,
  }
}

export function recipeDocumentToFormValues(
  record: RecipeDocument,
): RecipeFormValues {
  return {
    name: record.name,
    servings: record.servings,
    rows: foodsMapToRows(record.foods),
    recipeText: record.recipeText ?? '',
  }
}
