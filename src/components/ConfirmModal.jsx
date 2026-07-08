import { Modal } from './Modal'

// Replaces window.confirm(). App opens it with { title, message, confirmLabel, danger, onConfirm }.
export function ConfirmModal({ confirm, onClose }) {
  if (!confirm) return null
  const { title, message, confirmLabel = 'Confirm', danger = false, onConfirm } = confirm

  return (
    <Modal open onClose={onClose} title={title}>
      <div className="form-stack">
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onClose} autoFocus>
            Cancel
          </button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={() => { onConfirm(); onClose() }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
