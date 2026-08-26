import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import MealForm from '../components/MealForm.tsx'
import type { AddFoodNavResult } from '../lib/addFoodNav.ts'
import {
  buildMealDocument,
  mealDocumentToFormValues,
  type MealFormValues,
} from '../lib/meal.ts'
import type { FoodDocument, MealDocument } from '../types/food.ts'
import './pages.css'

function EditMealPage() {
  const { mealId } = useParams<{ mealId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const isRestoringMeal =
    (location.state as AddFoodNavResult | null)?.formKind === 'meal'
  const [values, setValues] = useState<MealFormValues | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const user = auth.currentUser
    if (!user || !mealId) return

    getDoc(doc(db, 'users', user.uid, 'meals', mealId)).then((snapshot) => {
      if (!snapshot.exists()) {
        setNotFound(true)
        return
      }
      setValues(mealDocumentToFormValues(snapshot.data() as MealDocument))
    })
  }, [mealId])

  async function handleSave(
    formValues: MealFormValues,
    currentFoods: Record<string, FoodDocument>,
  ) {
    const user = auth.currentUser
    if (!user || !mealId) return

    await updateDoc(
      doc(db, 'users', user.uid, 'meals', mealId),
      buildMealDocument(formValues, currentFoods),
    )
    navigate('/calendar')
  }

  async function handleDelete() {
    const user = auth.currentUser
    if (!user || !mealId) return

    await deleteDoc(doc(db, 'users', user.uid, 'meals', mealId))
    navigate('/calendar')
  }

  if (notFound) {
    return (
      <section className="page page-center">
        <h1>Meal not found</h1>
      </section>
    )
  }

  if (!values && !isRestoringMeal) return null

  return (
    <MealForm
      title="Edit Meal"
      submitLabel="Save Changes"
      savingLabel="Saving..."
      initialValues={values ?? undefined}
      onSubmit={handleSave}
      onDelete={handleDelete}
      resetOnSuccess={false}
    />
  )
}

export default EditMealPage
