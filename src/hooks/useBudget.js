import { useState, useEffect, useCallback, useRef } from 'react'
import { hasSupabaseConfig, saveToSupabase, subscribeToSupabase } from '../supabase/config'
import { INIT_DATA } from '../utils/constants'

const LOCAL_KEY = 'budgetapp_v3'
// Set while local changes haven't been confirmed by Supabase; kept in localStorage so a reload
// (or closing the PWA while offline) doesn't forget them and let the next read overwrite them.
const DIRTY_KEY = 'budgetapp_dirty'

const loadLocal = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) } catch { return null }
}
const saveLocal = (d) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(d)) } catch { /* storage full / blocked */ }
}
const loadDirty = () => {
  try { return localStorage.getItem(DIRTY_KEY) === '1' } catch { return false }
}
const saveDirty = (v) => {
  try { v ? localStorage.setItem(DIRTY_KEY, '1') : localStorage.removeItem(DIRTY_KEY) } catch { /* ignore */ }
}

export function useBudget() {
  const [data, setData]     = useState(() => loadLocal() || INIT_DATA)
  const [online, setOnline] = useState(false)
  // Bumped by reconnect() to tear down and redo the Supabase read + realtime subscription
  const [connId, setConnId] = useState(0)
  const [reconnecting, setReconnecting] = useState(false)

  // The object last saved locally or received from Supabase. The persist effect skips it, so remote
  // updates aren't echoed back to Supabase and the mount run isn't treated as an edit.
  const persisted = useRef(data)
  // An initial Supabase read has succeeded. Until then edits stay local and are marked dirty;
  // nothing is written to Supabase before we've seen what's there.
  const remoteReady = useRef(false)
  // Unconfirmed local changes. While set, incoming remote data never replaces local data — local is pushed instead.
  const dirty = useRef(loadDirty())
  const setDirty = useCallback((v) => { dirty.current = v; saveDirty(v) }, [])
  // Only the newest save may settle dirty/online; inflight > 0 means one of our saves is pending
  const saveSeq  = useRef(0)
  const inflight = useRef(0)
  const dataRef  = useRef(data)
  dataRef.current = data

  const pushLocal = useCallback(() => {
    const seq = ++saveSeq.current
    inflight.current++
    setDirty(true)   // until this save is confirmed, so a reload mid-save still re-pushes
    saveToSupabase(dataRef.current)
      .then(
        () => { if (seq === saveSeq.current) { setDirty(false); setOnline(true) } },
        (err) => {
          console.warn('[Supabase] Save error:', err.message)
          if (seq === saveSeq.current) setOnline(false)   // dirty stays set
        }
      )
      .finally(() => { inflight.current-- })
  }, [setDirty])

  // ── Subscribe to Supabase ─────────────────────────────────────────────────
  useEffect(() => {
    if (!hasSupabaseConfig) {
      // No Supabase — localStorage only
      setOnline(false)
      return
    }

    // Per connection: has the initial snapshot (read, or an earlier realtime change) been handled?
    let readDone = false
    const finishRead = () => {
      readDone = true
      remoteReady.current = true
      setReconnecting(false)
    }
    const readFailed = () => {
      setOnline(false)
      setReconnecting(false)
    }

    const receive = (remote) => {
      if (inflight.current > 0) return     // our pending save supersedes it (and this may be its echo)
      if (dirty.current) return pushLocal() // keep unsynced local edits and upload them
      persisted.current = remote
      saveLocal(remote)
      setData(remote)
      setOnline(true)
    }

    const unsub = subscribeToSupabase({
      onRead: (remote) => {
        if (readDone) return   // a realtime change already arrived, and it's newer than this snapshot
        finishRead()
        if (remote === null) pushLocal()   // fresh database: seed it with local data
        else receive(remote)
      },
      onReadError: (err) => {
        console.warn('[Supabase] Read error:', err.message)
        if (!readDone) readFailed()
      },
      onChange: (remote) => {
        if (!readDone) finishRead()
        receive(remote)
      },
      onStatus: (ok) => {
        if (!ok) return setOnline(false)
        if (!readDone) return   // the initial read decides
        // Channel (re)joined: upload anything that failed while it was down, else we're back online
        if (dirty.current) { if (inflight.current === 0) pushLocal() }
        else setOnline(true)
      },
    })

    // Don't leave the Reconnect button spinning if the read never answers. Only the UI is unblocked:
    // Supabase writes still wait for a successful read, and a late read is handled normally.
    const timer = setTimeout(() => { if (!readDone) readFailed() }, 15000)

    return () => { clearTimeout(timer); unsub() }
  }, [connId, pushLocal])

  // ── Persist on every data change ─────────────────────────────────────────
  useEffect(() => {
    if (data === persisted.current) return   // unchanged, or it came from Supabase
    persisted.current = data

    // Always save locally first (instant, safe)
    saveLocal(data)
    if (!hasSupabaseConfig) return

    if (remoteReady.current) pushLocal()
    else setDirty(true)   // pushed once the initial read succeeds
  }, [data, pushLocal, setDirty])

  const update = useCallback((fn) => setData((prev) => fn(prev)), [])

  const reconnect = useCallback(() => {
    if (!hasSupabaseConfig) return
    setReconnecting(true)
    setConnId((n) => n + 1)
  }, [])

  const syncStatus = online ? 'online' : 'offline'

  return { data, update, syncStatus, reconnect, reconnecting }
}
