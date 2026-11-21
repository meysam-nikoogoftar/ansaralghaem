import { ApiError } from './errors'
import { loginHref } from '@/lib/navigation'
import { getCsrfToken, invalidateCsrf, notifySessionExpired, setCsrfToken } from '@migration/session-client'
import type { RequestDecoder } from '@/types'

export interface BrowserRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  authenticated?: boolean
  signal?: AbortSignal
  responseType?: 'blob'
}

export async function browserRequest<T>(path: string, decode: RequestDecoder<T>, options: BrowserRequestOptions = {}): Promise<T> {
  if (!/^\/[a-z][a-z0-9/-]*(?:\?[^#]*)?$/i.test(path) || path.includes('..')) throw new Error('Invalid API path')
  const method = options.method || 'GET'
  const mutation = method !== 'GET'
  const isForm = options.body instanceof FormData
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(`/api${path}`, {
      method, credentials: 'same-origin', cache: 'no-store',
      headers: {
        ...(!isForm && options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(mutation ? { 'X-CSRFToken': await getCsrfToken() } : {}),
      },
      body: options.body === undefined ? undefined : isForm ? options.body as FormData : JSON.stringify(options.body),
      signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
    })
    if (response.ok && options.responseType === 'blob') return decode(await response.blob())
    const data: unknown = response.status === 204 ? null : await response.json().catch(() => null)
    if (response.status === 403 && attempt === 0 && data && typeof data === 'object' && 'code' in data && data.code === 'csrf_failed') { invalidateCsrf(); continue }
    if (!response.ok) {
      if (response.status === 401 && options.authenticated) notifySessionExpired()
      throw new ApiError(response.status, data)
    }
    if (data && typeof data === 'object' && 'csrfToken' in data) setCsrfToken(data.csrfToken)
    return decode(data)
  }
  throw new ApiError(403)
}
export function requireLogin(): void { window.location.assign(loginHref(window.location.pathname + window.location.search + window.location.hash)) }
