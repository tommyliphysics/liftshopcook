import Modal from './Modal.tsx'
import type { EnergyUnit, Micronutrient, MicronutrientUnit } from '../types/food.ts'

type NutritionModalProps = {
  open: boolean
  onClose: () => void
  energy: string
  onEnergyChange: (value: string) => void
  energyUnit: EnergyUnit
  onEnergyUnitChange: (unit: EnergyUnit) => void
  carbohydrates: string
  onCarbohydratesChange: (value: string) => void
  fat: string
  onFatChange: (value: string) => void
  protein: string
  onProteinChange: (value: string) => void
  micronutrients: Micronutrient[]
  onAddMicronutrient: () => void
  onMicronutrientChange: (
    id: string,
    field: 'name' | 'amount',
    value: string,
  ) => void
  onMicronutrientUnitChange: (id: string, unit: MicronutrientUnit) => void
  onRemoveMicronutrient: (id: string) => void
}

function NutritionModal({
  open,
  onClose,
  energy,
  onEnergyChange,
  energyUnit,
  onEnergyUnitChange,
  carbohydrates,
  onCarbohydratesChange,
  fat,
  onFatChange,
  protein,
  onProteinChange,
  micronutrients,
  onAddMicronutrient,
  onMicronutrientChange,
  onMicronutrientUnitChange,
  onRemoveMicronutrient,
}: NutritionModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      titleId="nutrition-title"
      title="Nutrition"
    >
      <label htmlFor="energy">Energy</label>
      <div className="unit-row">
        <input
          id="energy"
          type="number"
          value={energy}
          onChange={(e) => onEnergyChange(e.target.value)}
        />
        <select
          aria-label="Energy unit"
          value={energyUnit}
          onChange={(e) => onEnergyUnitChange(e.target.value as EnergyUnit)}
        >
          <option value="cal">cal</option>
          <option value="kJ">kJ</option>
        </select>
      </div>

      <label htmlFor="carbohydrates">Carbohydrates (g)</label>
      <input
        id="carbohydrates"
        type="number"
        value={carbohydrates}
        onChange={(e) => onCarbohydratesChange(e.target.value)}
      />

      <label htmlFor="fat">Fat (g)</label>
      <input
        id="fat"
        type="number"
        value={fat}
        onChange={(e) => onFatChange(e.target.value)}
      />

      <label htmlFor="protein">Protein (g)</label>
      <input
        id="protein"
        type="number"
        value={protein}
        onChange={(e) => onProteinChange(e.target.value)}
      />

      {micronutrients.map((m) => (
        <div className="micronutrient-row" key={m.id}>
          <input
            type="text"
            placeholder="Micronutrient"
            aria-label="Micronutrient name"
            value={m.name}
            onChange={(e) =>
              onMicronutrientChange(m.id, 'name', e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Amount"
            aria-label="Micronutrient amount"
            value={m.amount}
            onChange={(e) =>
              onMicronutrientChange(m.id, 'amount', e.target.value)
            }
          />
          <select
            aria-label="Micronutrient unit"
            value={m.unit}
            onChange={(e) =>
              onMicronutrientUnitChange(
                m.id,
                e.target.value as MicronutrientUnit,
              )
            }
          >
            <option value="g">g</option>
            <option value="mg">mg</option>
            <option value="ug">μg</option>
          </select>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onRemoveMicronutrient(m.id)}
            aria-label={`Remove ${m.name || 'micronutrient'}`}
          >
            &times;
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-secondary btn-full"
        onClick={onAddMicronutrient}
      >
        + Add micronutrient
      </button>

      <button type="button" className="btn btn-primary" onClick={onClose}>
        Done
      </button>
    </Modal>
  )
}

export default NutritionModal
