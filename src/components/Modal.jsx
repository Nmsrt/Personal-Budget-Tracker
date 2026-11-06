import { useEffect, useRef } from 'react'
import { Icon } from './Icon'

// Page scroll lock without touching html/body overflow (that locks up iOS page scrolling):
// wheel/touch gestures on the backdrop itself are cancelled, and .modal-box has
// `overscroll-behavior: contain` so scrolling inside the sheet never chains to the page.
// Listeners must be non-passive to call preventDefault, so they're attached manually.
const useBackdropScrollLock = (open, backdropRef, boxRef) => {
  useEffect(() => {
    const backdrop = backdropRef.current
    if (!open || !backdrop) return
    const block = (e) => { if (!boxRef.current?.contains(e.target)) e.preventDefault() }
    backdrop.addEventListener('wheel', block, { passive: false })
    backdrop.addEventListener('touchmove', block, { passive: false })
    return () => {
      backdrop.removeEventListener('wheel', block)
      backdrop.removeEventListener('touchmove', block)
    }
  }, [open, backdropRef, boxRef])
}

// `actions` (optional) renders extra header buttons to the left of the close button.
export function Modal({ open, onClose, title, actions, children }) {
  const backdropRef = useRef(null)
  const boxRef      = useRef(null)
  useBackdropScrollLock(open, backdropRef, boxRef)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div ref={backdropRef} className="modal-backdrop" onClick={onClose}>
      <div ref={boxRef} className="modal-box" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <div className="modal-header__actions">
            {actions}
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
