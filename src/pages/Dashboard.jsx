import { useMemo } from 'react'
import { Icon } from '../components/Icon'
import { CAT_ICONS, ACCOUNT_TYPES } from '../utils/constants'
import { fmt, monthKey, monthLabel, MASK, accountsOfType, sumBalances } from '../utils/helpers'
import { useToday } from '../hooks/useToday'

export function Dashboard({
  data, total,
  hideBalances, onToggleHide,
  onAddExpense, onTransfer, onAddAccount, onViewAccounts,
}) {
  const thisMonth = monthKey(useToday())

  // Category breakdown for the current month
  const { monthSpent, catTotals } = useMemo(() => {
    const t = {}
    let spent = 0
    data.expenses.forEach((e) => {
      if (monthKey(e.date) !== thisMonth) return
      spent += e.amount
      t[e.category] = (t[e.category] || 0) + e.amount
    })
    return { monthSpent: spent, catTotals: Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 6) }
  }, [data.expenses, thisMonth])

  const money = (n) => (hideBalances ? MASK : fmt(n))
  const canTransfer = data.accounts.length > 1
  const typeTotals = useMemo(
    () => ACCOUNT_TYPES.map((t) => {
      const accounts = accountsOfType(data.accounts, t.id)
      return { ...t, sum: sumBalances(accounts) }
    }),
    [data.accounts]
  )

  return (
    <div className="page-enter">
      <div className="page-header page-header--dash">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Your financial overview</p>
        </div>
      </div>

      {/* Hero: frosted glass card over the neon background glows */}
      <section className="hero-card">
        <span className="hero-card__watermark" aria-hidden="true">₱</span>
        <div className="hero-card__top">
          <span className="hero-card__seal">₱</span>
          <div className="hero-card__title">Total balance</div>
        </div>

        <div className="hero-card__amount-row">
          <span className={`hero-card__amount${hideBalances ? ' is-hidden' : ''}`}>{money(total)}</span>
          <button
            className="hero-card__eye"
            onClick={onToggleHide}
            aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
            aria-pressed={hideBalances}
          >
            <Icon name={hideBalances ? 'eyeOff' : 'eye'} size={20} />
          </button>
        </div>
      </section>

      {/* Quick actions */}
      <div className="quick-actions">
        <button className="quick-action" onClick={onAddExpense}>
          <span className="quick-action__circle"><Icon name="plus" size={26} /></span>
          <span className="quick-action__label">Add Expense</span>
        </button>
        <button className="quick-action" onClick={onTransfer} disabled={!canTransfer}
          title={canTransfer ? undefined : 'Add a second account to transfer'}>
          <span className="quick-action__circle"><Icon name="transfer" size={24} /></span>
          <span className="quick-action__label">Transfer</span>
        </button>
        <button className="quick-action" onClick={onAddAccount}>
          <span className="quick-action__circle"><Icon name="wallet" size={24} /></span>
          <span className="quick-action__label">Add Account</span>
        </button>
      </div>

      {/* Balance per account type; tapping a row opens the Accounts page (grouped by type) */}
      <div className="section-header">
        <h2 className="section-title">Summary</h2>
        <button className="section-link" onClick={onViewAccounts}>
          All accounts <Icon name="arrowRight" size={14} />
        </button>
      </div>

      <div className="account-list">
        {typeTotals.map((t) => {
          const share = total > 0 ? Math.max(0, Math.min(1, t.sum / total)) : 0
          return (
            <button key={t.id} className="account-row account-row--plain" onClick={onViewAccounts}>
              <span className="account-row__icon">{t.icon}</span>
              <span className="account-row__info">
                <span className="account-row__name">{t.label}</span>
                {!hideBalances && (
                  <span className="account-row__share">
                    <span className="account-row__share-bar">
                      <span style={{ width: `${share * 100}%` }} />
                    </span>
                    {Math.round(share * 100)}%
                  </span>
                )}
              </span>
              <span className="account-row__balance">{money(t.sum)}</span>
              <Icon name="arrowRight" size={18} className="account-row__arrow" />
            </button>
          )
        })}
      </div>

      {/* Spending by category */}
      {catTotals.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Spending by Category</h3>
            <span className="card-header__meta">{monthLabel(thisMonth, { month: 'long' })} · {money(monthSpent)}</span>
          </div>
          <div className="cat-list">
            {catTotals.map(([cat, amt]) => {
              const pct = monthSpent > 0 ? (amt / monthSpent) * 100 : 0
              return (
                <div key={cat} className="cat-item">
                  <div className="cat-item__header">
                    <span>{CAT_ICONS[cat] || '📦'} {cat}</span>
                    <span className="cat-item__amt">{money(amt)}</span>
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
