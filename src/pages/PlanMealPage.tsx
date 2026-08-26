import { useNavigate, useSearchParams } from 'react-router-dom'
import { addDoc, collection } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import MealForm from '../components/MealForm.tsx'
import {
  buildMealDocument,
  EMPTY_MEAL_FORM_VALUES,
  type MealFormValues,
} from '../lib/meal.ts'
import type { FoodDocument } from '../types/food.ts'

function PlanMealPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dateParam = searchParams.get('date')

  async function handleSave(
    values: MealFormValues,
    currentFoods: Record<string, FoodDocument>,
  ) {
    const user = auth.currentUser
    if (!user) return

    await addDoc(
      collection(db, 'users', user.uid, 'meals'),
      buildMealDocument(values, currentFoods),
    )
    navigate('/calendar')
  }

  return (
    <MealForm
      title="Add Meal"
      submitLabel="Save Meal"
      savingLabel="Saving..."
      initialValues={
        dateParam ? { ...EMPTY_MEAL_FORM_VALUES, date: dateParam } : undefined
      }
      onSubmit={handleSave}
    />
  )
}

export default PlanMealPage
