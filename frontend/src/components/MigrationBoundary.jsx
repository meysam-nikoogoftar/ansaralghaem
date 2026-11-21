import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isNextPath } from '../utils/migrationRoutes'
import { safeReturnTo } from '../utils/navigation'

// Capture before React Router's click handlers. Leave modified clicks to the browser.
export default function MigrationBoundary() {
  const location = useLocation()
  useEffect(() => {
    if (!isNextPath(location.pathname)) return
    const query = new URLSearchParams(location.search)
    if (['/login', '/register'].includes(location.pathname) && !query.has('returnTo') && location.state?.returnTo) {
      query.set('returnTo', safeReturnTo(location.state.returnTo))
    }
    const search = query.toString()
    window.location.replace(location.pathname + (search ? `?${search}` : '') + location.hash)
  }, [location])
  useEffect(() => {
    const navigate = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return
      const url = new URL(link.href, window.location.origin)
      if (url.origin !== window.location.origin || !isNextPath(url.pathname)) return
      event.preventDefault(); event.stopPropagation()
      window.location.assign(url.href)
    }
    document.addEventListener('click', navigate, true)
    return () => document.removeEventListener('click', navigate, true)
  }, [])
  return null
}

export function MigrationRedirect() {
  return <p role="status">در حال انتقال به صفحهٔ حساب کاربری…</p>
}
