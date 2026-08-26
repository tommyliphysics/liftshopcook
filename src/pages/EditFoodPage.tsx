import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import FoodForm from '../components/FoodForm.tsx'
import {
  buildFoodDocument,
  foodDocumentToFormValues,
  type FoodFormValues,
} from '../lib/food.ts'
import type { FoodDocument } from '../types/food.ts'
import './pages.css'

function EditFoodPage() {
  const { foodId } = useParams<{ foodId: string }>()
  const navigate = useNavigate()
  const [values, setValues] = useState<FoodFormValues | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const user = auth.currentUser
    if (!user || !foodId) return

    getDoc(doc(db, 'users', user.uid, 'foods', foodId)).then((snapshot) => {
      if (!snapshot.exists()) {
        setNotFound(true)
        return
      }
      setValues(foodDocumentToFormValues(snapshot.data() as FoodDocument))
    })
  }, [foodId])

  async function handleSave(formValues: FoodFormValues) {
    const user = auth.currentUser
    if (!user || !foodId) return

    await updateDoc(
      doc(db, 'users', user.uid, 'foods', foodId),
      buildFoodDocument(formValues),
    )
    navigate('/foods')
  }

  async function handleDelete() {
    const user = auth.currentUser
    if (!user || !foodId) return

    await deleteDoc(doc(db, 'users', user.uid, 'foods', foodId))
    navigate('/foods')
  }

  if (notFound) {
    return (
      <section className="page page-center">
        <h1>Food not found</h1>
      </section>
    )
  }

  if (!values) return null

  return (
    <FoodForm
      title="Edit Food"
      submitLabel="Save Changes"
      savingLabel="Saving..."
      initialValues={values}
      onSubmit={handleSave}
      onDelete={handleDelete}
      resetOnSuccess={false}
    />
  )
}

export default EditFoodPage
