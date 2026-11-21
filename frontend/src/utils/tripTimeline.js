const day = 86400000
export function tripTimeline(startDate, endDate, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const get = type => parts.find(part => part.type === type).value
  const today = Date.parse(`${get('year')}-${get('month')}-${get('day')}T00:00:00Z`)
  const start = Date.parse(`${startDate}T00:00:00Z`)
  const end = Date.parse(`${endDate}T00:00:00Z`)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null
  if (today < start) return { percent: 0, state: 'upcoming', days: Math.round((start - today) / day) }
  if (today > end) return { percent: 100, state: 'finished', days: 0 }
  return { percent: Math.round((today - start) / (end - start + day) * 100), state: 'ongoing', days: Math.round((end - today) / day) }
}
