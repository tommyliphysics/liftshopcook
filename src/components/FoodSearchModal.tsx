import { useState } from 'react'
import Modal from './Modal.tsx'
import type { FoodListItem } from '../hooks/useFoodRows.ts'

type FoodSearchModalProps = {
  open: boolean
  onClose: () => void
  foods: FoodListItem[]
  onSelect: (food: FoodListItem) => void
}

function FoodSearchModal({
  open,
  onClose,
  foods,
  onSelect,
}: FoodSearchModalProps) {
  const [query, setQuery] = useState('')

  function handleClose() {
    setQuery('')
    onClose()
  }

  function handleSelect(food: FoodListItem) {
    onSelect(food)
    setQuery('')
    onClose()
  }

  const trimmed = query.trim().toLowerCase()
  const results = trimmed
    ? foods.filter((food) => food.name.toLowerCase().includes(trimmed))
    : []

  return (
    <Modal
      open={open}
      onClose={handleClose}
      titleId="food-search-title"
      title="Add Food"
    >
      <label htmlFor="food-search">Food name</label>
      <input
        id="food-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Start typing..."
        autoComplete="off"
        autoFocus
      />

      {trimmed &&
        (results.length > 0 ? (
          <ul className="food-search-results">
            {results.map((food) => (
              <li key={food.id}>
                <button type="button" onClick={() => handleSelect(food)}>
                  {food.name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="food-search-empty">No matching foods.</p>
        ))}

      <button
        type="button"
        className="btn btn-secondary btn-full"
        onClick={handleClose}
      >
        Cancel
      </button>
    </Modal>
  )
}

export default FoodSearchModal
