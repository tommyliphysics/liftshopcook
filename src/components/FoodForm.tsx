import { useState } from 'react'
import BackButton from './BackButton.tsx'
import NutritionModal from './NutritionModal.tsx'
import PurchaseModal from './PurchaseModal.tsx'
import StatButton from './StatButton.tsx'
import { getCurrencySymbol } from '../data/currencies.ts'
import { EMPTY_FOOD_FORM_VALUES, type FoodFormValues } from '../lib/food.ts'
import { CAL_PER_UNIT, GRAMS_PER_UNIT } from '../lib/units.ts'
import type {
  EnergyUnit,
  Micronutrient,
  MicronutrientUnit,
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
  resetOnSuccess?: boolean
}

function FoodForm({
  title,
  submitLabel,
  savingLabel,
  initialValues,
  onSubmit,
  resetOnSuccess = true,
}: FoodFormProps) {
  const start = initialValues ?? EMPTY_FOOD_FORM_VALUES

  const [name, setName] = useState(start.name)
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

  function handleQuantityUnitChange(newUnit: QuantityUnit) {
    const factor = GRAMS_PER_UNIT[quantityUnit] / GRAMS_PER_UNIT[newUnit]
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
        setCurrency('USD')
      }
    } catch {
      setError('Could not save this food. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page page-center">
      <h1>{title}</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
            price.trim() ? `${getCurrencySymbol(currency)}${price}` : undefined
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
    </section>
  )
}

export default FoodForm
