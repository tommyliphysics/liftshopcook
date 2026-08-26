import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import FoodForm from '../components/FoodForm.tsx'
import { usePublicFoods } from '../hooks/usePublicFoods.ts'
import type { AddFoodNavRequest, AddFoodNavResult } from '../lib/addFoodNav.ts'
import {
  buildFoodDocument,
  dominantCurrency,
  EMPTY_FOOD_FORM_VALUES,
  type FoodFormValues,
} from '../lib/food.ts'
import { currencyFromIP } from '../lib/geoCurrency.ts'
import type { FoodDocument } from '../types/food.ts'

function AddFoodPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const request = location.state as AddFoodNavRequest | null

  const [initialValues] = useState<FoodFormValues>({
    ...EMPTY_FOOD_FORM_VALUES,
    name: request?.prefillName ?? '',
  })
  const [defaultCurrency, setDefaultCurrency] = useState<string | undefined>(
    undefined,
  )
  const { foods: publicFoods } = usePublicFoods()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    getDocs(collection(db, 'users', user.uid, 'foods')).then(async (snapshot) => {
      const foods = snapshot.docs.map(
        (docSnapshot) => docSnapshot.data() as FoodDocument,
      )
      const currency =
        dominantCurrency(foods) ??
        (await currencyFromIP()) ??
        EMPTY_FOOD_FORM_VALUES.currency
      setDefaultCurrency(currency)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave(values: FoodFormValues) {
    const user = auth.currentUser
    if (!user) return

    const document = buildFoodDocument(values)
    const docRef = await addDoc(
      collection(db, 'users', user.uid, 'foods'),
      document,
    )

    if (request) {
      const newFood = { id: docRef.id, ...document }
      const result: AddFoodNavResult =
        request.formKind === 'meal'
          ? {
              formKind: 'meal',
              mealValues: request.mealValues,
              forRowId: request.forRowId,
              newFood,
            }
          : {
              formKind: 'recipe',
              recipeValues: request.recipeValues,
              newFood,
            }
      navigate(request.returnTo, { state: result })
    }
  }

  return (
    <FoodForm
      title="Add Food"
      submitLabel="Add Food"
      savingLabel="Adding..."
      initialValues={initialValues}
      onSubmit={handleSave}
      resetOnSuccess={!request}
      publicFoods={publicFoods}
      defaultCurrency={defaultCurrency}
    />
  )
}

export default AddFoodPage
