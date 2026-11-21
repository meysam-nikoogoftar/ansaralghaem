export function fieldErrors(error) {
  const data = error?.response?.data ?? error
  if (!data || typeof data !== 'object' || data instanceof Error) return {}
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key,
    (Array.isArray(value) ? value : [value]).map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('، '),
  ]))
}

export function errorMessage(error, fallback = 'عملیات انجام نشد. اطلاعات را بررسی و دوباره تلاش کنید.') {
  const data = error?.response?.data ?? error
  if (typeof data === 'string') return data
  const errors = fieldErrors(error)
  return errors.error || errors.detail || errors.non_field_errors || Object.values(errors).join('؛ ') || fallback
}
