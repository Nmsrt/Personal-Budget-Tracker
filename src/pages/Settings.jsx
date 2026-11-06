import { Icon } from '../components/Icon'
import { SyncBadge } from '../components/Layout'
import { hasSupabaseConfig } from '../supabase/config'

const THEMES = [
  { id: 'system', label: 'System' },
  { id: 'light',  label: 'Light'  },
  { id: 'dark',   label: 'Dark'   },
]

export function Settings({ settings, setSetting, data, syncStatus, onExport, onImport, onReset }) {
  const online = syncStatus === 'online'
  const syncText = !hasSupabaseConfig
    ? 'Supabase is not configured. Data is saved on this device only.'
    : online
      ? 'Connected. Changes sync across your devices.'
      : "Can't reach Supabase. Changes are saved on this device for now."

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Preferences are saved on this device</p>
        </div>
      </div>

      {/* Appearance */}
      <section className="settings-section">
        <h2 className="settings-section__title">Appearance</h2>
        <div className="card settings-card">
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
        </div>
      </section>

      {/* Sync */}
      <section className="settings-section">
        <h2 className="settings-section__title">Sync</h2>
        <div className="card settings-card">
          <div className="setting-row">
            <div className="setting-row__text">
              <div className="setting-row__label">Cloud sync</div>
              <div className="setting-row__hint">{syncText}</div>
            </div>
            <SyncBadge status={syncStatus} />
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="settings-section">
        <h2 className="settings-section__title">Data</h2>
        <div className="card settings-card">
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
        </div>
      </section>

      {/* Danger zone */}
      <section className="settings-section">
        <h2 className="settings-section__title settings-section__title--danger">Danger Zone</h2>
        <div className="card settings-card settings-card--danger">
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
        </div>
      </section>
    </div>
  )
}
