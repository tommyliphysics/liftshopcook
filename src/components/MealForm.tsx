import { useState } from 'react'
import BackButton from './BackButton.tsx'
import FoodRowsField from './FoodRowsField.tsx'
import { useFoodRows } from '../hooks/useFoodRows.ts'
import { EMPTY_MEAL_FORM_VALUES, type MealFormValues } from '../lib/meal.ts'
import type { MealTime } from '../types/food.ts'
import '../pages/pages.css'

type MealFormProps = {
  title: string
  submitLabel: string
  savingLabel: string
  initialValues?: MealFormValues
  onSubmit: (values: MealFormValues) => Promise<void>
  resetOnSuccess?: boolean
}

function MealForm({
  title,
  submitLabel,
  savingLabel,
  initialValues,
  onSubmit,
  resetOnSuccess = true,
}: MealFormProps) {
  const start = initialValues ?? EMPTY_MEAL_FORM_VALUES

  const [date, setDate] = useState(start.date)
  const [mealTime, setMealTime] = useState<MealTime>(start.time)
  const [name, setName] = useState(start.name)
  const {
    foods,
    rows,
    setRows,
    addRow,
    updateRowFood,
    updateRowAmount,
    updateRowUnit,
    removeRow,
  } = useFoodRows(start.rows)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSubmit({ date, time: mealTime, name, rows })

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
      <h1>{title}</h1>
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
          onAddRow={addRow}
          onFoodChange={updateRowFood}
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
    </section>
  )
}

export default MealForm
