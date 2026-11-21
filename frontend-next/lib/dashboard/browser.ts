import { browserRequest, requireLogin } from '@/lib/api/browser'
import { ApiError, fieldErrors } from '@/lib/api/errors'

export async function dashboardRequest<T>(
  path: string,
  decode: (value: unknown) => T,
  body?: unknown,
  method?: 'PUT',
) {
  try {
    return await browserRequest(path, decode, {
      authenticated: true,
      body,
      method: method ?? (body === undefined ? 'GET' : 'POST'),
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) requireLogin()
    throw error
  }
}

export function dashboardError(error: unknown, fallback: string) {
  const errors = fieldErrors(error)
  return errors.error || errors.detail || fallback
}

export function discardResponse(_value: unknown): null {
  return null
}
