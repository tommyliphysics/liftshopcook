import { useState } from 'react'
import Modal from './Modal.tsx'
import { getCurrencySymbol } from '../data/currencies.ts'
import { formatQuantity } from '../lib/units.ts'
import { auth } from '../firebase.ts'
import {
  currenciesInUse,
  persistExchangeRates,
  persistPriceUpdates,
  resolveShoppingList,
  type ResolutionMode,
  type ResolutionScope,
} from '../lib/currencyResolution.ts'
import type { ShoppingListEntry } from '../lib/report.ts'
import type { MealListItem } from '../types/food.ts'

type CurrencyMismatchModalProps = {
  open: boolean
  onClose: () => void
  entries: ShoppingListEntry[]
  meals: MealListItem[]
  weekStart: string
  weekEnd: string
  onResolved: (entries: ShoppingListEntry[]) => void
}

function CurrencyMismatchModal({
  open,
  onClose,
  entries,
  meals,
  weekStart,
  weekEnd,
  onResolved,
}: CurrencyMismatchModalProps) {
  const [targetCurrency, setTargetCurrency] = useState('')
  const [mode, setMode] = useState<ResolutionMode | null>(null)
  const [scope, setScope] = useState<ResolutionScope>('database')
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({})
  const [rateInputs, setRateInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const usedCurrencies = currenciesInUse(entries)
  const otherCurrencies = usedCurrencies.filter((c) => c !== targetCurrency)

  function reset() {
    setTargetCurrency('')
    setMode(null)
    setScope('database')
    setPriceInputs({})
    setRateInputs({})
    setError('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleTargetChange(value: string) {
    setTargetCurrency(value)
    setPriceInputs(
      Object.fromEntries(
        entries.map((entry) => [entry.foodId, entry.totalPrice.toFixed(2)]),
      ),
    )
    setRateInputs({})
  }

  function handleModeChange(value: ResolutionMode) {
    setMode(value)
  }

  async function handleSubmit() {
    if (!targetCurrency || !mode) return

    if (mode === 'update-prices') {
      for (const entry of entries) {
        const input = priceInputs[entry.foodId]
        if (input === undefined || input.trim() === '' || Number.isNaN(Number(input))) {
          setError('Enter a valid price for every food.')
          return
        }
      }
    } else {
      for (const currency of otherCurrencies) {
        const input = rateInputs[currency]
        if (
          input === undefined ||
          input.trim() === '' ||
          !(Number(input) > 0)
        ) {
          setError('Enter a valid exchange rate for every currency.')
          return
        }
      }
    }

    setError('')
    setSaving(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Not signed in')

      if (mode === 'update-prices') {
        await persistPriceUpdates(
          user.uid,
          meals,
          entries,
          targetCurrency,
          priceInputs,
          scope === 'database',
        )
      } else {
        await persistExchangeRates(
          user.uid,
          otherCurrencies,
          targetCurrency,
          rateInputs,
          weekStart,
          weekEnd,
        )
      }

      const resolved = resolveShoppingList(
        entries,
        targetCurrency,
        mode,
        priceInputs,
        rateInputs,
      )
      onResolved(resolved)
      reset()
    } catch {
      setError('Could not update prices. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const canSubmit = targetCurrency !== '' && mode !== null && !saving

  return (
    <Modal
      open={open}
      onClose={handleClose}
      titleId="currency-mismatch-title"
      title="Food prices are not in the same currency!"
    >
      <label htmlFor="target-currency">Select currency</label>
      <select
        id="target-currency"
        value={targetCurrency}
        onChange={(e) => handleTargetChange(e.target.value)}
      >
        <option value="" disabled>
          select currency
        </option>
        {usedCurrencies.map((code) => (
          <option key={code} value={code}>
            {code} ({getCurrencySymbol(code)})
          </option>
        ))}
      </select>

      {targetCurrency && (
        <>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-option${mode === 'update-prices' ? ' active' : ''}`}
              onClick={() => handleModeChange('update-prices')}
            >
              Update prices
            </button>
            <button
              type="button"
              className={`toggle-option${mode === 'exchange-rate' ? ' active' : ''}`}
              onClick={() => handleModeChange('exchange-rate')}
            >
              Input exchange rate
            </button>
          </div>

          {mode === 'update-prices' &&
            entries.map((entry) => (
              <div className="currency-fix-row" key={entry.foodId}>
                <div className="currency-fix-row-label">
                  <span className="currency-fix-row-name">{entry.name}</span>
                  <span className="currency-fix-row-qty">
                    {formatQuantity(entry)}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  aria-label={`Price for ${entry.name} in ${targetCurrency}`}
                  value={priceInputs[entry.foodId] ?? ''}
                  onChange={(e) =>
                    setPriceInputs((current) => ({
                      ...current,
                      [entry.foodId]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}

          {mode === 'exchange-rate' &&
            (otherCurrencies.length === 0 ? (
              <p className="food-search-empty">
                All foods are already priced in {targetCurrency}.
              </p>
            ) : (
              otherCurrencies.map((currency) => (
                <div className="currency-fix-row" key={currency}>
                  <div className="currency-fix-row-label">
                    <span className="currency-fix-row-name">
                      {currency} ({getCurrencySymbol(currency)})
                    </span>
                    <span className="currency-fix-row-qty">
                      1 {currency} = ? {targetCurrency}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.0001"
                    aria-label={`Exchange rate from ${currency} to ${targetCurrency}`}
                    value={rateInputs[currency] ?? ''}
                    onChange={(e) =>
                      setRateInputs((current) => ({
                        ...current,
                        [currency]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))
            ))}

          {mode === 'update-prices' && (
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-option${scope === 'database' ? ' active' : ''}`}
                onClick={() => setScope('database')}
              >
                Update in database
              </button>
              <button
                type="button"
                className={`toggle-option${scope === 'this-week' ? ' active' : ''}`}
                onClick={() => setScope('this-week')}
              >
                Update this week only
              </button>
            </div>
          )}
        </>
      )}

      {error && <p className="form-error">{error}</p>}

      <button
        type="button"
        className="btn btn-primary btn-full"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        {saving ? 'Saving...' : 'Apply'}
      </button>
    </Modal>
  )
}

export default CurrencyMismatchModal
