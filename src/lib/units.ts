import type { EnergyUnit, MicronutrientUnit, QuantityUnit } from '../types/food.ts'

export const GRAMS_PER_UNIT: Record<'g' | 'kg' | 'lb' | 'oz', number> = {
  g: 1,
  kg: 1000,
  lb: 453.592,
  oz: 28.3495,
}

export const ML_PER_UNIT: Record<'mL' | 'qt' | 'fl oz', number> = {
  mL: 1,
  qt: 946.353,
  'fl oz': 29.5735,
}

export const CAL_PER_UNIT: Record<EnergyUnit, number> = {
  cal: 1,
  kJ: 1 / 4.184,
}

export const MG_PER_MICRO_UNIT: Record<MicronutrientUnit, number> = {
  mg: 1,
  g: 1000,
  ug: 0.001,
}

export function toCalories(amount: string, unit: EnergyUnit): number {
  const num = Number(amount)
  if (Number.isNaN(num)) return 0
  return num * CAL_PER_UNIT[unit]
}

export function fromCalories(calories: number, unit: EnergyUnit): number {
  return calories / CAL_PER_UNIT[unit]
}

/**
 * Given a total energy in calories and the set of energy units actually used
 * by the foods it was built from, picks whichever of those units yields the
 * largest total (comparing them requires expressing them all in calories
 * first) and returns the total expressed in that unit.
 */
export function bestEnergyTotal(
  totalCalories: number,
  unitsInUse: EnergyUnit[],
): { amount: number; unit: EnergyUnit } {
  if (unitsInUse.length === 0) return { amount: totalCalories, unit: 'cal' }

  let bestUnit = unitsInUse[0]
  let bestAmount = fromCalories(totalCalories, bestUnit)

  for (const unit of unitsInUse.slice(1)) {
    const amount = fromCalories(totalCalories, unit)
    if (amount > bestAmount) {
      bestAmount = amount
      bestUnit = unit
    }
  }

  return { amount: bestAmount, unit: bestUnit }
}

export function toGrams(amount: string, unit: QuantityUnit): number {
  const num = Number(amount)
  if (Number.isNaN(num) || !(unit in GRAMS_PER_UNIT)) return 0
  return num * GRAMS_PER_UNIT[unit as keyof typeof GRAMS_PER_UNIT]
}

export function toMilliliters(amount: string, unit: QuantityUnit): number {
  const num = Number(amount)
  if (Number.isNaN(num) || !(unit in ML_PER_UNIT)) return 0
  return num * ML_PER_UNIT[unit as keyof typeof ML_PER_UNIT]
}

/**
 * Factor to multiply a quantity by when relabeling it from `fromUnit` to
 * `toUnit`. Only defined within a single measurement kind (weight or
 * volume) — crossing kinds (or involving the unitless "whole item" unit)
 * has no valid conversion, so the amount is left as-is.
 */
export function quantityConversionFactor(
  fromUnit: QuantityUnit,
  toUnit: QuantityUnit,
): number {
  if (fromUnit in GRAMS_PER_UNIT && toUnit in GRAMS_PER_UNIT) {
    return (
      GRAMS_PER_UNIT[fromUnit as keyof typeof GRAMS_PER_UNIT] /
      GRAMS_PER_UNIT[toUnit as keyof typeof GRAMS_PER_UNIT]
    )
  }
  if (fromUnit in ML_PER_UNIT && toUnit in ML_PER_UNIT) {
    return (
      ML_PER_UNIT[fromUnit as keyof typeof ML_PER_UNIT] /
      ML_PER_UNIT[toUnit as keyof typeof ML_PER_UNIT]
    )
  }
  return 1
}

/**
 * How many times more (or less) food `amount unit` represents than
 * `baseAmount baseUnit` — e.g. a food stored per 100g used at 250g gives
 * 2.5, so its nutrition can be scaled to match. Converts through grams or
 * milliliters when the two use the same measurement kind (weight or
 * volume) but different units; for count-like units (whole items,
 * servings) or a kind mismatch, compares the raw numbers directly since
 * there's no unit conversion to fall back on.
 */
export function quantityRatio(
  baseAmount: string,
  baseUnit: QuantityUnit,
  amount: string,
  unit: QuantityUnit,
): number {
  const num = Number(amount)
  if (Number.isNaN(num)) return 0

  if (baseUnit in GRAMS_PER_UNIT && unit in GRAMS_PER_UNIT) {
    const baseGrams = toGrams(baseAmount, baseUnit)
    return baseGrams ? toGrams(amount, unit) / baseGrams : 0
  }
  if (baseUnit in ML_PER_UNIT && unit in ML_PER_UNIT) {
    const baseMl = toMilliliters(baseAmount, baseUnit)
    return baseMl ? toMilliliters(amount, unit) / baseMl : 0
  }

  const baseNum = Number(baseAmount)
  return baseNum ? num / baseNum : 0
}

export function toMilligrams(amount: string, unit: MicronutrientUnit): number {
  const num = Number(amount)
  if (Number.isNaN(num)) return 0
  return num * MG_PER_MICRO_UNIT[unit]
}

/** Display label for a quantity unit (the "ea" whole-item unit is stored as ''). */
export function formatUnitLabel(unit: QuantityUnit): string {
  return unit === '' ? 'ea' : unit
}

export function formatGrams(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`
  return `${Math.round(grams)} g`
}

export function formatMilliliters(mL: number): string {
  if (mL >= 1000) return `${(mL / 1000).toFixed(2)} L`
  return `${Math.round(mL)} mL`
}

export function formatQuantity(entry: {
  totalGrams: number
  totalMilliliters: number
  totalCount: number
}): string {
  if (entry.totalCount > 0) {
    return String(Math.round(entry.totalCount * 100) / 100)
  }
  if (entry.totalMilliliters > 0) {
    return formatMilliliters(entry.totalMilliliters)
  }
  return formatGrams(entry.totalGrams)
}

export function formatMilligrams(mg: number): string {
  if (mg >= 1000) return `${(mg / 1000).toFixed(2)} g`
  return `${Math.round(mg)} mg`
}
