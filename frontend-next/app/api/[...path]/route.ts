import { NextResponse, type NextRequest } from 'next/server'
import { authSchema, sessionSchema } from '@/lib/contracts'
import { appOrigin, backendOrigin, backendHeaders, clientIp } from '@/lib/server/config'

export const dynamic = 'force-dynamic'
const reads = new Set(['GET', 'HEAD'])
const fail = (detail: string, status: number) => NextResponse.json({ detail }, { status, headers: { 'Cache-Control': 'private, no-store' } })

async function readBody(request: NextRequest): Promise<ArrayBuffer | undefined> {
  if (!request.body) return undefined
  const limit = request.headers.get('content-type')?.startsWith('multipart/form-data') ? 20 * 1024 * 1024 : 1024 * 1024
  if (Number(request.headers.get('content-length') || 0) > limit) throw new RangeError('Request too large')
  const reader = request.body.getReader(), chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > limit) { await reader.cancel(); throw new RangeError('Request too large') }
    chunks.push(value)
  }
  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength }
  return body.buffer
}

async function handle(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path
  if (!parts.length || parts.some(part => !/^[a-zA-Z0-9_-]+$/.test(part)) || request.nextUrl.search.length > 8192) return fail('Invalid API path.', 400)
  const path = '/' + parts.join('/') + '/'
  if (path.startsWith('/accounts/token/')) return fail('Token endpoints have been retired.', 410)
  if (!reads.has(request.method)) {
    if (request.headers.get('origin') !== appOrigin || request.headers.get('sec-fetch-site') === 'cross-site') return fail('Cross-site requests are not allowed.', 403)
    if (!request.headers.get('x-csrftoken')) return fail('CSRF token required.', 403)
    if (!/^(application\/json|multipart\/form-data|application\/x-www-form-urlencoded)(;|$)/i.test(request.headers.get('content-type') || '')) return fail('Unsupported content type.', 415)
  }
  const headers = backendHeaders(request.headers.get('cookie') || '', clientIp(request.headers))
  for (const key of ['content-type', 'x-csrftoken']) { const value = request.headers.get(key); if (value) headers.set(key, value) }
  headers.set('Origin', appOrigin)
  headers.set('Referer', appOrigin + '/')
  try {
    const upstream = await fetch(`${backendOrigin}/api${path}${request.nextUrl.search}`, { method: request.method, headers, body: reads.has(request.method) ? undefined : await readBody(request), redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(15_000) })
    if (upstream.status >= 300 && upstream.status < 400) return fail('Unexpected upstream redirect.', 502)
    const responseHeaders = new Headers({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Vary': 'Cookie' })
    for (const key of ['content-type', 'content-disposition', 'retry-after']) { const value = upstream.headers.get(key); if (value) responseHeaders.set(key, value) }
    for (const cookie of upstream.headers.getSetCookie()) {
      if (/^(?:__Host-ansar_session|ansar_session|__Host-ansar_csrf|ansar_csrf)=/.test(cookie)) responseHeaders.append('Set-Cookie', cookie)
    }
    if (upstream.ok && ['/accounts/login/', '/accounts/register/', '/accounts/session/', '/accounts/logout/'].includes(path)) {
      const schema = path === '/accounts/login/' || path === '/accounts/register/' ? authSchema : sessionSchema
      const data = schema.parse(await upstream.json())
      return NextResponse.json(data, { status: upstream.status, headers: responseHeaders })
    }
    return new Response(request.method === 'HEAD' || upstream.status === 204 ? null : upstream.body, { status: upstream.status, headers: responseHeaders })
  } catch (error) {
    return fail(error instanceof RangeError ? 'Request too large.' : 'سرویس موقتاً در دسترس نیست.', error instanceof RangeError ? 413 : 502)
  }
}
export { handle as GET, handle as HEAD, handle as POST, handle as PUT, handle as PATCH, handle as DELETE }
