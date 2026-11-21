export function safeReturnTo(value, fallback = '/dashboard') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || [...value].some(char => char.charCodeAt(0) <= 32)) return fallback
  try {
    const url = new URL(value, window.location.origin)
    if (url.origin !== window.location.origin || /^\/(login|register)(\/|$)/.test(url.pathname)) return fallback
    return url.pathname + url.search + url.hash
  } catch { return fallback }
}

export function loginDestination() {
  return { returnTo: window.location.pathname + window.location.search + window.location.hash }
}
