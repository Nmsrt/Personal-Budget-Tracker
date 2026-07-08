export const fmt = (n) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n ?? 0)

// Local-timezone YYYY-MM-DD (toISOString is UTC and shifts the date before 8am PH time)
const localDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const todayStr = () => localDateStr(new Date())

export const getWeekKey = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day  // Monday-based week
  const mon = new Date(d)
  mon.setDate(d.getDate() + diff)
  return localDateStr(mon)
}

export const weekLabel = (dateStr) => {
  const mon = new Date(getWeekKey(dateStr) + 'T12:00:00')
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  const opts = { month: 'short', day: 'numeric' }
  return `${mon.toLocaleDateString('en-PH', opts)} – ${sun.toLocaleDateString('en-PH', opts)}`
}

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
