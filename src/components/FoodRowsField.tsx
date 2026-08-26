import { useState } from 'react'
import FoodAutocomplete from './FoodAutocomplete.tsx'
import Icon from './Icon.tsx'
import type { FoodListItem, RecipeListItem } from '../hooks/useFoodRows.ts'
import { buildMealEntries, type FoodRow } from '../lib/foodRow.ts'
import { formatUnitLabel } from '../lib/units.ts'
import type { QuantityUnit } from '../types/food.ts'

type FoodRowsFieldProps = {
  rows: FoodRow[]
  foods: FoodListItem[]
  recipes: RecipeListItem[]
  onAddRow: () => void
  onFoodChange: (id: string, foodId: string) => void
  onRecipeChange: (id: string, recipeId: string) => void
  onCreateNewFood: (id: string, query: string) => void
  onAmountChange: (id: string, amount: string) => void
  onUnitChange: (id: string, unit: QuantityUnit) => void
  onRemoveRow: (id: string) => void
}

function FoodRowsField({
  rows,
  foods,
  recipes,
  onAddRow,
  onFoodChange,
  onRecipeChange,
  onCreateNewFood,
  onAmountChange,
  onUnitChange,
  onRemoveRow,
}: FoodRowsFieldProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  function toggleExpanded(id: string) {
    setExpandedRows((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <>
      {rows.map((row) => {
        const isExpanded = expandedRows.has(row.id)
        const recipeEntry =
          row.recipeSnapshot && isExpanded ? buildMealEntries([row])[0] : undefined
        const recipeFoods =
          recipeEntry?.kind === 'recipe' ? recipeEntry.foods : []

        return (
          <div key={row.id}>
            <div className="meal-food-row">
              {row.recipeSnapshot && (
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => toggleExpanded(row.id)}
                  aria-label={
                    isExpanded ? 'Collapse recipe ingredients' : 'Expand recipe ingredients'
                  }
                >
                  <Icon
                    name="chevron-down"
                    size={14}
                    className={isExpanded ? undefined : 'icon-collapsed'}
                  />
                </button>
              )}
              <FoodAutocomplete
                foods={foods}
                recipes={recipes}
                selectedName={row.foodSnapshot?.name ?? row.recipeSnapshot?.name ?? ''}
                onSelectFood={(foodId) => onFoodChange(row.id, foodId)}
                onSelectRecipe={(recipeId) => onRecipeChange(row.id, recipeId)}
                onCreateNew={(query) => onCreateNewFood(row.id, query)}
              />
              {(row.foodSnapshot || row.recipeSnapshot) && (
                <>
                  <input
                    type="number"
                    placeholder="Amount"
                    aria-label="Amount"
                    value={row.amount}
                    onChange={(e) => onAmountChange(row.id, e.target.value)}
                  />
                  {row.recipeSnapshot ? (
                    <select aria-label="Unit" value="serving" disabled>
                      <option value="serving">servings</option>
                    </select>
                  ) : (
                    <select
                      aria-label="Unit"
                      value={row.unit}
                      onChange={(e) =>
                        onUnitChange(row.id, e.target.value as QuantityUnit)
                      }
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                      <option value="oz">oz</option>
                      <option value="mL">mL</option>
                      <option value="qt">qt</option>
                      <option value="fl oz">fl oz</option>
                      <option value="">ea</option>
                    </select>
                  )}
                </>
              )}
              <button
                type="button"
                className="icon-btn"
                onClick={() => onRemoveRow(row.id)}
                aria-label={`Remove ${row.foodSnapshot?.name ?? row.recipeSnapshot?.name ?? 'food'}`}
              >
                &times;
              </button>
            </div>

            {row.recipeSnapshot && isExpanded && (
              <div className="recipe-row-ingredients">
                {recipeFoods.map((food) => (
                  <div className="recipe-row-ingredient" key={food.foodId}>
                    {food.name} — {food.amount}
                    {formatUnitLabel(food.unit)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <button
        type="button"
        className="btn btn-secondary btn-full"
        onClick={onAddRow}
      >
        + Add food
      </button>
    </>
  )
}

export default FoodRowsField
