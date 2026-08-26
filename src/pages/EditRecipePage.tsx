import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import RecipeForm from '../components/RecipeForm.tsx'
import type { AddFoodNavResult } from '../lib/addFoodNav.ts'
import {
  buildRecipeDocument,
  recipeDocumentToFormValues,
  type RecipeFormValues,
} from '../lib/recipe.ts'
import type { RecipeDocument } from '../types/food.ts'
import './pages.css'

function EditRecipePage() {
  const { recipeId } = useParams<{ recipeId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const isRestoringRecipe =
    (location.state as AddFoodNavResult | null)?.formKind === 'recipe'
  const [values, setValues] = useState<RecipeFormValues | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const user = auth.currentUser
    if (!user || !recipeId) return

    getDoc(doc(db, 'users', user.uid, 'recipes', recipeId)).then((snapshot) => {
      if (!snapshot.exists()) {
        setNotFound(true)
        return
      }
      setValues(recipeDocumentToFormValues(snapshot.data() as RecipeDocument))
    })
  }, [recipeId])

  async function handleSave(formValues: RecipeFormValues) {
    const user = auth.currentUser
    if (!user || !recipeId) return

    await updateDoc(
      doc(db, 'users', user.uid, 'recipes', recipeId),
      buildRecipeDocument(formValues),
    )
    navigate(`/recipes/${recipeId}`)
  }

  async function handleDelete() {
    const user = auth.currentUser
    if (!user || !recipeId) return

    await deleteDoc(doc(db, 'users', user.uid, 'recipes', recipeId))
    navigate('/recipes')
  }

  if (notFound) {
    return (
      <section className="page page-center">
        <h1>Recipe not found</h1>
      </section>
    )
  }

  if (!values && !isRestoringRecipe) return null

  return (
    <RecipeForm
      title="Edit Recipe"
      submitLabel="Save Changes"
      savingLabel="Saving..."
      initialValues={values ?? undefined}
      onSubmit={handleSave}
      onDelete={handleDelete}
      resetOnSuccess={false}
    />
  )
}

export default EditRecipePage
