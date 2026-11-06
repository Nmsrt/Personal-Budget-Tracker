import { useState, useEffect, useCallback } from 'react'

// Per-device preferences. Kept separate from budget data on purpose:
// not synced to Supabase and not part of export/import.
// index.html reads `theme` from this key before first paint to avoid a flash.
const SETTINGS_KEY = 'budgetapp_settings'

export const DEFAULT_SETTINGS = {
  theme:        'system',   // 'system' | 'light' | 'dark'
  hideBalances: false,      // eye toggle on the Dashboard hero
}

// Status-bar / browser chrome color = top of the background gradient (--bg-top in global.css)
const THEME_COLOR = { light: '#d4f5e6', dark: '#10241b' }

// Per-key validators: a stored value that fails (bad/old format) falls back to the default
const VALID = {
  theme:        (v) => v === 'system' || v === 'light' || v === 'dark',
  hideBalances: (v) => typeof v === 'boolean',
}

// Only known, valid keys are kept, so removed or malformed settings don't linger in storage
const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
    return Object.fromEntries(
      Object.keys(DEFAULT_SETTINGS).map((k) => [k, VALID[k](saved[k]) ? saved[k] : DEFAULT_SETTINGS[k]])
    )
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(load)

  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'light' || settings.theme === 'dark') root.dataset.theme = settings.theme
    else delete root.dataset.theme
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch { /* private mode */ }
  }, [settings])

  // Keep <meta name="theme-color"> matched to the effective theme (follows OS changes in 'system')
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && mq.matches)
      meta.setAttribute('content', THEME_COLOR[dark ? 'dark' : 'light'])
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [settings.theme])

  const setSetting = useCallback((key, value) => setSettings((p) => ({ ...p, [key]: value })), [])

  return { settings, setSetting }
}
