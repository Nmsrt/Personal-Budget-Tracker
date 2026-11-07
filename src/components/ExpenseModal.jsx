import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Icon } from './Icon'
import { CATEGORIES, CAT_ICONS } from '../utils/constants'
import { fmt, todayStr, daysAgoStr, MASK } from '../utils/helpers'

const blank = (accountId = '') => ({
  description: '',
  amount: '',
  category: 'Food',
  accountId,
  date: todayStr(),
})

// Digits and a single decimal point, max 2 decimals
const cleanAmount = (v) => {
  const s = v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
  const [whole, dec] = s.split('.')
  return dec === undefined ? whole : `${whole}.${dec.slice(0, 2)}`
}

// Pass `initial` (an existing expense) to edit instead of add; `onDelete` shows a delete button when editing.
export function ExpenseModal({ open, onClose, accounts, hideBalances, onSave, onDelete, initial }) {
  const [form, setForm]   = useState(() => blank(accounts[0]?.id || ''))
  const [error, setError] = useState('')
  const editing = !!initial

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(
      initial
        ? { description: initial.description, amount: String(initial.amount), category: initial.category, accountId: initial.accountId, date: initial.date }
        : blank(accounts[0]?.id || '')
    )
  }, [open, initial]) // eslint-disable-line react-hooks/exhaustive-deps

  const setField = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setError('') }

  const handleSubmit = (e) => {
    e.preventDefault()
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) return setError('Enter an amount greater than ₱0')
    if (!form.accountId)  return setError('Choose the account you paid from')
    if (!form.date)       return setError('Pick a date')
    // `max` on the date input isn't enforced for typed values or by some mobile pickers
    if (form.date > todayStr()) return setError("Date can't be in the future")
    onSave({ ...form, amount: Math.round(amt * 100) / 100 })
  }

  const today = todayStr()
  const yesterday = daysAgoStr(1)

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Expense' : 'New Expense'}>
      {accounts.length === 0 ? (
        <div className="form-stack">
          <p className="form-hint">Add an account first — expenses are deducted from an account.</p>
        </div>
      ) : (
        <form className="form-stack expense-form" onSubmit={handleSubmit} noValidate>
          {/* Amount — the one thing every expense needs, so it leads */}
          <label className="amount-field">
            <span className="amount-field__cur">₱</span>
            <input
              className="amount-field__input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={form.amount}
              onChange={(e) => setField('amount', cleanAmount(e.target.value))}
              placeholder="0.00"
              aria-label="Amount"
            />
          </label>

          <div className="form-group">
            <label className="form-label" htmlFor="exp-desc">Description</label>
            <input
              id="exp-desc"
              className="form-input"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="What was it for? (optional)"
              enterKeyHint="done"
            />
          </div>

          <div className="form-group">
            <span className="form-label">Category</span>
            <div className="choice-grid" role="radiogroup" aria-label="Category">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={form.category === c}
                  className={`choice${form.category === c ? ' active' : ''}`}
                  onClick={() => setField('category', c)}
                >
                  <span className="choice__icon">{CAT_ICONS[c]}</span>
                  <span className="choice__text">{c}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <span className="form-label">Paid from</span>
            <div className="choice-accounts" role="radiogroup" aria-label="Account">
              {accounts.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={form.accountId === a.id}
                  className={`choice choice--account${form.accountId === a.id ? ' active' : ''}`}
                  style={{ '--acc-color': a.color }}
                  onClick={() => setField('accountId', a.id)}
                >
                  <span className="choice__icon">{a.icon}</span>
                  <span className="choice__body">
                    <span className="choice__text">{a.name}</span>
                    <span className="choice__meta">{hideBalances ? MASK : fmt(a.balance)}</span>
                  </span>
                  {form.accountId === a.id && <Icon name="check" size={16} className="choice__check" />}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <span className="form-label">Date</span>
            <div className="date-picker">
              <button
                type="button"
                className={`chip${form.date === today ? ' active' : ''}`}
                onClick={() => setField('date', today)}
              >Today</button>
              <button
                type="button"
                className={`chip${form.date === yesterday ? ' active' : ''}`}
                onClick={() => setField('date', yesterday)}
              >Yesterday</button>
              <input
                className="form-input date-picker__input"
                type="date"
                value={form.date}
                max={today}
                onChange={(e) => setField('date', e.target.value)}
                aria-label="Date"
              />
            </div>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="btn-primary btn-full" type="submit">
            {editing ? 'Save Changes' : 'Add Expense'}
          </button>

          {editing && onDelete && (
            <button type="button" className="btn-text-danger" onClick={() => onDelete(initial)}>
              <Icon name="trash" size={15} /> Delete expense
            </button>
          )}
        </form>
      )}
    </Modal>
  )
}
