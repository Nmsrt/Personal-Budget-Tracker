import { useMemo } from 'react'
import { Icon } from '../components/Icon'
import { CAT_ICONS } from '../utils/constants'
import { fmt } from '../utils/helpers'

export function Dashboard({ data, total, wkTotal, onAddAccount, onEditAccount, onDeleteAccount, onAddExpense, onTransfer }) {
  const totalSpent = useMemo(
    () => data.expenses.reduce((s, e) => s + e.amount, 0),
    [data.expenses]
  )

  const catTotals = useMemo(() => {
    const t = {}
    data.expenses.forEach((e) => { t[e.category] = (t[e.category] || 0) + e.amount })
    return Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [data.expenses])

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Your financial overview</p>
        </div>
        <button className="btn-primary" onClick={onAddExpense}>
          <Icon name="plus" size={16} /> Add Expense
        </button>
      </div>

      {/* Hero */}
      <div className="hero-card">
        <div className="hero-card__label">Total Balance</div>
        <div className="hero-card__amount">{fmt(total)}</div>
        <div className="hero-card__meta">
          This week: <strong style={{ color: 'var(--red)' }}>{fmt(wkTotal)}</strong>
          <span className="dot">·</span>
          All-time: <strong style={{ color: 'var(--red)' }}>{fmt(totalSpent)}</strong>
        </div>
      </div>

      {/* Accounts */}
      <div className="section-header">
        <h2 className="section-title">Accounts</h2>
        <div className="section-actions">
          {data.accounts.length > 1 && (
            <button className="btn-outline-green" onClick={onTransfer}>
              <Icon name="transfer" size={13} /> Transfer
            </button>
          )}
          <button className="btn-outline-green" onClick={onAddAccount}>
            <Icon name="plus" size={13} /> Add Account
          </button>
        </div>
      </div>

      {data.accounts.length === 0 ? (
        <div className="empty-card">
          <div className="empty-card__icon">🏦</div>
          <p>No accounts yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="accounts-grid">
          {data.accounts.map((acc) => (
            <AccountCard key={acc.id} acc={acc} onEdit={onEditAccount} onDelete={onDeleteAccount} />
          ))}
        </div>
      )}

      {/* Spending by category */}
      {catTotals.length > 0 && (
        <div className="card">
          <h3 className="card-title">Spending by Category</h3>
          <div className="cat-list">
            {catTotals.map(([cat, amt]) => {
              const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0
              return (
                <div key={cat} className="cat-item">
                  <div className="cat-item__header">
                    <span>{CAT_ICONS[cat] || '📦'} {cat}</span>
                    <span className="cat-item__amt">{fmt(amt)}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function AccountCard({ acc, onEdit, onDelete }) {
  return (
    <div className="account-card" style={{ '--acc-color': acc.color }}>
      <div className="account-card__top">
        <span className="account-card__icon">{acc.icon}</span>
        <div className="account-card__actions">
          <button className="icon-btn" onClick={() => onEdit(acc)} title="Edit">
            <Icon name="edit" size={13} />
          </button>
          <button className="icon-btn icon-btn--danger" onClick={() => onDelete(acc.id)} title="Delete">
            <Icon name="trash" size={13} />
          </button>
        </div>
      </div>
      <div className="account-card__balance">{fmt(acc.balance)}</div>
      <div className="account-card__name">{acc.name}</div>
      <div className="account-card__bar" />
    </div>
  )
}
