import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { CATEGORIES, CAT_ICONS } from '../utils/constants'
import { fmt, todayStr } from '../utils/helpers'

const blank = (accountId = '') => ({
  description: '',
  amount: '',
  category: 'Food',
  accountId,
  date: todayStr(),
})

// Pass `initial` (an existing expense) to edit instead of add.
export function ExpenseModal({ open, onClose, accounts, onSave, initial }) {
  const [form, setForm] = useState(() => blank(accounts[0]?.id || ''))
  const editing = !!initial

  useEffect(() => {
    if (!open) return
    setForm(
      initial
        ? { description: initial.description, amount: String(initial.amount), category: initial.category, accountId: initial.accountId, date: initial.date }
        : blank(accounts[0]?.id || '')
    )
  }, [open, initial]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0 || !form.accountId) return
    onSave({ ...form, amount: amt })
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Expense' : 'Add Expense'}>
      {accounts.length === 0 ? (
        <div className="form-stack">
          <p className="form-hint">Add an account first — expenses are deducted from an account.</p>
        </div>
      ) : (
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" value={form.description} onChange={set('description')} placeholder="e.g. Lunch, Grab fare…" autoFocus />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount (₱)</label>
              <input className="form-input" type="number" value={form.amount} onChange={set('amount')} placeholder="0.00" min="0" step="0.01" required />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.date} onChange={set('date')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Deduct from Account</label>
            <select className="form-select" value={form.accountId} onChange={set('accountId')}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {a.name} — {fmt(a.balance)}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-primary btn-full" type="submit">
            {editing ? 'Save Changes' : 'Add Expense'}
          </button>
        </form>
      )}
    </Modal>
  )
}
