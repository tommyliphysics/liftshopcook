import { buildFoodsMap, foodsMapToRows, type FoodRow } from './foodRow.ts'
import type { MealDocument, MealTime } from '../types/food.ts'

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

export function buildMealDocument(values: MealFormValues): MealDocument {
  return {
    date: values.date,
    name: values.name,
    time: values.time,
    foods: buildFoodsMap(values.rows),
  }
}

export function mealDocumentToFormValues(
  record: MealDocument,
): MealFormValues {
  return {
    date: record.date,
    time: record.time,
    name: record.name,
    rows: foodsMapToRows(record.foods),
  }
}
