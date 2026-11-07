import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Single source of truth for "is Supabase configured" — useBudget imports this.
export const hasSupabaseConfig = !!(url && key && !url.includes('your_project_ref') && key !== 'your_anon_key_here')

// Safely initialise — if env vars are missing, client stays null and
// the app falls back to localStorage automatically.
let supabase = null
try {
  if (hasSupabaseConfig) supabase = createClient(url, key)
} catch (err) {
  console.warn('[Supabase] Init failed:', err.message)
}

export { supabase }

// The whole budget object lives in one JSONB row (id = 1) of the `budget` table.
const ROW_ID = 1

/** Write entire budget object to the single budget row */
export const saveToSupabase = async (data) => {
  if (!supabase) throw new Error('Supabase not initialised')
  const { error } = await supabase
    .from('budget')
    .upsert({ id: ROW_ID, data, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
}

/**
 * Read the budget row once, then subscribe to realtime changes. The read and the realtime stream
 * report through separate callbacks so the caller can tell the initial snapshot from live updates.
 * @param {object} h
 * @param {(data:object|null)=>void} h.onRead      — initial read finished; null when the row doesn't exist yet
 * @param {(err:Error)=>void}        h.onReadError — initial read failed (bad policy, network down, etc.)
 * @param {(data:object)=>void}      h.onChange    — realtime change to the row (including echoes of our own writes)
 * @param {(ok:boolean)=>void}       h.onStatus    — realtime channel joined (true) or errored / timed out (false);
 *                                                   supabase-js rejoins on its own, so true can follow false
 * @returns {()=>void} unsubscribe
 */
export const subscribeToSupabase = ({ onRead, onReadError, onChange, onStatus }) => {
  if (!supabase) {
    onReadError(new Error('Supabase not initialised'))
    return () => {}
  }

  let cancelled = false

  supabase
    .from('budget')
    .select('data')
    .eq('id', ROW_ID)
    .maybeSingle()
    .then(
      ({ data: row, error }) => {
        if (cancelled) return
        if (error) onReadError(new Error(error.message))
        else onRead(row?.data ?? null)
      },
      (err) => { if (!cancelled) onReadError(err) }
    )

  const channel = supabase
    // Unique topic per subscription: reconnecting creates a new channel while the old one is still closing
    .channel(`budget-sync-${Date.now()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'budget', filter: `id=eq.${ROW_ID}` },
      (payload) => {
        if (!cancelled && payload.new?.data) onChange(payload.new.data)
      }
    )
    .subscribe((status, err) => {
      if (cancelled) return
      if (status === 'SUBSCRIBED') onStatus(true)
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn('[Supabase] Realtime', status, err?.message || '')
        onStatus(false)
      }
    })

  return () => {
    cancelled = true
    supabase.removeChannel(channel)
  }
}
