import ownership from '@migration/migration-routes.json'

export function safeInternalHref(value: unknown, fallback = '/'): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    /^\/\/|[\\\s\u0000-\u001f]/u.test(value)
  )
    return fallback
  try {
    const base = 'https://navigation.invalid'
    const url = new URL(value, base)
    if (url.origin !== base) return fallback
    // Reject encoded slash/backslash/control redirect variants after decoding too.
    const decoded = decodeURIComponent(url.pathname)
    if (/^\/\/|[\\\s\u0000-\u001f]/u.test(decoded) || /%25/i.test(url.pathname)) return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}

export function safeReturnTo(value: unknown, fallback = '/dashboard'): string {
  const destination = safeInternalHref(value, fallback)
  const pathname = decodeURIComponent(new URL(destination, 'https://navigation.invalid').pathname)
  return /^\/(login|register)(\/|$)/.test(pathname) ? fallback : destination
}

export function isNextPath(href: string): boolean {
  const path =
    new URL(safeInternalHref(href), 'https://navigation.invalid').pathname.replace(/\/$/, '') || '/'
  return (
    ownership.nextExact.includes(path) ||
    ownership.nextSingleSegment.includes(path.slice(0, path.lastIndexOf('/'))) ||
    ownership.nextPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
  )
}

export function loginHref(returnTo: string): string {
  return `/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`
}
