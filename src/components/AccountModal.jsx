import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { ACCOUNT_COLORS } from '../utils/constants'
import { normColor } from '../utils/helpers'

export function AccountModal({ open, onClose, onSave, title, initial }) {
  const [form, setForm] = useState({ name: '', icon: '💰', color: '#1fd98a', balance: '' })

  useEffect(() => {
    if (!open) return
    setForm(
      initial
        ? { name: initial.name, icon: initial.icon, color: normColor(initial.color), balance: String(initial.balance) }
        : { name: '', icon: '💰', color: '#1fd98a', balance: '' }
    )
  }, [open, initial])

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))
  const isCustom = !ACCOUNT_COLORS.includes(form.color)

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        className="form-stack"
        onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) onSave(form) }}
      >
        <div className="form-group">
          <label className="form-label">Account Name</label>
          <input className="form-input" value={form.name} onChange={set('name')} placeholder="e.g. Maya Wallet" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Emoji Icon</label>
          <input className="form-input" value={form.icon} onChange={set('icon')} placeholder="💰" />
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-picker" role="radiogroup" aria-label="Account color">
            {ACCOUNT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={form.color === c}
                className={`color-swatch${form.color === c ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => setForm((p) => ({ ...p, color: c }))}
                aria-label={c}
              />
            ))}
            {/* Custom: native color picker; shows the chosen color when it isn't a preset */}
            <label
              className={`color-swatch color-swatch--custom${isCustom ? ' selected' : ''}`}
              style={isCustom ? { background: form.color } : undefined}
              title="Custom color"
            >
              {!isCustom && <span aria-hidden="true">+</span>}
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                aria-label="Custom color"
              />
            </label>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Balance (₱)</label>
          <input className="form-input" type="number" value={form.balance} onChange={set('balance')} placeholder="0.00" min="0" step="0.01" />
        </div>
        <button className="btn-primary btn-full" type="submit">
          {title}
        </button>
      </form>
    </Modal>
  )
}
