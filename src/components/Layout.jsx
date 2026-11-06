import { Icon } from './Icon'

// Overview first (default landing page), then daily logging, settings
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'expenses',  label: 'Expenses',  icon: 'list'      },
  { id: 'settings',  label: 'Settings',  icon: 'settings'  },
]

// Shared with the Settings page
export function SyncBadge({ status }) {
  const online = status === 'online'
  return (
    // Dot only; the status text stays available to screen readers and as a hover tooltip
    <span
      className={`sync-badge ${online ? 'sync--online' : 'sync--offline'}`}
      role="status"
      aria-label={online ? 'Online' : 'Offline'}
      title={online ? 'Online' : 'Offline'}
    >
      <span className="sync-dot" />
    </span>
  )
}

export function Layout({ page, setPage, syncStatus, children }) {

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
          <SyncBadge status={syncStatus} />
        </div>
      </aside>

      {/* ── Mobile Top Bar (dark slab — sits under the iOS status bar) ── */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-icon-sm">₱</span>
          <span className="topbar-title">Budget Tracker</span>
        </div>
        <SyncBadge status={syncStatus} />
      </header>

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
