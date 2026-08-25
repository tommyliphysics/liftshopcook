import { addDoc, collection } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import FoodForm from '../components/FoodForm.tsx'
import { buildFoodDocument, type FoodFormValues } from '../lib/food.ts'

function AddFoodPage() {
  async function handleSave(values: FoodFormValues) {
    const user = auth.currentUser
    if (!user) return

    await addDoc(
      collection(db, 'users', user.uid, 'foods'),
      buildFoodDocument(values),
    )
  }

  return (
    <FoodForm
      title="Add Food"
      submitLabel="Add Food"
      savingLabel="Adding..."
      onSubmit={handleSave}
    />
  )
}

export default AddFoodPage
