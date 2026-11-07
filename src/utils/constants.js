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

// Account palette: a neon row, then deeper tones. AccountModal also offers a custom picker.
export const ACCOUNT_COLORS = [
  // Neon
  '#1fd98a', '#00c2a8', '#00b8ff', '#3d7bff', '#7c5cff',
  '#b14dff', '#ff4fd8', '#ff4d6d', '#ff7a1a', '#ffc800',
  // Deep
  '#a3e635', '#14b8a6', '#1e5b41', '#0e7490', '#3556a8',
  '#6d4fa1', '#a83568', '#b6482b', '#b07d10', '#5f6b66',
]

// Account types, in display order. Stored as `account.type`; accounts saved before types
// existed have none, and `accType` (helpers.js) infers one from the name.
export const ACCOUNT_TYPES = [
  { id: 'cash',   label: 'Physical Cash',    short: 'Cash',   icon: '💵', color: '#1fd98a' },
  { id: 'bank',   label: 'Traditional Bank', short: 'Bank',   icon: '🏦', color: '#38d6ff' },
  { id: 'wallet', label: 'Digital Wallet',   short: 'Wallet', icon: '📱', color: '#a3e635' },
]

export const DEFAULT_ACCOUNTS = [
  { id: 'onhand',  name: 'On-Hand Cash',  icon: '💵', color: '#1fd98a', balance: 0, type: 'cash'   },
  { id: 'storage', name: 'Money Storage', icon: '🫙', color: '#a3e635', balance: 0, type: 'cash'   },
  { id: 'bdo',     name: 'BDO Bank',      icon: '🏦', color: '#3556a8', balance: 0, type: 'bank'   },
  { id: 'gcash',   name: 'GCash',         icon: '📱', color: '#6d4fa1', balance: 0, type: 'wallet' },
]

export const INIT_DATA = {
  accounts: DEFAULT_ACCOUNTS,
  expenses: [],
  weeks: {},
}
