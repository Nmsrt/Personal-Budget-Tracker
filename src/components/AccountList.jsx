import { Icon } from './Icon'
import { fmt, MASK } from '../utils/helpers'

// Ledger card with a row per account; tapping a row opens AccountDetailModal.
// `total` is the base for each row's share bar.
export function AccountList({ accounts, total, hideBalances, onOpenAccount }) {
  return (
    <div className="account-list">
      {accounts.map((acc) => {
        const share = total > 0 ? Math.max(0, Math.min(1, acc.balance / total)) : 0
        return (
          <button
            key={acc.id}
            className="account-row"
            style={{ '--acc-color': acc.color }}
            onClick={() => onOpenAccount(acc)}
          >
            <span className="account-row__icon">{acc.icon}</span>
            <span className="account-row__info">
              <span className="account-row__name">{acc.name}</span>
              {!hideBalances && (
                <span className="account-row__share">
                  <span className="account-row__share-bar">
                    <span style={{ width: `${share * 100}%` }} />
                  </span>
                  {Math.round(share * 100)}%
                </span>
              )}
            </span>
            <span className="account-row__balance">{hideBalances ? MASK : fmt(acc.balance)}</span>
            <Icon name="arrowRight" size={18} className="account-row__arrow" />
          </button>
        )
      })}
    </div>
  )
}
