import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import BackButton from '../components/BackButton.tsx'
import Icon from '../components/Icon.tsx'
import { foodsMapToRows } from '../lib/foodRow.ts'
import type { RecipeDocument } from '../types/food.ts'
import './pages.css'

function ViewRecipePage() {
  const { recipeId } = useParams<{ recipeId: string }>()
  const [recipe, setRecipe] = useState<RecipeDocument | null>(null)
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

  return (
    <section className="page page-center">
      <Link to={`/recipes/${recipeId}/edit`} className="top-link">
        <Icon name="pencil" size={13} />
        Edit recipe
      </Link>

      <h1>{recipe.name}</h1>
      <p className="recipe-servings">Serves {recipe.servings}</p>

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
