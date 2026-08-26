import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BackButton from './BackButton.tsx'
import ConfirmDeleteModal from './ConfirmDeleteModal.tsx'
import FoodRowsField from './FoodRowsField.tsx'
import Icon from './Icon.tsx'
import { useFoodRows } from '../hooks/useFoodRows.ts'
import type { AddFoodNavResult } from '../lib/addFoodNav.ts'
import { EMPTY_MEAL_FORM_VALUES, type MealFormValues } from '../lib/meal.ts'
import type { FoodDocument, MealTime } from '../types/food.ts'
import '../pages/pages.css'

type MealFormProps = {
  title: string
  submitLabel: string
  savingLabel: string
  initialValues?: MealFormValues
  onSubmit: (
    values: MealFormValues,
    currentFoods: Record<string, FoodDocument>,
  ) => Promise<void>
  onDelete?: () => Promise<void>
  resetOnSuccess?: boolean
}

function MealForm({
  title,
  submitLabel,
  savingLabel,
  initialValues,
  onSubmit,
  onDelete,
  resetOnSuccess = true,
}: MealFormProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const restoreResult = location.state as AddFoodNavResult | null
  const restoredMeal =
    restoreResult?.formKind === 'meal' ? restoreResult : null

  const start = restoredMeal?.mealValues ?? initialValues ?? EMPTY_MEAL_FORM_VALUES
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [date, setDate] = useState(start.date)
  const [mealTime, setMealTime] = useState<MealTime>(start.time)
  const [name, setName] = useState(start.name)
  const {
    foods,
    recipes,
    rows,
    setRows,
    addRow,
    updateRowFood,
    updateRowRecipe,
    updateRowAmount,
    updateRowUnit,
    removeRow,
  } = useFoodRows(start.rows)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const appliedNewFood = useRef(false)
  useEffect(() => {
    if (appliedNewFood.current || !restoredMeal) return
    appliedNewFood.current = true

    const { newFood, forRowId } = restoredMeal
    setRows((current) =>
      current.map((row) =>
        row.id === forRowId
          ? {
              ...row,
              foodId: newFood.id,
              foodSnapshot: newFood,
              recipeId: '',
              recipeSnapshot: null,
              amount: newFood.quantity.amount,
              unit: newFood.quantity.unit,
            }
          : row,
      ),
    )
    navigate(location.pathname + location.search, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (recipes.length === 0) return
    setRows((current) => {
      let changed = false
      const next = current.map((row) => {
        if (row.recipeId && !row.recipeSnapshot) {
          const recipe = recipes.find((r) => r.id === row.recipeId)
          if (recipe) {
            changed = true
            return { ...row, recipeSnapshot: recipe }
          }
        }
        return row
      })
      return changed ? next : current
    })
  }, [recipes, setRows])

  function handleCreateNewFood(rowId: string, query: string) {
    navigate('/add-food', {
      state: {
        formKind: 'meal',
        mealValues: { date, time: mealTime, name, rows },
        forRowId: rowId,
        returnTo: location.pathname + location.search,
        prefillName: query,
      },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const currentFoods = Object.fromEntries(
        foods.map((food) => [food.id, food]),
      )
      await onSubmit({ date, time: mealTime, name, rows }, currentFoods)

      if (resetOnSuccess) {
        setDate('')
        setMealTime('')
        setName('')
        setRows([])
      }
    } catch {
      setError('Could not save this meal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page page-center">
      <div className="title-row">
        <h1>{title}</h1>
        {onDelete && (
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete meal"
          >
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <label htmlFor="time">Time</label>
        <select
          id="time"
          value={mealTime}
          onChange={(e) => setMealTime(e.target.value as MealTime)}
        >
          <option value=""></option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
          <option value="drink">Drink</option>
        </select>

        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <FoodRowsField
          rows={rows}
          foods={foods}
          recipes={recipes}
          onAddRow={addRow}
          onFoodChange={updateRowFood}
          onRecipeChange={updateRowRecipe}
          onCreateNewFood={handleCreateNewFood}
          onAmountChange={updateRowAmount}
          onUnitChange={updateRowUnit}
          onRemoveRow={removeRow}
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? savingLabel : submitLabel}
        </button>
      </form>

      <BackButton />

      {onDelete && (
        <ConfirmDeleteModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={onDelete}
          title="Delete Meal?"
          message={`This will permanently delete "${name || date || 'this meal'}". This can't be undone.`}
        />
      )}
    </section>
  )
}

export default MealForm
