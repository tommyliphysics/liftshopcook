import Modal from './Modal.tsx'
import { CURRENCIES } from '../data/currencies.ts'

type PurchaseModalProps = {
  open: boolean
  onClose: () => void
  brand: string
  onBrandChange: (value: string) => void
  retailer: string
  onRetailerChange: (value: string) => void
  price: string
  onPriceChange: (value: string) => void
  currency: string
  onCurrencyChange: (value: string) => void
}

function PurchaseModal({
  open,
  onClose,
  brand,
  onBrandChange,
  retailer,
  onRetailerChange,
  price,
  onPriceChange,
  currency,
  onCurrencyChange,
}: PurchaseModalProps) {
  return (
    <Modal open={open} onClose={onClose} titleId="purchase-title" title="Price">
      <label htmlFor="brand">Brand</label>
      <input
        id="brand"
        type="text"
        value={brand}
        onChange={(e) => onBrandChange(e.target.value)}
      />

      <label htmlFor="retailer">Retailer</label>
      <input
        id="retailer"
        type="text"
        value={retailer}
        onChange={(e) => onRetailerChange(e.target.value)}
      />

      <label htmlFor="price">Price</label>
      <div className="unit-row">
        <input
          id="price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
        />
        <select
          aria-label="Currency"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol})
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="btn btn-primary" onClick={onClose}>
        Done
      </button>
    </Modal>
  )
}

export default PurchaseModal
