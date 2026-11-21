import { NextResponse, type NextRequest } from 'next/server'
import { backendHeaders, backendOrigin } from '@/lib/server/config'
import { sessionSchema } from '@/lib/contracts'
import { loginHref } from '@/lib/navigation'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (/^\/media\/(national_cards|student_cards|passports|commitments)\//.test(pathname)) {
    const headers = new Headers({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' })
    if (request.method !== 'GET' && request.method !== 'HEAD') return new NextResponse(null, { status: 405, headers })
    try {
      const response = await fetch(new URL(pathname, backendOrigin), {
        method: request.method,
        headers: backendHeaders(request.headers.get('cookie') || ''),
        redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) return new NextResponse(null, { status: response.status, headers })
      for (const name of ['content-type', 'content-disposition']) {
        const value = response.headers.get(name)
        if (value) headers.set(name, value)
      }
      return new NextResponse(response.body, { headers })
    } catch {
      return new NextResponse(null, { status: 503, headers })
    }
  }
  const privatePath = /^\/(dashboard|admin)(\/|$)/.test(request.nextUrl.pathname)
  if (privatePath) {
    const cookie = request.headers.get('cookie') || ''
    let user = null
    try {
      if (/(?:^|;\s*)(?:__Host-ansar_session|ansar_session)=/.test(cookie)) {
        const result = await fetch(`${backendOrigin}/api/accounts/session/`, { headers: backendHeaders(cookie), cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000) })
        if (result.status !== 401) {
          if (!result.ok) throw new Error('Session unavailable')
          user = sessionSchema.parse(await result.json()).user
        }
      }
    } catch {
      return new NextResponse('بررسی ورود موقتاً در دسترس نیست. دوباره تلاش کنید.', { status: 503, headers: { 'Cache-Control': 'private, no-store', 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '5' } })
    }
    if (!user || (request.nextUrl.pathname.startsWith('/admin') && user.user_type === 'user')) {
      const response = NextResponse.redirect(new URL(user ? '/dashboard' : loginHref(request.nextUrl.pathname + request.nextUrl.search), request.url))
      response.headers.set('Cache-Control', 'private, no-store')
      return response
    }
  }
  const nonce = btoa(crypto.randomUUID())
  const development = process.env.NODE_ENV === 'development'
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${development ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${development ? ' ws://127.0.0.1:* ws://localhost:*' : ''}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
  ].join('; ')
  const headers = new Headers(request.headers)
  headers.set('x-nonce', nonce)
  headers.set('Content-Security-Policy', policy)
  const response = NextResponse.next({ request: { headers } })
  response.headers.set('Content-Security-Policy', policy)
  // Nonces are per request. Never publicly cache the HTML/RSC response itself.
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
export const config = { matcher: ['/', '/shop/:path*', '/track', '/news/:path*', '/articles/:path*', '/gallery/:path*', '/login', '/register', '/migration', '/dashboard/:path*', '/admin/:path*', '/media/:path*'] }
