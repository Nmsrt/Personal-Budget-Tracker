import { useState, useEffect, useCallback, useRef } from 'react'
import { hasSupabaseConfig, saveToSupabase, subscribeToSupabase } from '../supabase/config'
import { INIT_DATA } from '../utils/constants'

const LOCAL_KEY = 'budgetapp_v3'

const loadLocal = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) } catch { return null }
}
const saveLocal = (d) => localStorage.setItem(LOCAL_KEY, JSON.stringify(d))

export function useBudget() {
  const [data, setData]     = useState(() => loadLocal() || INIT_DATA)
  const [synced, setSynced] = useState(false)
  const [online, setOnline] = useState(false)
  // Prevents echoing Supabase's own updates back to Supabase
  const skipNextWrite = useRef(false)

  // ── Subscribe to Supabase ─────────────────────────────────────────────────
  useEffect(() => {
    if (!hasSupabaseConfig) {
      // No Supabase — just use localStorage, mark as ready immediately
      setSynced(true)
      setOnline(false)
      return
    }

    const unsub = subscribeToSupabase(
      // Remote data received — update local state
      (remoteData) => {
        skipNextWrite.current = true
        setData(remoteData)
        saveLocal(remoteData)
        setSynced(true)
        setOnline(true)
      },
      // Row is empty (fresh database) — push local data up
      () => {
        setSynced(true)
        setOnline(true)
        // skipNextWrite stays false so the write effect will push local → Supabase
      },
      // Error (bad policy, network down, etc.)
      (err) => {
        console.warn('[Supabase] Subscribe error:', err.message)
        setSynced(true)   // unblock so localStorage still saves
        setOnline(false)
      }
    )

    return () => unsub()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist on every data change ─────────────────────────────────────────
  useEffect(() => {
    // Wait until we've done the initial Supabase read / check
    if (!synced) return

    // This update came from Supabase — don't echo it back
    if (skipNextWrite.current) {
      skipNextWrite.current = false
      return
    }

    // Always save locally first (instant, safe)
    saveLocal(data)

    // Then try Supabase if configured
    if (hasSupabaseConfig) {
      saveToSupabase(data).catch((err) => {
        console.warn('[Supabase] Save error:', err.message)
        setOnline(false)
      })
    }
  }, [data, synced]) // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback((fn) => setData((prev) => fn(prev)), [])

  const syncStatus = online ? 'online' : 'offline'

  return { data, update, synced, syncStatus }
}
