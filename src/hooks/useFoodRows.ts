import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import type { FoodRow } from '../lib/foodRow.ts'
import type { FoodDocument, QuantityUnit } from '../types/food.ts'

export type FoodListItem = FoodDocument & { id: string }

export function useFoodRows(initialRows: FoodRow[] = []) {
  const [foods, setFoods] = useState<FoodListItem[]>([])
  const [rows, setRows] = useState<FoodRow[]>(initialRows)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    return onSnapshot(collection(db, 'users', user.uid, 'foods'), (snapshot) => {
      setFoods(
        snapshot.docs.map(
          (docSnapshot) =>
            ({ id: docSnapshot.id, ...docSnapshot.data() }) as FoodListItem,
        ),
      )
    })
  }, [])

  function addRow() {
    setRows((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        foodId: '',
        foodSnapshot: null,
        amount: '',
        unit: 'g',
      },
    ])
  }

  function addRowWithFood(food: FoodListItem) {
    setRows((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        foodId: food.id,
        foodSnapshot: food,
        amount: '',
        unit: 'g',
      },
    ])
  }

  function updateRowFood(id: string, foodId: string) {
    const food = foods.find((f) => f.id === foodId) ?? null
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, foodId, foodSnapshot: food } : row,
      ),
    )
  }

  function updateRowAmount(id: string, amount: string) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, amount } : row)),
    )
  }

  function updateRowUnit(id: string, unit: QuantityUnit) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, unit } : row)),
    )
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  return {
    foods,
    rows,
    setRows,
    addRow,
    addRowWithFood,
    updateRowFood,
    updateRowAmount,
    updateRowUnit,
    removeRow,
  }
}
