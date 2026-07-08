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
 * Read the budget row once, then subscribe to realtime changes.
 * @param {(data:object)=>void} onData   — called when data exists (initial read + every remote change)
 * @param {()=>void}            onEmpty  — called when the row doesn't exist yet (first run)
 * @param {(err:Error)=>void}   onError  — called on policy / network errors
 * @returns {()=>void} unsubscribe
 */
export const subscribeToSupabase = (onData, onEmpty, onError) => {
  if (!supabase) {
    onError?.(new Error('Supabase not initialised'))
    return () => {}
  }

  let cancelled = false

  supabase
    .from('budget')
    .select('data')
    .eq('id', ROW_ID)
    .maybeSingle()
    .then(({ data: row, error }) => {
      if (cancelled) return
      if (error) return onError?.(new Error(error.message))
      if (row?.data) onData(row.data)
      else onEmpty?.()
    })

  const channel = supabase
    .channel('budget-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'budget', filter: `id=eq.${ROW_ID}` },
      (payload) => {
        if (!cancelled && payload.new?.data) onData(payload.new.data)
      }
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR' && !cancelled) {
        onError?.(err || new Error('Realtime channel error'))
      }
    })

  return () => {
    cancelled = true
    supabase.removeChannel(channel)
  }
}
