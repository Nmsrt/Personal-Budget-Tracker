import { useState, useMemo, useCallback } from 'react'
import { Layout }         from './components/Layout'
import { AccountModal }   from './components/AccountModal'
import { ExpenseModal }   from './components/ExpenseModal'
import { TransferModal }  from './components/TransferModal'
import { ConfirmModal }   from './components/ConfirmModal'
import { AccountDetailModal } from './components/AccountDetailModal'
import { Toast }          from './components/Toast'
import { Dashboard }      from './pages/Dashboard'
import { Accounts }       from './pages/Accounts'
import { Expenses }       from './pages/Expenses'
import { Settings }       from './pages/Settings'
import { useBudget }      from './hooks/useBudget'
import { useSettings }    from './hooks/useSettings'
import { INIT_DATA }      from './utils/constants'
import { uid, exportJSON, todayStr, normColor, sumBalances } from './utils/helpers'

export default function App() {
  const { data, update, syncStatus, reconnect, reconnecting } = useBudget()
  const { settings, setSetting }     = useSettings()

  const [page, setPage] = useState('dashboard')

  // Modal visibility
  const [showAddAcc,    setShowAddAcc]    = useState(false)
  const [editAccData,   setEditAccData]   = useState(null)
  const [viewAccId,     setViewAccId]     = useState(null)   // id, so the sheet reflects live balance
  const [showAddExp,    setShowAddExp]    = useState(false)
  const [editExpData,   setEditExpData]   = useState(null)
  const [showTransfer,  setShowTransfer]  = useState(false)
  const [confirm,       setConfirm]       = useState(null)
  const [toast,         setToast]         = useState(null)

  const dismissToast = useCallback(() => setToast(null), [])

  // Derived values
  const total = useMemo(() => sumBalances(data.accounts), [data.accounts])
  // ── Accounts ─────────────────────────────────────────────────────────────
  const addAccount = (form) => {
    update((prev) => ({
      ...prev,
      accounts: [...prev.accounts, {
        id:      uid(),
        name:    form.name.trim(),
        icon:    form.icon || '💰',
        color:   normColor(form.color),
        balance: parseFloat(form.balance) || 0,
        type:    form.type,
      }],
    }))
    setShowAddAcc(false)
  }

  const saveAccount = (form) => {
    update((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === editAccData.id
          ? { ...a, name: form.name.trim(), icon: form.icon, color: normColor(form.color), balance: parseFloat(form.balance) || 0, type: form.type }
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

  // Refund the old amount/account and deduct the new — one update so balances stay consistent.
  // The refund reads the expense from `prev`, not the editExpData snapshot: a realtime update
  // may have changed it while the sheet was open.
  const saveExpense = (form) => {
    const id = editExpData.id
    update((prev) => {
      const old = prev.expenses.find((e) => e.id === id)
      if (!old) return prev   // deleted elsewhere meanwhile
      return {
        ...prev,
        expenses: prev.expenses.map((e) =>
          e.id === id
            ? { ...e, description: form.description.trim(), amount: form.amount, category: form.category, accountId: form.accountId, date: form.date }
            : e
        ),
        accounts: prev.accounts.map((a) => {
          let bal = a.balance
          if (a.id === old.accountId)  bal += old.amount
          if (a.id === form.accountId) bal -= form.amount
          return bal === a.balance ? a : { ...a, balance: bal }
        }),
      }
    })
    setEditExpData(null)
  }

  const deleteExpense = (id) => {
    // Current version (not a stale snapshot), so the refund and the undo use the live amount
    const exp = data.expenses.find((e) => e.id === id)
    if (!exp) return
    update((prev) => {
      const cur = prev.expenses.find((e) => e.id === id)
      if (!cur) return prev
      return {
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== id),
        accounts: prev.accounts.map((a) =>
          a.id === cur.accountId ? { ...a, balance: a.balance + cur.amount } : a
        ),
      }
    })
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

  // ── Data ─────────────────────────────────────────────────────────────────
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

  const resetData = () => {
    setConfirm({
      title: 'Reset All Data',
      message: `Delete all ${data.expenses.length} expenses and restore the default accounts with zero balances? This cannot be undone. Export a backup first if you might need it.`,
      confirmLabel: 'Reset Everything',
      danger: true,
      onConfirm: () => {
        update(() => INIT_DATA)
        setToast({ message: 'All data reset' })
      },
    })
  }

  return (
    <>
      <Layout
        page={page}
        setPage={setPage}
        syncStatus={syncStatus}
      >
        {page === 'dashboard' && (
          <Dashboard
            data={data}
            total={total}
            hideBalances={settings.hideBalances}
            onToggleHide={() => setSetting('hideBalances', !settings.hideBalances)}
            onAddExpense={() => setShowAddExp(true)}
            onTransfer={() => setShowTransfer(true)}
            onAddAccount={() => setShowAddAcc(true)}
            onOpenAccount={(acc) => setViewAccId(acc.id)}
            onViewAccounts={() => setPage('accounts')}
          />
        )}
        {page === 'accounts' && (
          <Accounts
            data={data}
            total={total}
            hideBalances={settings.hideBalances}
            onAddAccount={() => setShowAddAcc(true)}
            onOpenAccount={(acc) => setViewAccId(acc.id)}
          />
        )}
        {page === 'expenses' && (
          <Expenses
            data={data}
            onAddExpense={() => setShowAddExp(true)}
            onEditExpense={setEditExpData}
          />
        )}
        {page === 'settings' && (
          <Settings
            settings={settings}
            setSetting={setSetting}
            data={data}
            syncStatus={syncStatus}
            onReconnect={reconnect}
            reconnecting={reconnecting}
            onExport={() => exportJSON(data)}
            onImport={handleImport}
            onReset={resetData}
          />
        )}
      </Layout>

      <AccountDetailModal
        account={data.accounts.find((a) => a.id === viewAccId) || null}
        expenses={data.expenses}
        hideBalances={settings.hideBalances}
        onClose={() => setViewAccId(null)}
        onEdit={(acc) => { setViewAccId(null); setEditAccData(acc) }}
        onDelete={(id) => { setViewAccId(null); deleteAccount(id) }}
      />
      <AccountModal open={showAddAcc}    onClose={() => setShowAddAcc(false)} onSave={addAccount}  title="Add Account" />
      <AccountModal open={!!editAccData} onClose={() => setEditAccData(null)} onSave={saveAccount} title="Edit Account" initial={editAccData} />
      <ExpenseModal open={showAddExp}    onClose={() => setShowAddExp(false)} accounts={data.accounts} hideBalances={settings.hideBalances} onSave={addExpense} />
      <ExpenseModal
        open={!!editExpData}
        onClose={() => setEditExpData(null)}
        accounts={data.accounts}
        hideBalances={settings.hideBalances}
        onSave={saveExpense}
        onDelete={(exp) => { setEditExpData(null); deleteExpense(exp.id) }}
        initial={editExpData}
      />
      <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} accounts={data.accounts} hideBalances={settings.hideBalances} onSave={transfer} />
      <ConfirmModal confirm={confirm} onClose={() => setConfirm(null)} />
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  )
}
