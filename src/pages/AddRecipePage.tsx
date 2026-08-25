import { addDoc, collection } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import RecipeForm from '../components/RecipeForm.tsx'
import { buildRecipeDocument, type RecipeFormValues } from '../lib/recipe.ts'

function AddRecipePage() {
  async function handleSave(values: RecipeFormValues) {
    const user = auth.currentUser
    if (!user) return

    await addDoc(
      collection(db, 'users', user.uid, 'recipes'),
      buildRecipeDocument(values),
    )
  }

  return (
    <RecipeForm
      title="Add Recipe"
      submitLabel="Save Recipe"
      savingLabel="Saving..."
      onSubmit={handleSave}
    />
  )
}

export default AddRecipePage
