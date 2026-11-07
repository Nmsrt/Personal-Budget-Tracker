import { useState } from 'react'
import { Icon } from '../components/Icon'
import { SyncBadge } from '../components/Layout'
import { hasSupabaseConfig } from '../supabase/config'

const THEMES = [
  { id: 'system', label: 'System' },
  { id: 'light',  label: 'Light'  },
  { id: 'dark',   label: 'Dark'   },
]

// Collapsible category card: header shows icon, title and a live summary; tap to reveal the rows.
function SettingsGroup({ id, icon, title, summary, open, onToggle, danger, children }) {
  const bodyId = `settings-${id}`
  return (
    <section className={`card settings-group${open ? ' open' : ''}${danger ? ' settings-group--danger' : ''}`}>
      <button className="settings-group__head" aria-expanded={open} aria-controls={bodyId} onClick={onToggle}>
        <span className="settings-group__icon"><Icon name={icon} size={18} /></span>
        <span className="settings-group__text">
          <span className="settings-group__title">{title}</span>
          <span className="settings-group__summary">{summary}</span>
        </span>
        <Icon name="chevronDown" size={18} className="settings-group__chev" />
      </button>
      <div className="settings-group__body" id={bodyId} inert={open ? undefined : ''}>
        <div className="settings-group__inner">{children}</div>
      </div>
    </section>
  )
}

export function Settings({ settings, setSetting, data, syncStatus, onReconnect, reconnecting, onExport, onImport, onReset }) {
  const [open, setOpen] = useState(null)
  const toggle = (id) => setOpen((cur) => (cur === id ? null : id))

  const online = syncStatus === 'online'
  const syncText = !hasSupabaseConfig
    ? 'Supabase is not configured. Data is saved on this device only.'
    : reconnecting
      ? 'Reconnecting to Supabase…'
      : online
        ? 'Connected. Changes sync across your devices.'
        : "Can't reach Supabase. Changes are saved on this device for now."
  const syncSummary = !hasSupabaseConfig ? 'This device only' : reconnecting ? 'Reconnecting…' : online ? 'Online' : 'Offline'
  const themeLabel = THEMES.find((t) => t.id === settings.theme)?.label ?? 'System'

  return (
    <div className="page-enter settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Preferences are saved on this device</p>
        </div>
      </div>

      <SettingsGroup id="appearance" icon="sun" title="Appearance" summary={`${themeLabel} theme`}
        open={open === 'appearance'} onToggle={() => toggle('appearance')}>
        <div className="setting-row">
          <div className="setting-row__text">
            <div className="setting-row__label">Theme</div>
            <div className="setting-row__hint">System follows your phone's light/dark setting</div>
          </div>
          <div className="segmented" role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => (
              <button
                key={t.id}
                role="radio"
                aria-checked={settings.theme === t.id}
                className={`segmented__btn${settings.theme === t.id ? ' active' : ''}`}
                onClick={() => setSetting('theme', t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup id="sync" icon={online ? 'cloud' : 'cloudOff'} title="Sync" summary={syncSummary}
        open={open === 'sync'} onToggle={() => toggle('sync')}>
        <div className="setting-row">
          <div className="setting-row__text">
            <div className="setting-row__label">Cloud sync</div>
            <div className="setting-row__hint">{syncText}</div>
          </div>
          <SyncBadge status={syncStatus} />
        </div>
        {hasSupabaseConfig && (
          <div className="setting-row">
            <div className="setting-row__text">
              <div className="setting-row__label">Reconnect</div>
              <div className="setting-row__hint">
                Reload from Supabase and restart live sync. Unsynced changes on this device are uploaded first.
              </div>
            </div>
            <button className="btn-secondary setting-row__control" onClick={onReconnect} disabled={reconnecting}>
              <Icon name="refresh" size={15} className={reconnecting ? 'spin' : undefined} />
              {reconnecting ? 'Reconnecting…' : 'Reconnect'}
            </button>
          </div>
        )}
      </SettingsGroup>

      <SettingsGroup id="data" icon="database" title="Data" summary="Export or import a backup"
        open={open === 'data'} onToggle={() => toggle('data')}>
        <div className="setting-row">
          <div className="setting-row__text">
            <div className="setting-row__label">Export backup</div>
            <div className="setting-row__hint">
              Download a JSON file with {data.accounts.length} accounts and {data.expenses.length} expenses
            </div>
          </div>
          <button className="btn-secondary setting-row__control" onClick={onExport}>
            <Icon name="download" size={15} /> Export
          </button>
        </div>
        <div className="setting-row">
          <div className="setting-row__text">
            <div className="setting-row__label">Import backup</div>
            <div className="setting-row__hint">Replace all data with a JSON backup file</div>
          </div>
          <label className="btn-secondary setting-row__control" style={{ cursor: 'pointer' }}>
            <Icon name="upload" size={15} /> Import
            <input type="file" accept=".json,application/json" onChange={onImport} style={{ display: 'none' }} />
          </label>
        </div>
      </SettingsGroup>

      <SettingsGroup id="danger" icon="alert" title="Danger Zone" summary="Reset all data" danger
        open={open === 'danger'} onToggle={() => toggle('danger')}>
        <div className="setting-row">
          <div className="setting-row__text">
            <div className="setting-row__label">Reset all data</div>
            <div className="setting-row__hint">
              Delete every expense and restore the default accounts
              {hasSupabaseConfig ? ', here and in the cloud' : ''}. Export a backup first.
            </div>
          </div>
          <button className="btn-danger setting-row__control" onClick={onReset}>
            <Icon name="trash" size={15} /> Reset
          </button>
        </div>
      </SettingsGroup>
    </div>
  )
}
