import { useState, useEffect } from 'react'
import api from '../services/api'

function Announcement() {
  const [announcements, setAnnouncements] = useState([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    api.get('/content/announcements/')
      .then(res => setAnnouncements(res.data))
      .catch(() => {})
  }, [])

  if (announcements.length === 0) return null

  const announcement = announcements[current]

  const typeConfig = {
    info: { accent: 'var(--teal-glow)' },
    warning: { accent: 'var(--status-warn)' },
    welcome: { accent: 'var(--teal-glow)' },
  }
  const config = typeConfig[announcement.announcement_type] || typeConfig.info

  return (
    <div className="an-bar" dir="rtl" style={{ borderBottomColor: config.accent }}>
      <div className="an-inner">
        <svg className="an-icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: config.accent }}><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7v1" /></svg>
        <p className="an-text" aria-live="polite">{announcement.text}</p>
        {announcements.length > 1 && (
          <div className="an-controls" role="group" aria-label="مرور اطلاعیه‌ها">
            <button type="button" aria-label="اطلاعیه قبلی" onClick={() => setCurrent(value => (value - 1 + announcements.length) % announcements.length)}>‹</button>
            <span className="an-counter">{current + 1}/{announcements.length}</span>
            <button type="button" aria-label="اطلاعیه بعدی" onClick={() => setCurrent(value => (value + 1) % announcements.length)}>›</button>
          </div>
        )}
      </div>

      <style>{`
        .an-bar {
          background: var(--bg-deep);
          border-bottom: 1px solid var(--line);
          border-bottom-width: 2px;
          padding: 9px 16px;
          position: relative;
          z-index: 60;
        }
        .an-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; gap: 10px;
        }
        .an-icon { flex-shrink: 0; font-size: 13px; }
        .an-text {
          flex: 1; text-align: center;
          color: var(--ink-dim);
          font-size: 12.5px;
        }
        .an-counter {
          flex-shrink: 0;
          color: var(--ink-faint);
          font-size: 11px;
        }
      `}</style>
    </div>
  )
}

export default Announcement
