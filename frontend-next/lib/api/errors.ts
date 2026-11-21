import type { FieldErrors } from '@/types'

export class SessionStorageError extends Error {
  constructor() {
    super('ذخیرهٔ نشست در مرورگر انجام نشد. دسترسی ذخیره‌سازی این سایت را بررسی کنید.')
    this.name = 'SessionStorageError'
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: unknown = null,
  ) {
    super(
      status === 401
        ? 'برای ادامه وارد حساب شوید.'
        : 'دریافت یا ذخیرهٔ اطلاعات انجام نشد. دوباره تلاش کنید.',
    )
    this.name = 'ApiError'
  }
}

export function fieldErrors(error: unknown): FieldErrors {
  const data = error instanceof ApiError ? error.data : null
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
  return Object.fromEntries(
    Object.entries(data).flatMap(([key, value]) => {
      const messages = (Array.isArray(value) ? value : [value]).filter(
        (item): item is string => typeof item === 'string',
      )
      return messages.length ? [[key, messages.join('، ')]] : []
    }),
  )
}

export function errorMessage(error: unknown, fallback: string): string {
  const errors = fieldErrors(error)
  return errors.error || errors.detail || errors.non_field_errors || Object.values(errors).join('؛ ') || fallback
}
