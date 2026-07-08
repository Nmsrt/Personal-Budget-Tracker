import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { fmt } from '../utils/helpers'

const blank = (accounts) => ({
  fromId: accounts[0]?.id || '',
  toId: accounts[1]?.id || '',
  amount: '',
})

export function TransferModal({ open, onClose, accounts, onSave }) {
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

  const handleSubmit = (e) => {
    e.preventDefault()
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) return setError('Enter an amount greater than zero.')
    if (form.fromId === form.toId) return setError('Pick two different accounts.')
    if (from && amt > from.balance) return setError(`Only ${fmt(from.balance)} available in ${from.name}.`)
    onSave({ fromId: form.fromId, toId: form.toId, amount: amt })
  }

  return (
    <Modal open={open} onClose={onClose} title="Transfer Between Accounts">
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">From</label>
          <select className="form-select" value={form.fromId} onChange={set('fromId')}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.icon} {a.name} — {fmt(a.balance)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">To</label>
          <select className="form-select" value={form.toId} onChange={set('toId')}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.icon} {a.name} — {fmt(a.balance)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Amount (₱)</label>
          <input
            className="form-input" type="number" value={form.amount} onChange={set('amount')}
            placeholder="0.00" min="0" step="0.01" autoFocus
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="btn-primary btn-full" type="submit">Transfer</button>
      </form>
    </Modal>
  )
}
