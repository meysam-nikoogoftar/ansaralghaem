import 'server-only'
import { isIP } from 'node:net'

export const appOrigin = new URL(process.env.SITE_URL || 'http://127.0.0.1:3000').origin
export const backendOrigin = new URL(process.env.API_ORIGIN || 'http://127.0.0.1:8000').origin
const secret = process.env.BFF_SHARED_SECRET || ''
if (process.env.NODE_ENV === 'production') {
  if (secret.length < 32) throw new Error('BFF_SHARED_SECRET must contain at least 32 characters')
  if (!appOrigin.startsWith('https:') && !(process.env.ALLOW_INSECURE_HTTP === '1' && ['127.0.0.1', 'localhost'].includes(new URL(appOrigin).hostname))) throw new Error('HTTPS SITE_URL is required in production')
}
export function backendHeaders(cookie = '', clientIp = ''): Headers {
  const headers = new Headers({ Accept: 'application/json', 'X-Bff-Key': secret, 'X-Forwarded-Proto': new URL(appOrigin).protocol === 'https:' ? 'https' : 'http' })
  const allowed = cookie.split(';').map(part => part.trim()).filter(part => /^(?:__Host-ansar_session|ansar_session|__Host-ansar_csrf|ansar_csrf)=/.test(part))
  if (allowed.length) headers.set('Cookie', allowed.join('; '))
  if (clientIp && isIP(clientIp)) headers.set('X-Bff-Client-IP', clientIp)
  return headers
}
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for') || ''
  return process.env.TRUST_PROXY_HEADERS === '1' && isIP(forwarded) ? forwarded : '127.0.0.1'
}
