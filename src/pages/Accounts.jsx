import { useMemo } from 'react'
import { Icon } from '../components/Icon'
import { AccountList } from '../components/AccountList'
import { ACCOUNT_TYPES } from '../utils/constants'
import { fmt, MASK, accountsOfType } from '../utils/helpers'

// Every account, grouped by type: Physical Cash, Traditional Bank, Digital Wallet.
export function Accounts({ data, total, hideBalances, onAddAccount, onOpenAccount }) {
  const groups = useMemo(
    () =>
      ACCOUNT_TYPES
        .map((t) => {
          const accounts = accountsOfType(data.accounts, t.id)
          return { ...t, accounts, sum: accounts.reduce((s, a) => s + a.balance, 0) }
        })
        .filter((g) => g.accounts.length > 0),
    [data.accounts]
  )

  const money = (n) => (hideBalances ? MASK : fmt(n))

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-sub">
            {data.accounts.length} accounts · {money(total)}
          </p>
        </div>
        <button className="btn-primary page-header__add" onClick={onAddAccount}>
          <Icon name="plus" size={16} /> Add Account
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="empty-card">
          <div className="empty-card__icon">🏦</div>
          <p>No accounts yet. Add one to get started!</p>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.id} className="acc-group">
            <div className="section-header">
              <h2 className="section-title">
                <span aria-hidden="true">{g.icon}</span> {g.label}
              </h2>
              <span className="acc-group__sum">{money(g.sum)}</span>
            </div>
            <AccountList accounts={g.accounts} total={total} hideBalances={hideBalances} onOpenAccount={onOpenAccount} />
          </section>
        ))
      )}

      {/* Mobile floating add button */}
      <button className="fab" onClick={onAddAccount} aria-label="Add account">
        <Icon name="plus" size={26} />
      </button>
    </div>
  )
}
