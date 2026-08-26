import { useEffect, useState } from 'react'
import Icon from './Icon.tsx'
import type { FoodListItem, RecipeListItem } from '../hooks/useFoodRows.ts'

type FoodAutocompleteProps = {
  foods: FoodListItem[]
  recipes: RecipeListItem[]
  selectedName: string
  onSelectFood: (foodId: string) => void
  onSelectRecipe: (recipeId: string) => void
  onCreateNew: (query: string) => void
}

function FoodAutocomplete({
  foods,
  recipes,
  selectedName,
  onSelectFood,
  onSelectRecipe,
  onCreateNew,
}: FoodAutocompleteProps) {
  const [query, setQuery] = useState(selectedName)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setQuery(selectedName)
  }, [selectedName])

  const trimmed = query.trim().toLowerCase()
  const foodResults = trimmed
    ? foods.filter((food) => food.name.toLowerCase().includes(trimmed))
    : []
  const recipeResults = trimmed
    ? recipes.filter((recipe) => recipe.name.toLowerCase().includes(trimmed))
    : []

  function handleSelectFood(food: FoodListItem) {
    onSelectFood(food.id)
    setQuery(food.name)
    setOpen(false)
  }

  function handleSelectRecipe(recipe: RecipeListItem) {
    onSelectRecipe(recipe.id)
    setQuery(recipe.name)
    setOpen(false)
  }

  function handleBlur() {
    setOpen(false)
    setQuery(selectedName)
  }

  return (
    <div className="food-autocomplete">
      <input
        type="text"
        aria-label="Food or recipe"
        placeholder="Search foods or recipes..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        autoComplete="off"
      />

      {open && trimmed && (
        <div className="food-autocomplete-menu">
          {foodResults.length > 0 || recipeResults.length > 0 ? (
            <ul className="food-search-results">
              {foodResults.map((food) => (
                <li key={`food-${food.id}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectFood(food)}
                  >
                    {food.name}
                  </button>
                </li>
              ))}
              {recipeResults.map((recipe) => (
                <li key={`recipe-${recipe.id}`}>
                  <button
                    type="button"
                    className="food-search-result-recipe"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectRecipe(recipe)}
                  >
                    <Icon name="book" size={14} />
                    {recipe.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="food-search-results">
              <li>
                <button
                  type="button"
                  className="food-search-result-new"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCreateNew(query.trim())}
                >
                  <Icon name="plus" size={14} />
                  New Food
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default FoodAutocomplete
