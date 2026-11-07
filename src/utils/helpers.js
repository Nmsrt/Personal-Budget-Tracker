import { ACCOUNT_TYPES } from './constants'

export const fmt = (n) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n ?? 0)

// Local-timezone YYYY-MM-DD (toISOString is UTC and shifts the date before 8am PH time)
const localDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const todayStr = () => localDateStr(new Date())

// Shown in place of money amounts when settings.hideBalances is on
export const MASK = '₱ •••••'

// Normalize to #rrggbb (what <input type="color"> requires); anything else falls back
export const normColor = (c, fallback = '#1fd98a') => {
  if (typeof c !== 'string') return fallback
  if (/^#[0-9a-f]{6}$/i.test(c)) return c.toLowerCase()
  const m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(c)
  return m ? `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}`.toLowerCase() : fallback
}

// Local date n days before today, YYYY-MM-DD
export const daysAgoStr = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return localDateStr(d)
}

// Months are keyed 'YYYY-MM' (the first 7 chars of an expense's date)
export const monthKey = (dateStr) => dateStr.slice(0, 7)

export const shiftMonth = (key, delta) => {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const monthLabel = (key, opts = { month: 'long', year: 'numeric' }) =>
  new Date(key + '-01T12:00:00').toLocaleDateString('en-PH', opts)

export const dayLabel = (dateStr) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('en-PH', {
    weekday: 'long',
    month:   'short',
    day:     'numeric',
  })

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

export const exportJSON = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `budget-backup-${todayStr()}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

// Account type ('cash' | 'bank' | 'wallet'). Untyped (pre-type) accounts are inferred from the name.
// Wallet names are checked first: "GCash" contains "cash" and "MariBank" contains "bank".
const TYPE_IDS = ACCOUNT_TYPES.map((t) => t.id)
export const accType = (acc) => {
  if (TYPE_IDS.includes(acc.type)) return acc.type
  const n = `${acc.id} ${acc.name}`.toLowerCase()
  if (/gcash|maya|maribank|seabank|gotyme|tonik|cimb|grabpay|shopeepay|coins\.ph|wallet/.test(n)) return 'wallet'
  if (/\bcash\b|on-?hand|storage|ipon|alkansya|piggy/.test(n)) return 'cash'
  if (/bank|bdo|bpi|metrobank|landbank|pnb|rcbc|chinabank|eastwest/.test(n)) return 'bank'
  return 'wallet'
}

// Accounts of one type, highest balance first (ties keep stored order)
export const accountsOfType = (accounts, type) =>
  accounts.filter((a) => accType(a) === type).sort((a, b) => b.balance - a.balance)
