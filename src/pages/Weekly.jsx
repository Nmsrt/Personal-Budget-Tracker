import { Icon } from '../components/Icon'
import { fmt, getWeekKey, weekLabel, todayStr } from '../utils/helpers'

export function Weekly({
  selWeek, setSelWeek,
  wkTotal, wkAllow, wkRem,
  allWeeks,
  onAddExpense, onSetAllowance, onViewExpenses,
}) {
  const hasAllow = wkAllow > 0
  const over = hasAllow && wkRem < 0
  const pct  = hasAllow ? Math.min((wkTotal / wkAllow) * 100, 100) : 0

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Budget</h1>
          <p className="page-sub">Track your week, stay on target</p>
        </div>
      </div>

      {/* Week picker */}
      <div className="week-picker">
        <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Select Week</label>
        <select
          className="form-select"
          value={selWeek}
          onChange={(e) => setSelWeek(e.target.value)}
          style={{ maxWidth: '260px' }}
        >
          {allWeeks.map((w) => (
            <option key={w} value={w}>
              {weekLabel(w)}{w === getWeekKey(todayStr()) ? ' ← This Week' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Stat cards */}
      <div className="stat-row">
        {[
          { label: 'Allowance', val: wkAllow,        color: 'var(--ink)' },
          { label: 'Spent',     val: wkTotal,         color: 'var(--spend)' },
          { label: over ? 'Over Budget' : 'Remaining',
            val: hasAllow ? fmt(Math.abs(wkRem)) : '—',
            color: over ? 'var(--red)' : 'var(--green)' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__label">{s.label}</div>
            <div className="stat-card__val" style={{ color: s.color }}>
              {typeof s.val === 'number' ? fmt(s.val) : s.val}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {hasAllow && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="progress-header">
            <span>Budget used</span>
            <span style={{ color: over ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
              {pct.toFixed(1)}%{over ? ' — OVER BUDGET!' : ''}
            </span>
          </div>
          <div className="bar-track bar-track--lg">
            <div
              className={`bar-fill${over ? ' bar-fill--over' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="action-row">
        <button className="btn-primary" onClick={onAddExpense}>
          <Icon name="plus" size={15} /> Add Expense
        </button>
        <button className="btn-secondary" onClick={onSetAllowance}>
          <Icon name="wallet" size={15} />
          {wkAllow ? 'Edit' : 'Set'} Allowance
        </button>
        <button className="btn-secondary" onClick={onViewExpenses}>
          <Icon name="list" size={15} /> View Expense Log
        </button>
      </div>
    </div>
  )
}
