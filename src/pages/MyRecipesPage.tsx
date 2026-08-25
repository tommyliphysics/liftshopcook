import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import BackButton from '../components/BackButton.tsx'
import Icon from '../components/Icon.tsx'
import { toCalories } from '../lib/units.ts'
import type { RecipeDocument } from '../types/food.ts'
import './pages.css'

type RecipeListItem = RecipeDocument & { id: string }

function caloriesPerServe(recipe: RecipeDocument): string {
  const servings = Number(recipe.servings)
  if (!servings) return '—'

  const total = Object.values(recipe.foods ?? {}).reduce(
    (sum, food) => sum + toCalories(food.energy.amount, food.energy.unit),
    0,
  )

  return String(Math.round(total / servings))
}

function MyRecipesPage() {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([])

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    return onSnapshot(
      collection(db, 'users', user.uid, 'recipes'),
      (snapshot) => {
        setRecipes(
          snapshot.docs.map(
            (docSnapshot) =>
              ({ id: docSnapshot.id, ...docSnapshot.data() }) as RecipeListItem,
          ),
        )
      },
    )
  }, [])

  return (
    <section className="page page-center">
      <h1>My Recipes</h1>

      <Link to="/add-recipe" className="btn btn-primary page-add-btn">
        <Icon name="plus" size={16} />
        Add Recipe
      </Link>

      {recipes.length === 0 ? (
        <p>No recipes added yet.</p>
      ) : (
        <div className="foods-table-wrap">
          <table className="foods-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Calories / Serve</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.id}>
                  <td>
                    <Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link>
                  </td>
                  <td className="cell-mono">{caloriesPerServe(recipe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BackButton />
    </section>
  )
}

export default MyRecipesPage
