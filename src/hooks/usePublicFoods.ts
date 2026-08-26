import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase.ts'
import type { PublicFoodDocument } from '../types/food.ts'

export type PublicFoodListItem = PublicFoodDocument & { id: string }

function normalizeAmount(amount: unknown): string {
  return typeof amount === 'number' ? String(amount) : (amount as string)
}

function normalizePublicFood(id: string, data: PublicFoodDocument): PublicFoodListItem {
  return {
    id,
    name: data.name,
    source: data.source,
    energy: { amount: normalizeAmount(data.energy.amount), unit: data.energy.unit },
    macronutrients: {
      carbs: { amount: normalizeAmount(data.macronutrients.carbs.amount), unit: 'g' },
      fat: { amount: normalizeAmount(data.macronutrients.fat.amount), unit: 'g' },
      protein: { amount: normalizeAmount(data.macronutrients.protein.amount), unit: 'g' },
    },
    micronutrients: Object.fromEntries(
      Object.entries(data.micronutrients ?? {}).map(([name, m]) => [
        name,
        { amount: normalizeAmount(m.amount), unit: m.unit },
      ]),
    ),
  }
}

// Module-level cache: the public collection rarely changes, so fetch it once
// per page load and reuse it across every AddFoodPage visit rather than
// re-fetching ~5000 docs on every mount. `fetchPromise` also de-dupes
// concurrent mounts into a single in-flight request.
let cachedFoods: PublicFoodListItem[] | null = null
let fetchPromise: Promise<PublicFoodListItem[]> | null = null

function fetchPublicFoods(): Promise<PublicFoodListItem[]> {
  if (cachedFoods) return Promise.resolve(cachedFoods)

  if (!fetchPromise) {
    const start = performance.now()
    fetchPromise = getDocs(collection(db, 'public', 'publicNutritionData', 'foods'))
      .then((snapshot) => {
        const elapsed = performance.now() - start
        console.log(
          `[usePublicFoods] fetched ${snapshot.size} docs in ${elapsed.toFixed(0)}ms`,
        )
        cachedFoods = snapshot.docs.map((docSnapshot) =>
          normalizePublicFood(
            docSnapshot.id,
            docSnapshot.data() as PublicFoodDocument,
          ),
        )
        return cachedFoods
      })
      .catch((error) => {
        fetchPromise = null
        console.error('[usePublicFoods] failed to fetch public foods', error)
        throw error
      })
  }

  return fetchPromise
}

/** Loads the full public nutrition reference collection once per page load, cached across mounts. */
export function usePublicFoods() {
  const [foods, setFoods] = useState<PublicFoodListItem[]>(cachedFoods ?? [])
  const [loaded, setLoaded] = useState(cachedFoods !== null)

  useEffect(() => {
    if (cachedFoods) return
    fetchPublicFoods()
      .then((result) => {
        setFoods(result)
        setLoaded(true)
      })
      .catch(() => {})
  }, [])

  return { foods, loaded }
}
