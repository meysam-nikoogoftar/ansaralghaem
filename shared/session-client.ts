export const SESSION_EVENT = 'ansar:session-changed'
let csrfToken = ''
let pending: Promise<unknown> | null = null
export function clearLegacyTokens() {
  try { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token') } catch { /* Storage is optional. */ }
}
export function setCsrfToken(value: unknown) {
  if (typeof value === 'string' && /^[a-zA-Z0-9]{32,256}$/.test(value)) csrfToken = value
}
export function invalidateCsrf() { csrfToken = '' }
export async function readSession(): Promise<unknown> {
  if (pending) return pending
  pending = (async () => {
    const response = await fetch('/api/accounts/session/', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error('Session unavailable')
    const data: unknown = await response.json()
    if (data && typeof data === 'object' && 'csrfToken' in data) setCsrfToken(data.csrfToken)
    return data
  })().finally(() => { pending = null })
  return pending
}
export async function getCsrfToken() { if (!csrfToken) await readSession(); return csrfToken }
export function announceSessionChange() {
  clearLegacyTokens()
  try { const channel = new BroadcastChannel('ansar-session'); channel.postMessage('changed'); channel.close() } catch { /* Optional browser feature. */ }
  try { localStorage.setItem('ansar_session_revision', crypto.randomUUID()) } catch { /* No credentials are stored. */ }
}
export function notifySessionExpired() { invalidateCsrf(); window.dispatchEvent(new Event(SESSION_EVENT)) }
export function subscribeSessionChange(listener: () => void) {
  const sync = () => { invalidateCsrf(); listener() }
  const storage = (event: StorageEvent) => { if (event.key === 'ansar_session_revision' || event.key === null) sync() }
  let channel: BroadcastChannel | undefined
  try { channel = new BroadcastChannel('ansar-session'); channel.onmessage = sync } catch { /* Optional browser feature. */ }
  window.addEventListener(SESSION_EVENT, sync); window.addEventListener('storage', storage)
  return () => { channel?.close(); window.removeEventListener(SESSION_EVENT, sync); window.removeEventListener('storage', storage) }
}
