import { useState, useMemo } from 'react'
import { Icon } from '../components/Icon'
import { CATEGORIES, CAT_ICONS } from '../utils/constants'
import { fmt, dayLabel } from '../utils/helpers'

export function Expenses({ data, onAddExpense, onEditExpense, onDeleteExpense }) {
  const [query, setQuery] = useState('')
  const [cat, setCat]     = useState('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.expenses.filter((e) => {
      if (cat !== 'All' && e.category !== cat) return false
      if (q && !(e.description || e.category).toLowerCase().includes(q)) return false
      return true
    })
  }, [data.expenses, query, cat])

  const byDate = useMemo(() => {
    const groups = {}
    filtered.forEach((e) => {
      if (!groups[e.date]) groups[e.date] = []
      groups[e.date].push(e)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  const filteredTotal = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered])
  const isFiltering = query.trim() !== '' || cat !== 'All'

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-sub">
            {data.expenses.length} logged
            {isFiltering && <> · showing {filtered.length} — {fmt(filteredTotal)}</>}
          </p>
        </div>
        <button className="btn-primary" onClick={onAddExpense}>
          <Icon name="plus" size={16} /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="search-box">
          <Icon name="search" size={15} className="search-box__icon" />
          <input
            className="form-input search-box__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search expenses…"
          />
        </div>
        <select className="form-select filter-cat" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
          ))}
        </select>
      </div>

      {/* Log */}
      <div className="card">
        {byDate.length === 0 ? (
          <div className="empty-card empty-card--flat">
            <div className="empty-card__icon">{isFiltering ? '🔍' : '🧾'}</div>
            <p>{isFiltering ? 'Nothing matches your filters' : 'No expenses yet'}</p>
            <small>{isFiltering ? 'Try a different search or category' : 'Tap "Add Expense" to log your first one'}</small>
          </div>
        ) : byDate.map(([date, exps]) => (
          <div key={date} className="date-group">
            <div className="date-group__header">{dayLabel(date)}</div>

            {exps.map((exp) => {
              const acc = data.accounts.find((a) => a.id === exp.accountId)
              return (
                <div key={exp.id} className="expense-row">
                  <div className="expense-row__icon">{CAT_ICONS[exp.category] || '📦'}</div>
                  <div className="expense-row__info">
                    <div className="expense-row__desc">{exp.description || exp.category}</div>
                    <div className="expense-row__meta">
                      <span style={{ color: acc?.color || 'var(--text-muted)' }}>
                        {acc?.icon} {acc?.name || 'Unknown'}
                      </span>
                      <span className="dot">·</span>
                      <span>{exp.category}</span>
                    </div>
                  </div>
                  <div className="expense-row__right">
                    <span className="expense-row__amt">−{fmt(exp.amount)}</span>
                    <button className="icon-btn" onClick={() => onEditExpense(exp)} title="Edit">
                      <Icon name="edit" size={13} />
                    </button>
                    <button className="icon-btn icon-btn--danger" onClick={() => onDeleteExpense(exp)} title="Delete">
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>
              )
            })}

            <div className="date-group__footer">
              Day total:&nbsp;
              <strong style={{ color: 'var(--red)' }}>
                {fmt(exps.reduce((s, e) => s + e.amount, 0))}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
