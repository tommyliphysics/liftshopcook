import type { ReactNode } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  titleId: string
  title: string
  children: ReactNode
}

function Modal({ open, onClose, titleId, title, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export default Modal
