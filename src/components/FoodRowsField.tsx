import type { FoodListItem } from '../hooks/useFoodRows.ts'
import type { FoodRow } from '../lib/foodRow.ts'
import type { QuantityUnit } from '../types/food.ts'

type FoodRowsFieldProps = {
  rows: FoodRow[]
  foods: FoodListItem[]
  onAddRow: () => void
  onFoodChange: (id: string, foodId: string) => void
  onAmountChange: (id: string, amount: string) => void
  onUnitChange: (id: string, unit: QuantityUnit) => void
  onRemoveRow: (id: string) => void
}

function FoodRowsField({
  rows,
  foods,
  onAddRow,
  onFoodChange,
  onAmountChange,
  onUnitChange,
  onRemoveRow,
}: FoodRowsFieldProps) {
  return (
    <>
      {rows.map((row) => (
        <div className="meal-food-row" key={row.id}>
          <select
            aria-label="Food"
            value={row.foodId}
            onChange={(e) => onFoodChange(row.id, e.target.value)}
          >
            <option value="">Select food</option>
            {foods.map((food) => (
              <option key={food.id} value={food.id}>
                {food.name}
              </option>
            ))}
          </select>
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
        onClick={onAddRow}
      >
        + Add food
      </button>
    </>
  )
}

export default FoodRowsField
