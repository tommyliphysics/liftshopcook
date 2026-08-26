import { useState } from 'react'
import FoodSearchModal from './FoodSearchModal.tsx'
import type { FoodListItem } from '../hooks/useFoodRows.ts'
import type { FoodRow } from '../lib/foodRow.ts'
import type { QuantityUnit } from '../types/food.ts'

type RecipeFoodRowsFieldProps = {
  rows: FoodRow[]
  foods: FoodListItem[]
  onAddFood: (food: FoodListItem) => void
  onCreateNewFood: (query: string) => void
  onAmountChange: (id: string, amount: string) => void
  onUnitChange: (id: string, unit: QuantityUnit) => void
  onRemoveRow: (id: string) => void
}

function RecipeFoodRowsField({
  rows,
  foods,
  onAddFood,
  onCreateNewFood,
  onAmountChange,
  onUnitChange,
  onRemoveRow,
}: RecipeFoodRowsFieldProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      {rows.map((row) => (
        <div className="meal-food-row" key={row.id}>
          <span className="meal-food-name">{row.foodSnapshot?.name}</span>
          <input
            type="number"
            placeholder="Amount"
            aria-label="Amount"
            value={row.amount}
            onChange={(e) => onAmountChange(row.id, e.target.value)}
          />
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
          <button
            type="button"
            className="icon-btn"
            onClick={() => onRemoveRow(row.id)}
            aria-label={`Remove ${row.foodSnapshot?.name || 'food'}`}
          >
            &times;
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-secondary btn-full"
        onClick={() => setSearchOpen(true)}
      >
        + Add ingredient
      </button>

      <FoodSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        foods={foods}
        onSelect={onAddFood}
        onCreateNew={onCreateNewFood}
      />
    </>
  )
}

export default RecipeFoodRowsField
