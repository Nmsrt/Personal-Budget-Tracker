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
  // Bumped by reconnect() to tear down and redo the Supabase read + realtime subscription
  const [connId, setConnId] = useState(0)
  const [reconnecting, setReconnecting] = useState(false)
  // Prevents echoing Supabase's own updates back to Supabase
  const skipNextWrite = useRef(false)
  // Local changes that failed to reach Supabase; on reconnect they're pushed instead of overwritten
  const dirty     = useRef(false)
  const syncedRef = useRef(false)
  const dataRef   = useRef(data)
  dataRef.current = data

  const pushLocal = useCallback(() => {
    saveToSupabase(dataRef.current)
      .then(() => { dirty.current = false; setOnline(true) })
      .catch((err) => {
        console.warn('[Supabase] Save error:', err.message)
        dirty.current = true
        setOnline(false)
      })
  }, [])

  // ── Subscribe to Supabase ─────────────────────────────────────────────────
  useEffect(() => {
    if (!hasSupabaseConfig) {
      // No Supabase — just use localStorage, mark as ready immediately
      syncedRef.current = true
      setSynced(true)
      setOnline(false)
      return
    }

    let initial = true   // the first onData is the initial read; later ones are realtime events
    const done = () => {
      initial = false
      syncedRef.current = true
      setSynced(true)
      setReconnecting(false)
    }

    const unsub = subscribeToSupabase(
      // Remote data received — update local state
      (remoteData) => {
        if (initial && dirty.current) {
          // Reconnecting with unsynced local edits: keep them and push them up
          done()
          pushLocal()
          return
        }
        if (initial) done()
        skipNextWrite.current = true
        setData(remoteData)
        saveLocal(remoteData)
        setOnline(true)
      },
      // Row is empty (fresh database) — push local data up
      () => {
        const wasSynced = syncedRef.current
        done()
        setOnline(true)
        // First load: the persist effect pushes local → Supabase once `synced` flips.
        // On reconnect `synced` is already true, so push explicitly.
        if (wasSynced) pushLocal()
      },
      // Error (bad policy, network down, etc.)
      (err) => {
        console.warn('[Supabase] Subscribe error:', err.message)
        done()            // unblock so localStorage still saves
        setOnline(false)
      }
    )

    // Don't leave the Reconnect button spinning if the read never answers
    const timer = setTimeout(() => { if (initial) { done(); setOnline(false) } }, 15000)

    return () => { clearTimeout(timer); unsub() }
  }, [connId, pushLocal])

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
    if (hasSupabaseConfig) pushLocal()
  }, [data, synced]) // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback((fn) => setData((prev) => fn(prev)), [])

  const reconnect = useCallback(() => {
    if (!hasSupabaseConfig) return
    setReconnecting(true)
    setConnId((n) => n + 1)
  }, [])

  const syncStatus = online ? 'online' : 'offline'

  return { data, update, synced, syncStatus, reconnect, reconnecting }
}
