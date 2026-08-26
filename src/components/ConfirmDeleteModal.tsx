import { useState } from 'react'
import Modal from './Modal.tsx'

type ConfirmDeleteModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  message: string
}

function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmDeleteModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setError('')
    setDeleting(true)
    try {
      await onConfirm()
    } catch {
      setError('Could not delete. Please try again.')
      setDeleting(false)
    }
  }

  function handleClose() {
    if (deleting) return
    setError('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      titleId="confirm-delete-title"
      title={title}
    >
      <p className="confirm-delete-text">{message}</p>

      {error && <p className="form-error">{error}</p>}

      <div className="confirm-delete-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClose}
          disabled={deleting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleConfirm}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDeleteModal
