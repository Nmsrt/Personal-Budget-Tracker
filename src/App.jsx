import { useState, useMemo, useCallback } from 'react'
import { Layout }         from './components/Layout'
import { AccountModal }   from './components/AccountModal'
import { ExpenseModal }   from './components/ExpenseModal'
import { AllowanceModal } from './components/AllowanceModal'
import { TransferModal }  from './components/TransferModal'
import { ConfirmModal }   from './components/ConfirmModal'
import { Toast }          from './components/Toast'
import { Dashboard }      from './pages/Dashboard'
import { Expenses }       from './pages/Expenses'
import { Weekly }         from './pages/Weekly'
import { useBudget }      from './hooks/useBudget'
import { uid, exportJSON, getWeekKey, weekLabel, todayStr } from './utils/helpers'

export default function App() {
  const { data, update, syncStatus } = useBudget()

  const [page, setPage]       = useState('expenses')
  const [selWeek, setSelWeek] = useState(() => getWeekKey(todayStr()))

  // Modal visibility
  const [showAddAcc,    setShowAddAcc]    = useState(false)
  const [editAccData,   setEditAccData]   = useState(null)
  const [showAddExp,    setShowAddExp]    = useState(false)
  const [editExpData,   setEditExpData]   = useState(null)
  const [showTransfer,  setShowTransfer]  = useState(false)
  const [showAllowance, setShowAllowance] = useState(false)
  const [confirm,       setConfirm]       = useState(null)
  const [toast,         setToast]         = useState(null)

  const dismissToast = useCallback(() => setToast(null), [])

  // Derived values
  const total   = useMemo(() => data.accounts.reduce((s, a) => s + a.balance, 0), [data.accounts])
  const wkExp   = useMemo(() => data.expenses.filter((e) => getWeekKey(e.date) === selWeek), [data.expenses, selWeek])
  const wkTotal = useMemo(() => wkExp.reduce((s, e) => s + e.amount, 0), [wkExp])
  const wkAllow = data.weeks[selWeek]?.allowance ?? 0
  const wkRem   = wkAllow - wkTotal

  // Always the real current week, regardless of which week is selected on the Weekly page
  const thisWeekTotal = useMemo(() => {
    const key = getWeekKey(todayStr())
    return data.expenses.reduce((s, e) => (getWeekKey(e.date) === key ? s + e.amount : s), 0)
  }, [data.expenses])

  const allWeeks = useMemo(() => {
    const keys = new Set(data.expenses.map((e) => getWeekKey(e.date)))
    Object.keys(data.weeks).forEach((k) => keys.add(k))
    keys.add(getWeekKey(todayStr()))
    return [...keys].sort().reverse()
  }, [data.expenses, data.weeks])

  // Most recent earlier week with an allowance — prefill suggestion when this week has none
  const prevAllowance = useMemo(() => {
    const prev = Object.keys(data.weeks)
      .filter((k) => k < selWeek && data.weeks[k]?.allowance > 0)
      .sort()
      .pop()
    return prev ? data.weeks[prev].allowance : 0
  }, [data.weeks, selWeek])

  // ── Accounts ─────────────────────────────────────────────────────────────
  const addAccount = (form) => {
    update((prev) => ({
      ...prev,
      accounts: [...prev.accounts, {
        id:      uid(),
        name:    form.name.trim(),
        icon:    form.icon || '💰',
        color:   form.color || '#16a34a',
        balance: parseFloat(form.balance) || 0,
      }],
    }))
    setShowAddAcc(false)
  }

  const saveAccount = (form) => {
    update((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === editAccData.id
          ? { ...a, name: form.name.trim(), icon: form.icon, color: form.color, balance: parseFloat(form.balance) || 0 }
          : a
      ),
    }))
    setEditAccData(null)
  }

  const deleteAccount = (id) => {
    const acc = data.accounts.find((a) => a.id === id)
    setConfirm({
      title: 'Delete Account',
      message: `Delete "${acc?.name}"? Its expense history stays, but the balance is gone. This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () =>
        update((prev) => ({ ...prev, accounts: prev.accounts.filter((a) => a.id !== id) })),
    })
  }

  const transfer = ({ fromId, toId, amount }) => {
    update((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => {
        if (a.id === fromId) return { ...a, balance: a.balance - amount }
        if (a.id === toId)   return { ...a, balance: a.balance + amount }
        return a
      }),
    }))
    setShowTransfer(false)
    setToast({ message: 'Transfer complete' })
  }

  // ── Expenses ─────────────────────────────────────────────────────────────
  const addExpense = (form) => {
    const exp = {
      id:          uid(),
      description: form.description.trim(),
      amount:      form.amount,
      category:    form.category,
      accountId:   form.accountId,
      date:        form.date || todayStr(),
    }
    update((prev) => ({
      ...prev,
      expenses: [exp, ...prev.expenses],
      accounts: prev.accounts.map((a) =>
        a.id === exp.accountId ? { ...a, balance: a.balance - exp.amount } : a
      ),
    }))
    setShowAddExp(false)
  }

  // Refund the old amount/account and deduct the new — one update so balances stay consistent
  const saveExpense = (form) => {
    const old = editExpData
    update((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.id === old.id
          ? { ...e, description: form.description.trim(), amount: form.amount, category: form.category, accountId: form.accountId, date: form.date }
          : e
      ),
      accounts: prev.accounts.map((a) => {
        let bal = a.balance
        if (a.id === old.accountId)  bal += old.amount
        if (a.id === form.accountId) bal -= form.amount
        return bal === a.balance ? a : { ...a, balance: bal }
      }),
    }))
    setEditExpData(null)
  }

  const deleteExpense = (exp) => {
    update((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== exp.id),
      accounts: prev.accounts.map((a) =>
        a.id === exp.accountId ? { ...a, balance: a.balance + exp.amount } : a
      ),
    }))
    setToast({
      message: `Deleted "${exp.description || exp.category}"`,
      actionLabel: 'Undo',
      onAction: () =>
        update((prev) => ({
          ...prev,
          expenses: [exp, ...prev.expenses],
          accounts: prev.accounts.map((a) =>
            a.id === exp.accountId ? { ...a, balance: a.balance - exp.amount } : a
          ),
        })),
    })
  }

  // ── Allowance / data ─────────────────────────────────────────────────────
  const setAllowance = (amt) => {
    update((prev) => ({
      ...prev,
      weeks: {
        ...prev.weeks,
        [selWeek]: { ...prev.weeks[selWeek], allowance: parseFloat(amt) || 0 },
      },
    }))
    setShowAllowance(false)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (!parsed || !Array.isArray(parsed.accounts) || !Array.isArray(parsed.expenses)) {
          throw new Error('Invalid format')
        }
        const next = { accounts: parsed.accounts, expenses: parsed.expenses, weeks: parsed.weeks || {} }
        setConfirm({
          title: 'Import Data',
          message: `Replace everything with "${file.name}" (${next.accounts.length} accounts, ${next.expenses.length} expenses)? Current data will be overwritten.`,
          confirmLabel: 'Import',
          danger: true,
          onConfirm: () => {
            update(() => next)
            setToast({ message: 'Data imported' })
          },
        })
      } catch {
        setToast({ message: 'Could not import — invalid JSON file' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <Layout
        page={page}
        setPage={setPage}
        onExport={() => exportJSON(data)}
        onImport={handleImport}
        syncStatus={syncStatus}
      >
        {page === 'dashboard' && (
          <Dashboard
            data={data}
            total={total}
            wkTotal={thisWeekTotal}
            onAddAccount={() => setShowAddAcc(true)}
            onEditAccount={setEditAccData}
            onDeleteAccount={deleteAccount}
            onAddExpense={() => setShowAddExp(true)}
            onTransfer={() => setShowTransfer(true)}
          />
        )}
        {page === 'expenses' && (
          <Expenses
            data={data}
            onAddExpense={() => setShowAddExp(true)}
            onEditExpense={setEditExpData}
            onDeleteExpense={deleteExpense}
          />
        )}
        {page === 'weekly' && (
          <Weekly
            selWeek={selWeek}
            setSelWeek={setSelWeek}
            wkTotal={wkTotal}
            wkAllow={wkAllow}
            wkRem={wkRem}
            allWeeks={allWeeks}
            onAddExpense={() => setShowAddExp(true)}
            onSetAllowance={() => setShowAllowance(true)}
            onViewExpenses={() => setPage('expenses')}
          />
        )}
      </Layout>

      <AccountModal open={showAddAcc}    onClose={() => setShowAddAcc(false)} onSave={addAccount}  title="Add Account" />
      <AccountModal open={!!editAccData} onClose={() => setEditAccData(null)} onSave={saveAccount} title="Edit Account" initial={editAccData} />
      <ExpenseModal open={showAddExp}    onClose={() => setShowAddExp(false)} accounts={data.accounts} onSave={addExpense} />
      <ExpenseModal open={!!editExpData} onClose={() => setEditExpData(null)} accounts={data.accounts} onSave={saveExpense} initial={editExpData} />
      <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} accounts={data.accounts} onSave={transfer} />
      <AllowanceModal
        open={showAllowance}
        onClose={() => setShowAllowance(false)}
        label={weekLabel(selWeek)}
        current={wkAllow || prevAllowance}
        onSave={setAllowance}
      />
      <ConfirmModal confirm={confirm} onClose={() => setConfirm(null)} />
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  )
}
