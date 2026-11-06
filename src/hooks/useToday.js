import { useState, useEffect } from 'react'
import { todayStr } from '../utils/helpers'

// Local YYYY-MM-DD that re-renders when the day rolls over — the PWA can stay
// open across midnight, and iOS suspends timers in the background, so also
// re-check whenever the app comes back to the foreground.
export function useToday() {
  const [today, setToday] = useState(todayStr)

  useEffect(() => {
    const check = () => setToday(todayStr())
    const now = new Date()
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now
    const timer = setTimeout(check, msToMidnight + 1000)
    const onVisible = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', check)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', check)
    }
  }, [today])

  return today
}
