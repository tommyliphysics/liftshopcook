import Modal from './Modal.tsx'
import ShoppingListTable from './ShoppingListTable.tsx'
import type { ShoppingListEntry } from '../lib/report.ts'

type ShoppingListModalProps = {
  open: boolean
  onClose: () => void
  entries: ShoppingListEntry[]
}

function ShoppingListModal({ open, onClose, entries }: ShoppingListModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      titleId="shopping-list-title"
      title="Shopping List"
    >
      <ShoppingListTable entries={entries} />

      <button
        type="button"
        className="btn btn-primary btn-full"
        onClick={onClose}
      >
        Done
      </button>
    </Modal>
  )
}

export default ShoppingListModal
