const day = 86400000
export function tripTimeline(startDate?: string, endDate?: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value
  const today = Date.parse(`${get('year')}-${get('month')}-${get('day')}T00:00:00Z`)
  const start = Date.parse(`${startDate}T00:00:00Z`)
  const end = Date.parse(`${endDate}T00:00:00Z`)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null
  if (today < start)
    return { percent: 0, state: 'upcoming', days: Math.round((start - today) / day) }
  if (today > end) return { percent: 100, state: 'finished', days: 0 }
  return {
    percent: Math.round(((today - start) / (end - start + day)) * 100),
    state: 'ongoing',
    days: Math.round((end - today) / day),
  }
}

export function TripTimeline({ start, end }: { start?: string; end?: string }) {
  const timeline = tripTimeline(start, end)
  if (!timeline)
    return (
      <div className="mt-itinerary-line" aria-hidden="true">
        <i />
        <span />
        <i />
      </div>
    )
  const label =
    timeline.state === 'upcoming'
      ? `${timeline.days.toLocaleString('fa-IR')} روز تا آغاز سفر`
      : timeline.state === 'finished'
        ? 'سفر به پایان رسیده'
        : timeline.days === 0
          ? 'روز پایانی سفر'
          : `${timeline.days.toLocaleString('fa-IR')} روز تا پایان سفر`
  return (
    <div className="mt-time-progress" data-state={timeline.state}>
      <span>{label}</span>
      <progress max="100" value={timeline.percent} aria-label={`پیشرفت زمانی سفر؛ ${label}`} />
      <small>
        {timeline.state === 'ongoing'
          ? `${timeline.percent.toLocaleString('fa-IR')}٪ از زمان سفر سپری شده`
          : timeline.state === 'upcoming'
            ? 'هنوز آغاز نشده'
            : '۱۰۰٪'}
      </small>
    </div>
  )
}
