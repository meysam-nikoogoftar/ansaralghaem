import { useEffect, useState } from 'react'
import { tripTimeline } from '../utils/tripTimeline'

export default function TripTimeline({ start, end }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])
  const timeline = tripTimeline(start, end, now)
  if (!timeline) return <div className="mt-itinerary-line" aria-hidden="true"><i/><span/><i/></div>
  const label = timeline.state === 'upcoming' ? `${timeline.days.toLocaleString('fa-IR')} روز تا آغاز سفر` : timeline.state === 'finished' ? 'سفر به پایان رسیده' : timeline.days === 0 ? 'روز پایانی سفر' : `${timeline.days.toLocaleString('fa-IR')} روز تا پایان سفر`
  return <div className="mt-time-progress" data-state={timeline.state}>
    <span>{label}</span>
    <progress max="100" value={timeline.percent} aria-label={`پیشرفت زمانی سفر؛ ${label}`} />
    <small>{timeline.state === 'ongoing' ? `${timeline.percent.toLocaleString('fa-IR')}٪ از زمان سفر سپری شده` : timeline.state === 'upcoming' ? 'هنوز آغاز نشده' : '۱۰۰٪'}</small>
  </div>
}
