'use client'
import { useEffect, useRef, type ReactNode } from 'react'

export default function Dialog({
  children,
  label,
  onClose,
  className = '',
  returnFocus,
}: {
  children: ReactNode
  label: string
  onClose: () => void
  className?: string
  returnFocus?: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  }, [onClose])
  useEffect(() => {
    const element = dialog.current
    const opener = returnFocus ? document.querySelector(returnFocus) : document.activeElement
    const overflow = document.body.style.overflow
    element?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = overflow
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [returnFocus])
  return (
    <dialog
      ref={dialog}
      className={className}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault()
        close.current()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close.current()
      }}
    >
      {children}
    </dialog>
  )
}
