import { useState } from 'react'
import BackButton from './BackButton.tsx'
import RecipeFoodRowsField from './RecipeFoodRowsField.tsx'
import { useFoodRows } from '../hooks/useFoodRows.ts'
import {
  EMPTY_RECIPE_FORM_VALUES,
  type RecipeFormValues,
} from '../lib/recipe.ts'
import '../pages/pages.css'

type RecipeFormProps = {
  title: string
  submitLabel: string
  savingLabel: string
  initialValues?: RecipeFormValues
  onSubmit: (values: RecipeFormValues) => Promise<void>
  resetOnSuccess?: boolean
}

function RecipeForm({
  title,
  submitLabel,
  savingLabel,
  initialValues,
  onSubmit,
  resetOnSuccess = true,
}: RecipeFormProps) {
  const start = initialValues ?? EMPTY_RECIPE_FORM_VALUES

  const [name, setName] = useState(start.name)
  const [servings, setServings] = useState(start.servings)
  const [recipeText, setRecipeText] = useState(start.recipeText)
  const {
    foods,
    rows,
    setRows,
    addRowWithFood,
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
      await onSubmit({ name, servings, rows, recipeText })

      if (resetOnSuccess) {
        setName('')
        setServings('')
        setRows([])
        setRecipeText('')
      }
    } catch {
      setError('Could not save this recipe. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page page-center">
      <h1>{title}</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="servings">Servings</label>
        <input
          id="servings"
          type="number"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          required
        />

        <h2 className="form-section-heading">Ingredients</h2>

        <RecipeFoodRowsField
          rows={rows}
          foods={foods}
          onAddFood={addRowWithFood}
          onAmountChange={updateRowAmount}
          onUnitChange={updateRowUnit}
          onRemoveRow={removeRow}
        />

        <h2 className="form-section-heading">Method</h2>

        <textarea
          id="recipe-text"
          aria-label="Method"
          rows={8}
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
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

export default RecipeForm
