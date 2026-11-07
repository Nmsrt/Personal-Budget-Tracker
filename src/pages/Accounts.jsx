import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { AccountList } from '../components/AccountList'
import { ACCOUNT_TYPES } from '../utils/constants'
import { fmt, MASK, accountsOfType, sumBalances } from '../utils/helpers'

// Every account, grouped by type: Physical Cash, Traditional Bank, Digital Wallet.
export function Accounts({ data, total, hideBalances, onAddAccount, onTransfer, onOpenAccount }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const canTransfer = data.accounts.length > 1

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const pick = (fn) => () => { setMenuOpen(false); fn() }

  const groups = useMemo(
    () =>
      ACCOUNT_TYPES
        .map((t) => {
          const accounts = accountsOfType(data.accounts, t.id)
          return { ...t, accounts, sum: sumBalances(accounts) }
        })
        .filter((g) => g.accounts.length > 0),
    [data.accounts]
  )

  const money = (n) => (hideBalances ? MASK : fmt(n))

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Accounts</h1>
        <div className="page-header__add page-header__actions">
          <button className="btn-secondary" onClick={onTransfer} disabled={!canTransfer}
            title={canTransfer ? undefined : 'Add a second account to transfer'}>
            <Icon name="transfer" size={16} /> Transfer
          </button>
          <button className="btn-primary" onClick={onAddAccount}>
            <Icon name="plus" size={16} /> Add Account
          </button>
        </div>
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

      {/* Mobile floating button: opens a small menu above it (add account / transfer) */}
      {menuOpen && <div className="fab-scrim" onClick={() => setMenuOpen(false)} />}
      <div className={`fab-menu${menuOpen ? ' open' : ''}`} role="menu" aria-hidden={!menuOpen}>
        <button className="fab-menu__item" role="menuitem" onClick={pick(onTransfer)} disabled={!canTransfer}
          tabIndex={menuOpen ? 0 : -1}>
          <span>Transfer</span>
          <span className="fab-menu__icon"><Icon name="transfer" size={18} /></span>
        </button>
        <button className="fab-menu__item" role="menuitem" onClick={pick(onAddAccount)} tabIndex={menuOpen ? 0 : -1}>
          <span>Add account</span>
          <span className="fab-menu__icon"><Icon name="wallet" size={18} /></span>
        </button>
      </div>
      <button className={`fab${menuOpen ? ' fab--open' : ''}`} onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? 'Close menu' : 'Add account or transfer'} aria-expanded={menuOpen} aria-haspopup="menu">
        <Icon name="plus" size={26} />
      </button>
    </div>
  )
}
