import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { ACCOUNT_TYPES } from '../utils/constants'
import { fmt, MASK, accountsOfType } from '../utils/helpers'

const blank = (accounts) => ({
  fromId: accounts[0]?.id || '',
  toId: accounts[1]?.id || '',
  amount: '',
})

export function TransferModal({ open, onClose, accounts, hideBalances, onSave }) {
  const [form, setForm] = useState(() => blank(accounts))
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(blank(accounts))
      setError('')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))
  const from = accounts.find((a) => a.id === form.fromId)
  const money = (n) => (hideBalances ? MASK : fmt(n))

  // Same grouped option list for From and To
  const options = ACCOUNT_TYPES.map((t) => {
    const group = accountsOfType(accounts, t.id)
    return group.length === 0 ? null : (
      <optgroup key={t.id} label={t.label}>
        {group.map((a) => (
          <option key={a.id} value={a.id}>{a.icon} {a.name} — {money(a.balance)}</option>
        ))}
      </optgroup>
    )
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) return setError('Enter an amount greater than zero.')
    if (form.fromId === form.toId) return setError('Pick two different accounts.')
    if (from && amt > from.balance) return setError(hideBalances ? `Not enough in ${from.name}.` : `Only ${fmt(from.balance)} available in ${from.name}.`)
    onSave({ fromId: form.fromId, toId: form.toId, amount: amt })
  }

  return (
    <Modal open={open} onClose={onClose} title="Transfer Between Accounts">
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">From</label>
          <select className="form-select" value={form.fromId} onChange={set('fromId')}>
            {options}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">To</label>
          <select className="form-select" value={form.toId} onChange={set('toId')}>
            {options}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Amount (₱)</label>
          <input
            className="form-input" type="number" value={form.amount} onChange={set('amount')}
            placeholder="0.00" min="0" step="0.01" inputMode="decimal"
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="btn-primary btn-full" type="submit">Transfer</button>
      </form>
    </Modal>
  )
}
