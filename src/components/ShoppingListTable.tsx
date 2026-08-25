import { getCurrencySymbol } from '../data/currencies.ts'
import { formatGrams } from '../lib/units.ts'
import type { ShoppingListEntry } from '../lib/report.ts'

type ShoppingListTableProps = {
  entries: ShoppingListEntry[]
}

function ShoppingListTable({ entries }: ShoppingListTableProps) {
  if (entries.length === 0) return <p>No foods in this period.</p>

  return (
    <div className="foods-table-wrap">
      <table className="foods-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.foodId}>
              <td>{entry.name}</td>
              <td>{entry.brand}</td>
              <td className="cell-mono">{formatGrams(entry.totalGrams)}</td>
              <td className="cell-mono">
                {getCurrencySymbol(entry.currency)}
                {entry.totalPrice.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ShoppingListTable
