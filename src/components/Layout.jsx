import { useState } from 'react'
import { Icon } from './Icon'

// Ordered by importance: daily logging first, weekly budget check, then overview
const NAV = [
  { id: 'expenses',  label: 'Expenses',  icon: 'list'      },
  { id: 'weekly',    label: 'Weekly',    icon: 'calendar'  },
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
]

export function Layout({ page, setPage, onExport, onImport, syncStatus, children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const dot = syncStatus === 'online'
    ? { label: 'Online',  cls: 'sync--online'  }
    : { label: 'Offline', cls: 'sync--offline' }

  const SyncBadge = () => (
    <span className={`sync-badge ${dot.cls}`}>
      <span className="sync-dot" />
      {dot.label}
    </span>
  )

  return (
    <div className="app">

      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">₱</span>
          <div>
            <div className="brand-name">Budget</div>
            <div className="brand-sub">Tracker</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-btn${page === n.id ? ' active' : ''}`}
              onClick={() => setPage(n.id)}
            >
              <Icon name={n.icon} size={17} />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <SyncBadge />
          <div className="divider" />
          <p className="footer-label">Data</p>
          <button className="btn-ghost" onClick={onExport}>
            <Icon name="download" size={14} /> Export JSON
          </button>
          <label className="btn-ghost" style={{ cursor: 'pointer' }}>
            <Icon name="upload" size={14} /> Import JSON
            <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
          </label>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-icon-sm">₱</span>
          <span className="topbar-title">Budget Tracker</span>
        </div>
        <div className="topbar-right">
          <SyncBadge />
          <button className="icon-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            <Icon name="menu" size={22} />
          </button>
        </div>
      </header>

      {/* ── Mobile Dropdown Menu ── */}
      {menuOpen && (
        <div className="mobile-menu">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-btn${page === n.id ? ' active' : ''}`}
              onClick={() => { setPage(n.id); setMenuOpen(false) }}
            >
              <Icon name={n.icon} size={17} /> {n.label}
            </button>
          ))}
          <div className="mobile-menu-actions">
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { onExport(); setMenuOpen(false) }}>
              <Icon name="download" size={13} /> Export
            </button>
            <label className="btn-ghost" style={{ flex: 1, cursor: 'pointer' }}>
              <Icon name="upload" size={13} /> Import
              <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="main">{children}</main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`bottom-btn${page === n.id ? ' active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <Icon name={n.icon} size={20} />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
