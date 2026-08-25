import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase.ts'
import BackButton from '../components/BackButton.tsx'
import Icon from '../components/Icon.tsx'
import type { FoodDocument } from '../types/food.ts'
import './pages.css'

type FoodListItem = FoodDocument & { id: string }

function MyFoodsPage() {
  const [foods, setFoods] = useState<FoodListItem[]>([])

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

  return (
    <section className="page page-center">
      <h1>My Foods</h1>

      <Link to="/add-food" className="btn btn-primary page-add-btn">
        <Icon name="plus" size={16} />
        Add Food
      </Link>

      {foods.length === 0 ? (
        <p>No foods added yet.</p>
      ) : (
        <div className="foods-table-wrap">
          <table className="foods-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Brand</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food.id}>
                  <td>
                    <Link to={`/foods/${food.id}/edit`}>{food.name}</Link>
                  </td>
                  <td>{food.price?.brand}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BackButton />
    </section>
  )
}

export default MyFoodsPage
