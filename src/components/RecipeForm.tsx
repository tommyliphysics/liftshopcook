import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BackButton from './BackButton.tsx'
import ConfirmDeleteModal from './ConfirmDeleteModal.tsx'
import Icon from './Icon.tsx'
import RecipeFoodRowsField from './RecipeFoodRowsField.tsx'
import { useFoodRows } from '../hooks/useFoodRows.ts'
import type { AddFoodNavResult } from '../lib/addFoodNav.ts'
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
  onDelete?: () => Promise<void>
  resetOnSuccess?: boolean
}

function RecipeForm({
  title,
  submitLabel,
  savingLabel,
  initialValues,
  onSubmit,
  onDelete,
  resetOnSuccess = true,
}: RecipeFormProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const restoreResult = location.state as AddFoodNavResult | null
  const restoredRecipe =
    restoreResult?.formKind === 'recipe' ? restoreResult : null

  const start =
    restoredRecipe?.recipeValues ?? initialValues ?? EMPTY_RECIPE_FORM_VALUES
  const [deleteOpen, setDeleteOpen] = useState(false)

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

  const appliedNewFood = useRef(false)
  useEffect(() => {
    if (appliedNewFood.current || !restoredRecipe) return
    appliedNewFood.current = true

    const { newFood } = restoredRecipe
    setRows((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        foodId: newFood.id,
        foodSnapshot: newFood,
        recipeId: '',
        recipeSnapshot: null,
        amount: newFood.quantity.amount,
        unit: newFood.quantity.unit,
      },
    ])
    navigate(location.pathname + location.search, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleCreateNewFood(query: string) {
    navigate('/add-food', {
      state: {
        formKind: 'recipe',
        recipeValues: { name, servings, rows, recipeText },
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
      <Link to="/recipes" className="top-link">
        <Icon name="book" size={13} />
        My Recipes
      </Link>
      <div className="title-row">
        <h1>{title}</h1>
        {onDelete && (
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete recipe"
          >
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>
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
          onCreateNewFood={handleCreateNewFood}
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

      {onDelete && (
        <ConfirmDeleteModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={onDelete}
          title="Delete Recipe?"
          message={`This will permanently delete "${name || 'this recipe'}". This can't be undone.`}
        />
      )}
    </section>
  )
}

export default RecipeForm
