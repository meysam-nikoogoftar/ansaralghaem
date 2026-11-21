import { useEffect } from 'react'

const selector = 'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])'

export default function useDialog(ref, open, onClose, returnFocus) {
  useEffect(() => {
    if (!open || !ref.current) return
    const dialog = ref.current
    const opener = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const previousInert = []
    for (let branch = dialog; branch.parentElement && branch !== document.body; branch = branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch) { previousInert.push([sibling, sibling.inert]); sibling.setAttribute('inert', '') }
      }
    }
    const focusable = () => [...dialog.querySelectorAll(selector)].filter(el => el.getClientRects().length && !el.closest('[inert]'))
    ;(focusable()[0] || dialog).focus()
    const handleKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose() }
      if (event.key !== 'Tab') return
      const items = focusable()
      const index = items.indexOf(document.activeElement)
      if (!items.length) { event.preventDefault(); dialog.focus(); return }
      if (event.shiftKey && index <= 0) { event.preventDefault(); items.at(-1).focus() }
      else if (!event.shiftKey && (index === items.length - 1 || index < 0)) { event.preventDefault(); items[0].focus() }
    }
    const keepFocus = event => { if (!dialog.contains(event.target)) (focusable()[0] || dialog).focus() }
    document.addEventListener('keydown', handleKey, true)
    document.addEventListener('focusin', keepFocus)
    return () => {
      document.body.style.overflow = previousOverflow
      previousInert.forEach(([element, inert]) => { if (!inert) element.removeAttribute('inert') })
      document.removeEventListener('keydown', handleKey, true)
      document.removeEventListener('focusin', keepFocus)
      const destination = returnFocus ? document.querySelector(returnFocus) : opener
      if (destination?.isConnected) destination.focus()
    }
  }, [ref, open, onClose, returnFocus])
}
