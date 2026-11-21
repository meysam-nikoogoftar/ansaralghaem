import { useCallback, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import useDialog from '../hooks/useDialog'

export default function Dialog({ className, children, onClose, label, returnFocus }) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  useLayoutEffect(() => { closeRef.current = onClose }, [onClose])
  const close = useCallback(() => closeRef.current(), [])
  useDialog(ref, true, close, returnFocus)
  return createPortal(<div className={className} onClick={close}>
    <div ref={ref} className="dialog-surface" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} onClick={event => event.stopPropagation()}>{children}</div>
  </div>, document.body)
}
