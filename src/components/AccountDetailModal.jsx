import { useMemo } from 'react'
import { Modal } from './Modal'
import { Icon } from './Icon'
import { CAT_ICONS } from '../utils/constants'
import { fmt, monthKey, dayLabel, MASK } from '../utils/helpers'
import { useToday } from '../hooks/useToday'

// Read-only account sheet opened from a Dashboard account row.
// Edit / delete live in the header so the dashboard rows stay clean.
export function AccountDetailModal({ account, expenses, hideBalances, onClose, onEdit, onDelete }) {
  const accExpenses = useMemo(
    () => (account ? expenses.filter((e) => e.accountId === account.id) : []),
    [account, expenses]
  )

  const thisMonth = monthKey(useToday())
  const monthSpent = useMemo(
    () => accExpenses.reduce((s, e) => (monthKey(e.date) === thisMonth ? s + e.amount : s), 0),
    [accExpenses, thisMonth]
  )

  const recent = useMemo(
    () => [...accExpenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [accExpenses]
  )

  if (!account) return null

  const money = (n) => (hideBalances ? MASK : fmt(n))

  const actions = (
    <>
      <button className="modal-action" onClick={() => onEdit(account)} aria-label="Edit account" title="Edit">
        <Icon name="edit" size={16} />
      </button>
      <button className="modal-action modal-action--danger" onClick={() => onDelete(account.id)} aria-label="Delete account" title="Delete">
        <Icon name="trash" size={16} />
      </button>
    </>
  )

  return (
    <Modal open onClose={onClose} title="Account" actions={actions}>
      <div className="acc-detail" style={{ '--acc-color': account.color }}>
        {/* Glass balance card, glowing in the account's own colour */}
        <div className="acc-hero">
          <div className="acc-hero__head">
            <span className="acc-hero__icon">{account.icon}</span>
            <div className="acc-hero__name">{account.name}</div>
          </div>
          <div className="acc-hero__label">Balance</div>
          <div className={`acc-hero__balance${hideBalances ? ' is-hidden' : ''}`}>
            {money(account.balance)}
          </div>
        </div>

        <div className="acc-detail__stats">
          <div className="acc-stat">
            <div className="acc-stat__label">This month</div>
            <div className="acc-stat__value acc-stat__value--spend">{hideBalances ? MASK : `−${fmt(monthSpent)}`}</div>
          </div>
          <div className="acc-stat">
            <div className="acc-stat__label">Expenses</div>
            <div className="acc-stat__value">{accExpenses.length}</div>
          </div>
        </div>

        <div className="acc-detail__section">Recent</div>
        {recent.length === 0 ? (
          <p className="acc-detail__empty">No expenses from this account yet.</p>
        ) : (
          <div className="acc-detail__list">
            {recent.map((e) => (
              <div key={e.id} className="acc-detail__item">
                <span className="acc-detail__item-icon">{CAT_ICONS[e.category] || '📦'}</span>
                <span className="acc-detail__item-info">
                  <span className="acc-detail__item-desc">{e.description || e.category}</span>
                  <span className="acc-detail__item-date">{dayLabel(e.date)}</span>
                </span>
                <span className="acc-detail__item-amt">{hideBalances ? MASK : `−${fmt(e.amount)}`}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
