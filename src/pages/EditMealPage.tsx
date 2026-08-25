import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import MealForm from '../components/MealForm.tsx'
import {
  buildMealDocument,
  mealDocumentToFormValues,
  type MealFormValues,
} from '../lib/meal.ts'
import type { MealDocument } from '../types/food.ts'
import './pages.css'

function EditMealPage() {
  const { mealId } = useParams<{ mealId: string }>()
  const navigate = useNavigate()
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

  async function handleSave(formValues: MealFormValues) {
    const user = auth.currentUser
    if (!user || !mealId) return

    await updateDoc(
      doc(db, 'users', user.uid, 'meals', mealId),
      buildMealDocument(formValues),
    )
    navigate('/calendar')
  }

  if (notFound) {
    return (
      <section className="page page-center">
        <h1>Meal not found</h1>
      </section>
    )
  }

  if (!values) return null

  return (
    <MealForm
      title="Edit Meal"
      submitLabel="Save Changes"
      savingLabel="Saving..."
      initialValues={values}
      onSubmit={handleSave}
      resetOnSuccess={false}
    />
  )
}

export default EditMealPage
