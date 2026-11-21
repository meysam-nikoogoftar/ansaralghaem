function mediaPath(value: string | null | undefined, allowed: RegExp): string | null {
  if (!value || /[\\\u0000-\u001f]/u.test(value)) return null
  try {
    const path = new URL(value, 'https://media.invalid').pathname
    const decoded = decodeURIComponent(path)
    if (
      !decoded.startsWith('/media/') ||
      decoded.includes('..') ||
      decoded.includes('//') ||
      /[\\\u0000-\u001f]/u.test(decoded) ||
      /%25/i.test(path) ||
      !allowed.test(decoded)
    )
      return null
    // Never give the optimizer a user-controlled origin, credentials or query.
    return path
  } catch {
    return null
  }
}

export function safeMediaPath(value: string | null | undefined): string | null {
  return mediaPath(value, /\.(jpe?g|png|webp|gif|avif)$/i)
}

export function safeCommitmentPath(value: string | null | undefined): string | null {
  return mediaPath(value, /^\/media\/commitments\/[^/]+$/)
}

export function safeAparatLink(value: string | undefined): string | null {
  try {
    const url = new URL(value || '')
    return url.protocol === 'https:' &&
      ['aparat.com', 'www.aparat.com'].includes(url.hostname) &&
      !url.username &&
      !url.password
      ? url.href
      : null
  } catch {
    return null
  }
}

export function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('fa-IR', { timeZone: 'Asia/Tehran' }).format(date)
}
