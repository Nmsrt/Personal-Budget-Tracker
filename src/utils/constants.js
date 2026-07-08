export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other']

export const CAT_ICONS = {
  Food:          '🍜',
  Transport:     '🚌',
  Shopping:      '🛍️',
  Bills:         '💡',
  Health:        '💊',
  Entertainment: '🎮',
  Other:         '📦',
}

// Muted jewel tones — sit well on the warm paper background
export const ACCOUNT_COLORS = [
  '#1e5b41',
  '#3e7d5e',
  '#0f766e',
  '#0e7490',
  '#3556a8',
  '#6d4fa1',
  '#a83568',
  '#b6482b',
  '#b07d10',
  '#5f5f5f',
]

export const DEFAULT_ACCOUNTS = [
  { id: 'onhand', name: 'On-Hand Cash', icon: '💵', color: '#1e5b41', balance: 0 },
  { id: 'bdo',    name: 'BDO Bank',     icon: '🏦', color: '#3556a8', balance: 0 },
  { id: 'gcash',  name: 'GCash',        icon: '📱', color: '#6d4fa1', balance: 0 },
]

export const INIT_DATA = {
  accounts: DEFAULT_ACCOUNTS,
  expenses: [],
  weeks: {},
}
