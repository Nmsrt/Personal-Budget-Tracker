import { useEffect } from 'react'

// Single-slot toast: { message, actionLabel?, onAction? }. Auto-dismisses.
export function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, toast.onAction ? 6000 : 3000)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  if (!toast) return null

  return (
    <div className="toast" role="status">
      <span>{toast.message}</span>
      {toast.onAction && (
        <button className="toast__action" onClick={() => { toast.onAction(); onDismiss() }}>
          {toast.actionLabel || 'Undo'}
        </button>
      )}
    </div>
  )
}
