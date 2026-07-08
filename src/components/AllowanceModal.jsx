import { useState, useEffect } from 'react'
import { Modal } from './Modal'

export function AllowanceModal({ open, onClose, label, current, onSave }) {
  const [val, setVal] = useState('')

  useEffect(() => {
    if (open) setVal(current ? String(current) : '')
  }, [open, current])

  return (
    <Modal open={open} onClose={onClose} title="Set Weekly Allowance">
      <form
        className="form-stack"
        onSubmit={(e) => { e.preventDefault(); if (val) onSave(val) }}
      >
        <p className="form-hint">{label}</p>
        <div className="form-group">
          <label className="form-label">Weekly Budget Amount (₱)</label>
          <input
            className="form-input"
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="e.g. 3000"
            min="0"
            autoFocus
          />
        </div>
        <button className="btn-primary btn-full" type="submit">
          Save Allowance
        </button>
      </form>
    </Modal>
  )
}
