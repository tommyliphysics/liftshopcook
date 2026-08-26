import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BackButton from './BackButton.tsx'
import ConfirmDeleteModal from './ConfirmDeleteModal.tsx'
import Icon from './Icon.tsx'
import NutritionModal from './NutritionModal.tsx'
import PurchaseModal from './PurchaseModal.tsx'
import StatButton from './StatButton.tsx'
import { getCurrencySymbol } from '../data/currencies.ts'
import type { PublicFoodListItem } from '../hooks/usePublicFoods.ts'
import { EMPTY_FOOD_FORM_VALUES, type FoodFormValues } from '../lib/food.ts'
import { CAL_PER_UNIT, quantityConversionFactor } from '../lib/units.ts'
import type {
  EnergyUnit,
  Micronutrient,
  MicronutrientUnit,
  PublicFoodDocument,
  QuantityUnit,
} from '../types/food.ts'
import '../pages/pages.css'

function scaleValue(value: string, factor: number): string {
  const num = Number(value)
  if (value.trim() === '' || Number.isNaN(num)) return value
  return String(Math.round(num * factor * 1000) / 1000)
}

type FoodFormProps = {
  title: string
  submitLabel: string
  savingLabel: string
  initialValues?: FoodFormValues
  onSubmit: (values: FoodFormValues) => Promise<void>
  onDelete?: () => Promise<void>
  resetOnSuccess?: boolean
  publicFoods?: PublicFoodListItem[]
  /** Resolved in the background (e.g. dominant/IP-geolocated currency); applied only if the user hasn't already changed the currency away from its initial value. */
  defaultCurrency?: string
}

function FoodForm({
  title,
  submitLabel,
  savingLabel,
  initialValues,
  onSubmit,
  onDelete,
  resetOnSuccess = true,
  publicFoods = [],
  defaultCurrency,
}: FoodFormProps) {
  const start = initialValues ?? EMPTY_FOOD_FORM_VALUES
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [name, setName] = useState(start.name)
  const [nameSearchOpen, setNameSearchOpen] = useState(false)
  const [quantity, setQuantity] = useState(start.quantity)
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>(
    start.quantityUnit,
  )

  const [nutritionOpen, setNutritionOpen] = useState(false)
  const [energy, setEnergy] = useState(start.energy)
  const [energyUnit, setEnergyUnit] = useState<EnergyUnit>(start.energyUnit)
  const [carbohydrates, setCarbohydrates] = useState(start.carbohydrates)
  const [fat, setFat] = useState(start.fat)
  const [protein, setProtein] = useState(start.protein)
  const [micronutrients, setMicronutrients] = useState<Micronutrient[]>(
    start.micronutrients,
  )

  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [brand, setBrand] = useState(start.brand)
  const [retailer, setRetailer] = useState(start.retailer)
  const [price, setPrice] = useState(start.price)
  const [currency, setCurrency] = useState(start.currency)

  useEffect(() => {
    if (defaultCurrency && currency === start.currency) {
      setCurrency(defaultCurrency)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCurrency])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function addMicronutrient() {
    setMicronutrients((rows) => [
      ...rows,
      { id: crypto.randomUUID(), name: '', amount: '', unit: 'mg' },
    ])
  }

  function updateMicronutrient(
    id: string,
    field: 'name' | 'amount',
    value: string,
  ) {
    setMicronutrients((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  function updateMicronutrientUnit(id: string, unit: MicronutrientUnit) {
    setMicronutrients((rows) =>
      rows.map((row) => (row.id === id ? { ...row, unit } : row)),
    )
  }

  function removeMicronutrient(id: string) {
    setMicronutrients((rows) => rows.filter((row) => row.id !== id))
  }

  const trimmedName = name.trim().toLowerCase()
  const publicFoodResults = trimmedName
    ? publicFoods.filter((food) => food.name.toLowerCase().includes(trimmedName))
    : []

  function handleLoadPublicFood(food: PublicFoodDocument) {
    setName(food.name)
    setQuantity('100')
    setQuantityUnit('g')
    setEnergy(food.energy.amount)
    setEnergyUnit(food.energy.unit)
    setCarbohydrates(food.macronutrients.carbs.amount)
    setFat(food.macronutrients.fat.amount)
    setProtein(food.macronutrients.protein.amount)
    setMicronutrients(
      Object.entries(food.micronutrients ?? {}).map(([mName, m]) => ({
        id: crypto.randomUUID(),
        name: mName,
        amount: m.amount,
        unit: m.unit,
      })),
    )
    setNameSearchOpen(false)
  }

  function handleQuantityUnitChange(newUnit: QuantityUnit) {
    const factor = quantityConversionFactor(quantityUnit, newUnit)
    setQuantity((v) => scaleValue(v, factor))
    setQuantityUnit(newUnit)
  }

  function handleEnergyUnitChange(newUnit: EnergyUnit) {
    const factor = CAL_PER_UNIT[energyUnit] / CAL_PER_UNIT[newUnit]
    setEnergy((v) => scaleValue(v, factor))
    setEnergyUnit(newUnit)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSubmit({
        name,
        quantity,
        quantityUnit,
        energy,
        energyUnit,
        carbohydrates,
        fat,
        protein,
        micronutrients,
        brand,
        retailer,
        price,
        currency,
      })

      if (resetOnSuccess) {
        setName('')
        setQuantity('')
        setQuantityUnit('g')
        setEnergy('')
        setEnergyUnit('cal')
        setCarbohydrates('')
        setFat('')
        setProtein('')
        setMicronutrients([])
        setBrand('')
        setRetailer('')
        setPrice('')
        setCurrency(defaultCurrency ?? start.currency)
      }
    } catch {
      setError('Could not save this food. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page page-center">
      <Link to="/foods" className="top-link">
        <Icon name="leaf" size={13} />
        My Foods
      </Link>
      <div className="title-row">
        <h1>{title}</h1>
        {onDelete && (
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete food"
          >
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <div className="food-autocomplete">
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setNameSearchOpen(true)
            }}
            onFocus={() => setNameSearchOpen(true)}
            onBlur={() => setNameSearchOpen(false)}
            autoComplete="off"
            required
          />

          {nameSearchOpen && publicFoodResults.length > 0 && (
            <div className="food-autocomplete-menu">
              <ul className="food-search-results">
                {publicFoodResults.map((food) => (
                  <li key={food.id}>
                    <button
                      type="button"
                      className="food-search-result-public"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleLoadPublicFood(food)}
                    >
                      <span>{food.name}</span>
                      <span className="food-search-result-source">
                        Load data from {food.source}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <label htmlFor="quantity">Quantity</label>
        <div className="unit-row">
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <select
            aria-label="Quantity unit"
            value={quantityUnit}
            onChange={(e) =>
              handleQuantityUnitChange(e.target.value as QuantityUnit)
            }
          >
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="lb">lb</option>
            <option value="oz">oz</option>
            <option value="mL">mL</option>
            <option value="qt">qt</option>
            <option value="fl oz">fl oz</option>
            <option value="">ea</option>
          </select>
        </div>

        <StatButton
          label="Nutrition"
          icon="leaf"
          value={energy.trim() ? `${energy} ${energyUnit}` : undefined}
          onClick={() => setNutritionOpen(true)}
        />

        <StatButton
          label="Price"
          icon="tag"
          value={
            price.trim()
              ? `${getCurrencySymbol(currency)}${Number(price).toFixed(2)}`
              : undefined
          }
          onClick={() => setPurchaseOpen(true)}
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? savingLabel : submitLabel}
        </button>
      </form>

      <NutritionModal
        open={nutritionOpen}
        onClose={() => setNutritionOpen(false)}
        energy={energy}
        onEnergyChange={setEnergy}
        energyUnit={energyUnit}
        onEnergyUnitChange={handleEnergyUnitChange}
        carbohydrates={carbohydrates}
        onCarbohydratesChange={setCarbohydrates}
        fat={fat}
        onFatChange={setFat}
        protein={protein}
        onProteinChange={setProtein}
        micronutrients={micronutrients}
        onAddMicronutrient={addMicronutrient}
        onMicronutrientChange={updateMicronutrient}
        onMicronutrientUnitChange={updateMicronutrientUnit}
        onRemoveMicronutrient={removeMicronutrient}
      />

      <PurchaseModal
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        brand={brand}
        onBrandChange={setBrand}
        retailer={retailer}
        onRetailerChange={setRetailer}
        price={price}
        onPriceChange={setPrice}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      <BackButton />

      {onDelete && (
        <ConfirmDeleteModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={onDelete}
          title="Delete Food?"
          message={`This will permanently delete "${name || 'this food'}". This can't be undone.`}
        />
      )}
    </section>
  )
}

export default FoodForm
