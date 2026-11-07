import { useState, useMemo, useEffect, useRef } from 'react'
import { Icon } from '../components/Icon'
import { CATEGORIES, CAT_ICONS } from '../utils/constants'
import { fmt, dayLabel, monthKey, shiftMonth, monthLabel } from '../utils/helpers'
import { useToday } from '../hooks/useToday'

const sum = (list) => list.reduce((s, e) => s + e.amount, 0)

// Month-scoped expense log. Tap a row to edit (delete lives in the edit sheet).
export function Expenses({ data, onAddExpense, onEditExpense }) {
  const today     = useToday()
  const thisMonth = monthKey(today)
  const [month, setMonth] = useState(thisMonth)
  const [query, setQuery] = useState('')
  const [cat, setCat]     = useState('All')

  // Month rolled over while open: if we were on the current month, follow it
  const lastThisMonth = useRef(thisMonth)
  useEffect(() => {
    const prev = lastThisMonth.current
    if (prev === thisMonth) return
    lastThisMonth.current = thisMonth
    setMonth((m) => (m === prev ? thisMonth : m))
  }, [thisMonth])

  const prevMonth = shiftMonth(month, -1)

  // One pass: this month's expenses + last month's total
  const { monthExps, prevTotal } = useMemo(() => {
    const list = []
    let prevSum = 0
    data.expenses.forEach((e) => {
      const k = monthKey(e.date)
      if (k === month) list.push(e)
      else if (k === prevMonth) prevSum += e.amount
    })
    return { monthExps: list, prevTotal: prevSum }
  }, [data.expenses, month, prevMonth])
  const monthTotal = useMemo(() => sum(monthExps), [monthExps])

  const accById = useMemo(() => new Map(data.accounts.map((a) => [a.id, a])), [data.accounts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return monthExps.filter((e) => {
      if (cat !== 'All' && e.category !== cat) return false
      if (q && !(e.description || e.category).toLowerCase().includes(q)) return false
      return true
    })
  }, [monthExps, query, cat])

  const byDate = useMemo(() => {
    const groups = {}
    filtered.forEach((e) => { (groups[e.date] ||= []).push(e) })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  const isFiltering = query.trim() !== '' || cat !== 'All'
  const isCurrent   = month === thisMonth
  const prevShort   = monthLabel(prevMonth, { month: 'short' })

  // Month-over-month comparison
  let trend = null
  if (prevTotal > 0) {
    const pct = Math.round(((monthTotal - prevTotal) / prevTotal) * 100)
    trend = pct === 0
      ? { cls: '', text: `Same as ${prevShort}` }
      : { cls: pct > 0 ? 'up' : 'down', text: `${pct > 0 ? '▲' : '▼'} ${Math.abs(pct)}% vs ${prevShort}` }
  } else if (monthTotal > 0) {
    trend = { cls: '', text: `Nothing logged in ${prevShort}` }
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-sub">Tap an expense to edit or delete it</p>
        </div>
        <button className="btn-primary page-header__add" onClick={onAddExpense}>
          <Icon name="plus" size={16} /> Add Expense
        </button>
      </div>

      {/* Month summary + navigator */}
      <section className="month-card">
        <div className="month-nav">
          <button className="month-nav__btn" onClick={() => setMonth(prevMonth)} aria-label="Previous month">
            <Icon name="chevronLeft" size={18} />
          </button>
          <div className="month-nav__label">
            {monthLabel(month)}
          </div>
          <button
            className="month-nav__btn"
            onClick={() => setMonth(shiftMonth(month, 1))}
            disabled={isCurrent}
            aria-label="Next month"
          >
            <Icon name="chevronRight" size={18} />
          </button>
        </div>

        <div className="month-card__body">
          <div>
            <div className="month-card__label">{isCurrent ? 'Spent this month' : 'Spent'}</div>
            <div className="month-card__amt">{fmt(monthTotal)}</div>
          </div>
          <div className="month-card__side">
            <div className="month-card__count">
              {monthExps.length} {monthExps.length === 1 ? 'expense' : 'expenses'}
            </div>
            {trend && <div className={`month-card__trend ${trend.cls}`}>{trend.text}</div>}
          </div>
        </div>
      </section>

      {/* Search + category filter */}
      <div className="filter-bar">
        <div className="search-box">
          <Icon name="search" size={17} className="search-box__icon" />
          <input
            className="form-input search-box__input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            enterKeyHint="search"
          />
          {query && (
            <button className="search-box__clear" onClick={() => setQuery('')} aria-label="Clear search">
              <Icon name="x" size={14} />
            </button>
          )}
        </div>

        <div className={`cat-select${cat !== 'All' ? ' is-active' : ''}`}>
          <select
            className="form-select cat-select__input"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
            ))}
          </select>
          <Icon name="chevronDown" size={16} className="cat-select__chevron" />
        </div>
      </div>

      {isFiltering && filtered.length > 0 && (
        <p className="filter-note">
          {filtered.length} of {monthExps.length} · <strong>{fmt(sum(filtered))}</strong>
        </p>
      )}

      {/* Log */}
      <div className="card ledger">
        {byDate.length === 0 ? (
          <div className="empty-card empty-card--flat">
            <div className="empty-card__icon">{isFiltering ? '🔍' : '🧾'}</div>
            <p>{isFiltering ? 'Nothing matches your filters' : `No expenses in ${monthLabel(month, { month: 'long' })}`}</p>
            <small>
              {isFiltering
                ? 'Try a different search or category'
                : isCurrent ? 'Tap + to log your first one' : 'Pick another month with the arrows'}
            </small>
            {isFiltering && (
              <button className="btn-secondary empty-card__action" onClick={() => { setQuery(''); setCat('All') }}>
                Clear filters
              </button>
            )}
          </div>
        ) : byDate.map(([date, exps]) => (
          <div key={date} className="date-group">
            <div className="date-group__header">
              <span>{date === today ? 'Today' : dayLabel(date)}</span>
              <span className="date-group__total">{fmt(sum(exps))}</span>
            </div>

            {exps.map((exp) => {
              const acc = accById.get(exp.accountId)
              return (
                <button key={exp.id} className="expense-row" onClick={() => onEditExpense(exp)}>
                  <span className="expense-row__icon">{CAT_ICONS[exp.category] || '📦'}</span>
                  <span className="expense-row__info">
                    <span className="expense-row__desc">{exp.description || exp.category}</span>
                    <span className="expense-row__meta">
                      <span className="expense-row__acc" style={{ '--acc-color': acc?.color || 'var(--muted)' }}>
                        {acc ? `${acc.icon} ${acc.name}` : 'Deleted account'}
                      </span>
                      <span className="dot">·</span>
                      <span>{exp.category}</span>
                    </span>
                  </span>
                  <span className="expense-row__amt">−{fmt(exp.amount)}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Mobile floating add button */}
      <button className="fab" onClick={onAddExpense} aria-label="Add expense">
        <Icon name="plus" size={26} />
      </button>
    </div>
  )
}
