import {
  buildFoodsMap,
  buildMealEntries,
  mealToRows,
  type FoodRow,
} from './foodRow.ts'
import type { FoodDocument, MealDocument, MealTime } from '../types/food.ts'

export type MealFoodRow = FoodRow

export type MealFormValues = {
  date: string
  time: MealTime
  name: string
  rows: FoodRow[]
}

export const EMPTY_MEAL_FORM_VALUES: MealFormValues = {
  date: '',
  time: '',
  name: '',
  rows: [],
}

export function buildMealDocument(
  values: MealFormValues,
  currentFoods: Record<string, FoodDocument> = {},
): MealDocument {
  return {
    date: values.date,
    name: values.name,
    time: values.time,
    foods: buildFoodsMap(values.rows, currentFoods),
    entries: buildMealEntries(values.rows),
  }
}

export function mealDocumentToFormValues(
  record: MealDocument,
): MealFormValues {
  return {
    date: record.date,
    time: record.time,
    name: record.name,
    rows: mealToRows(record),
  }
}
