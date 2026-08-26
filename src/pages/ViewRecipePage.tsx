import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import BackButton from '../components/BackButton.tsx'
import Icon from '../components/Icon.tsx'
import { getCurrencySymbol } from '../data/currencies.ts'
import { foodsMapToRows } from '../lib/foodRow.ts'
import { computeRecipeNutritionPerServe } from '../lib/recipe.ts'
import type { FoodDocument, RecipeDocument } from '../types/food.ts'
import './pages.css'

function ViewRecipePage() {
  const { recipeId } = useParams<{ recipeId: string }>()
  const [recipe, setRecipe] = useState<RecipeDocument | null>(null)
  const [currentFoods, setCurrentFoods] = useState<
    Record<string, FoodDocument>
  >({})
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const user = auth.currentUser
    if (!user || !recipeId) return

    getDoc(doc(db, 'users', user.uid, 'recipes', recipeId)).then((snapshot) => {
      if (!snapshot.exists()) {
        setNotFound(true)
        return
      }
      setRecipe(snapshot.data() as RecipeDocument)
    })
  }, [recipeId])

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    getDocs(collection(db, 'users', user.uid, 'foods')).then((snapshot) => {
      setCurrentFoods(
        Object.fromEntries(
          snapshot.docs.map((docSnapshot) => [
            docSnapshot.id,
            docSnapshot.data() as FoodDocument,
          ]),
        ),
      )
    })
  }, [])

  if (notFound) {
    return (
      <section className="page page-center">
        <h1>Recipe not found</h1>
        <BackButton />
      </section>
    )
  }

  if (!recipe) return null

  const rows = foodsMapToRows(recipe.foods)
  const nutrition = computeRecipeNutritionPerServe(recipe, currentFoods)

  return (
    <section className="page page-center">
      <Link to="/recipes" className="top-link">
        <Icon name="book" size={13} />
        My Recipes
      </Link>
      <Link to={`/recipes/${recipeId}/edit`} className="top-link">
        <Icon name="pencil" size={13} />
        Edit recipe
      </Link>

      <h1>{recipe.name}</h1>
      <p className="recipe-servings">Serves {recipe.servings}</p>

      {rows.length > 0 && (
        <p className="recipe-nutrition-summary">
          {Math.round(nutrition.energyAmount)} {nutrition.energyUnit} &middot;{' '}
          {nutrition.carbs.toFixed(1)}g carbs &middot;{' '}
          {nutrition.fat.toFixed(1)}g fat &middot;{' '}
          {nutrition.protein.toFixed(1)}g protein
          {nutrition.costPerServe !== null && (
            <>
              {' '}
              &middot; {getCurrencySymbol(nutrition.costCurrency ?? '')}
              {nutrition.costPerServe.toFixed(2)}
            </>
          )}
          /serve
        </p>
      )}

      <div className="auth-form">
        <h2 className="form-section-heading">Ingredients</h2>
        {rows.length === 0 ? (
          <p>No ingredients added.</p>
        ) : (
          <ul className="ingredient-list">
            {rows.map((row) => (
              <li key={row.id}>
                <span>{row.foodSnapshot?.name}</span>
                <span>
                  {row.amount} {row.unit}
                </span>
              </li>
            ))}
          </ul>
        )}

        <h2 className="form-section-heading">Method</h2>
        <p className="recipe-text">
          {recipe.recipeText || 'No recipe text added.'}
        </p>
      </div>

      <BackButton />
    </section>
  )
}

export default ViewRecipePage
